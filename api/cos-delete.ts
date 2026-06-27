import type { VercelRequest, VercelResponse } from '@vercel/node'
import COS from 'cos-js-sdk-v5'
import { applyCors } from './_lib/cors.js'
import { getBearerUser, getRequiredEnv, type UserId, ServerConfigError } from './_lib/auth.js'

const BUCKET = process.env.COS_BUCKET || 'heritage-1420709282'
const REGION = process.env.COS_REGION || 'ap-shanghai'
const COS_ORIGIN = `https://${BUCKET}.cos.${REGION}.myqcloud.com/`

type DeleteBody = {
  key?: unknown
  url?: unknown
}

function parseBody(req: VercelRequest): DeleteBody {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as DeleteBody
    } catch {
      return {}
    }
  }
  return req.body as DeleteBody
}

function extractKey(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.startsWith(COS_ORIGIN)) {
    return decodeURIComponent(value.slice(COS_ORIGIN.length).split('?')[0])
  }
  return value
}

function isAllowedDeleteKey(key: string, userId: UserId): boolean {
  if (key.length > 1024 || key.startsWith('/') || key.includes('..')) return false
  return key.startsWith(`checkin/${userId}/`)
}

function isMissingObjectError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const maybeStatus = err as { statusCode?: unknown; code?: unknown }
  return maybeStatus.statusCode === 404 || maybeStatus.code === 'NoSuchKey'
}

function deleteObject(key: string): Promise<void> {
  const cos = new COS({
    SecretId: getRequiredEnv('COS_SECRET_ID'),
    SecretKey: getRequiredEnv('COS_SECRET_KEY'),
  })

  return new Promise((resolve, reject) => {
    cos.deleteObject({ Bucket: BUCKET, Region: REGION, Key: key }, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, 'POST')) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = getBearerUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const body = parseBody(req)
  const key = extractKey(body.key ?? body.url)
  if (!key) return res.status(400).json({ error: 'Missing key or url' })
  if (!isAllowedDeleteKey(key, user.userId)) return res.status(403).json({ error: 'Forbidden path' })

  try {
    await deleteObject(key)
    return res.status(200).json({ ok: true })
  } catch (err) {
    if (isMissingObjectError(err)) return res.status(200).json({ ok: true })
    if (err instanceof ServerConfigError) {
      return res.status(500).json({ error: 'Server is not configured' })
    }
    console.error('[cos-delete] delete error:', err)
    return res.status(500).json({ error: 'Failed to delete object' })
  }
}
