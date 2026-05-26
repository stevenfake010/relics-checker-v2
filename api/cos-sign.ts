import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

const SECRET_ID = process.env.COS_SECRET_ID!
const SECRET_KEY = process.env.COS_SECRET_KEY!
const BUCKET = 'heritage-1420709282'
const REGION = 'ap-shanghai'
const VERIFY_SECRET = process.env.VERIFY_SECRET || 'relics-checker-v2-default-secret'

const ALLOWED_ORIGINS = [
  'https://ctecharena.top',
  'https://www.ctecharena.top',
  'http://localhost:5173',
  'http://localhost:3000',
]

function verifyToken(token: string): { userId: string } | null {
  try {
    const [payloadB64, hmac] = token.split('.')
    if (!payloadB64 || !hmac) return null
    const payload = Buffer.from(payloadB64, 'base64').toString()
    const expectedHmac = crypto.createHmac('sha256', VERIFY_SECRET).update(payload).digest('hex')
    if (hmac !== expectedHmac) return null
    const data = JSON.parse(payload)
    if (data.exp < Date.now()) return null
    return { userId: data.userId }
  } catch {
    return null
  }
}

function generateCosSignedUrl(key: string, expireSeconds: number = 1800): string {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + expireSeconds
  const keyTime = `${now};${exp}`

  const signKey = crypto.createHmac('sha1', SECRET_KEY).update(keyTime).digest('hex')

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
    `q-ak=${SECRET_ID}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=`,
    `q-url-param-list=`,
    `q-signature=${signature}`,
  ].join('&')

  return `https://${BUCKET}.cos.${REGION}.myqcloud.com/${encodeURI(key)}?${authorization}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Vary', 'Origin')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Verify auth token
  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const user = verifyToken(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Single key mode: GET /api/cos-sign?key=heritage/故宫.png
  if (req.method === 'GET') {
    const key = req.query.key as string
    if (!key) return res.status(400).json({ error: 'Missing key parameter' })

    // Only allow heritage/ and checkin/ paths
    if (!key.startsWith('heritage/') && !key.startsWith('checkin/')) {
      return res.status(403).json({ error: 'Forbidden path' })
    }

    const expireSeconds = key.startsWith('heritage/') ? 86400 : 1800 // 24h for heritage, 30min for checkin
    const signedUrl = generateCosSignedUrl(key, expireSeconds)
    res.setHeader('Cache-Control', `private, max-age=${Math.floor(expireSeconds * 0.8)}`)
    return res.status(200).json({ url: signedUrl })
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
    for (const key of keys) {
      if (typeof key !== 'string') continue
      if (!key.startsWith('heritage/') && !key.startsWith('checkin/')) continue
      const expireSeconds = key.startsWith('heritage/') ? 86400 : 1800
      urls[key] = generateCosSignedUrl(key, expireSeconds)
    }

    res.setHeader('Cache-Control', 'private, max-age=1800')
    return res.status(200).json({ urls })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
