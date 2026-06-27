import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'
import { applyCors } from './_lib/cors.js'
import { getBearerUser, getRequiredEnv, ServerConfigError } from './_lib/auth.js'

const BUCKET = process.env.COS_BUCKET || 'heritage-1420709282'
const REGION = process.env.COS_REGION || 'ap-shanghai'

function generateCosSignedUrl(key: string, expireSeconds: number = 1800): string {
  const secretId = getRequiredEnv('COS_SECRET_ID')
  const secretKey = getRequiredEnv('COS_SECRET_KEY')
  const now = Math.floor(Date.now() / 1000)
  const exp = now + expireSeconds
  const keyTime = `${now};${exp}`

  const signKey = crypto.createHmac('sha1', secretKey).update(keyTime).digest('hex')

  const httpMethod = 'get'
  const httpUri = `/${key}`
  const httpParameters = ''
  const httpHeaders = ''

  const httpString = `${httpMethod}\n${httpUri}\n${httpParameters}\n${httpHeaders}\n`
  const sha1HttpString = crypto.createHash('sha1').update(httpString).digest('hex')

  const stringToSign = `sha1\n${keyTime}\n${sha1HttpString}\n`
  const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex')

  const authorization = [
    `q-sign-algorithm=sha1`,
    `q-ak=${secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=`,
    `q-url-param-list=`,
    `q-signature=${signature}`,
  ].join('&')

  const encodedKey = key.split('/').map(encodeURIComponent).join('/')
  return `https://${BUCKET}.cos.${REGION}.myqcloud.com/${encodedKey}?${authorization}`
}

function hasControlCharacter(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0)
    if (code <= 0x1F || code === 0x7F) return true
  }
  return false
}

export function isAllowedCosKey(key: string): boolean {
  if (key.length > 1024 || key.startsWith('/')) return false
  if (!key.startsWith('heritage/') && !key.startsWith('checkin/')) return false
  if (hasControlCharacter(key)) return false
  if (/[\\?#]/.test(key)) return false

  const segments = key.split('/')
  if (segments.some((segment) => segment.length === 0 || segment === '.' || segment.includes('..'))) {
    return false
  }

  return true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, 'GET, POST')) return

  const user = getBearerUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  // Single key mode: GET /api/cos-sign?key=heritage/故宫.png
  if (req.method === 'GET') {
    const key = Array.isArray(req.query.key) ? req.query.key[0] : req.query.key
    if (typeof key !== 'string' || !key) return res.status(400).json({ error: 'Missing key parameter' })

    if (!isAllowedCosKey(key)) {
      return res.status(403).json({ error: 'Forbidden path' })
    }

    try {
      const expireSeconds = key.startsWith('heritage/') ? 86400 : 1800 // 24h for heritage, 30min for checkin
      const signedUrl = generateCosSignedUrl(key, expireSeconds)
      res.setHeader('Cache-Control', `private, max-age=${Math.floor(expireSeconds * 0.8)}`)
      return res.status(200).json({ url: signedUrl })
    } catch (err) {
      if (err instanceof ServerConfigError) {
        return res.status(500).json({ error: 'Server is not configured' })
      }
      console.error('[cos-sign] sign error:', err)
      return res.status(500).json({ error: 'Failed to sign URL' })
    }
  }

  // Batch mode: POST /api/cos-sign with { keys: ["heritage/故宫.png", ...] }
  if (req.method === 'POST') {
    const { keys } = req.body ?? {}
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: 'Missing or empty keys array' })
    }
    if (keys.length > 200) {
      return res.status(400).json({ error: 'Too many keys (max 200)' })
    }

    const urls: Record<string, string> = {}
    try {
      const rejected: string[] = []
      for (const key of keys) {
        if (typeof key !== 'string' || !isAllowedCosKey(key)) {
          rejected.push(typeof key === 'string' ? key : String(key))
          continue
        }
        const expireSeconds = key.startsWith('heritage/') ? 86400 : 1800
        urls[key] = generateCosSignedUrl(key, expireSeconds)
      }

      if (rejected.length > 0) {
        return res.status(400).json({ error: 'Invalid COS key in batch', rejected })
      }
    } catch (err) {
      if (err instanceof ServerConfigError) {
        return res.status(500).json({ error: 'Server is not configured' })
      }
      console.error('[cos-sign] batch sign error:', err)
      return res.status(500).json({ error: 'Failed to sign URLs' })
    }

    res.setHeader('Cache-Control', 'private, max-age=1800')
    return res.status(200).json({ urls })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
