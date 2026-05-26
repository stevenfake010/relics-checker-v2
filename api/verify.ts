import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

// Passcodes stored in environment variables
// PASSCODE_ZUO=爱宝爱宝
// PASSCODE_HUANG=爱佑爱佑
const PASSCODES: Record<string, string | undefined> = {
  zuo: process.env.PASSCODE_ZUO,
  huang: process.env.PASSCODE_HUANG,
}

const SECRET = process.env.VERIFY_SECRET || 'relics-checker-v2-default-secret'

const ALLOWED_ORIGINS = [
  'https://ctecharena.top',
  'https://www.ctecharena.top',
  'http://localhost:5173',
  'http://localhost:3000',
]

function generateToken(userId: string): string {
  const payload = JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }) // 7 days
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return Buffer.from(payload).toString('base64') + '.' + hmac
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const [payloadB64, hmac] = token.split('.')
    if (!payloadB64 || !hmac) return null
    const payload = Buffer.from(payloadB64, 'base64').toString()
    const expectedHmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
    if (hmac !== expectedHmac) return null
    const data = JSON.parse(payload)
    if (data.exp < Date.now()) return null
    return { userId: data.userId }
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, passcode } = req.body ?? {}
  if (!userId || !passcode) {
    return res.status(400).json({ error: 'Missing userId or passcode' })
  }

  const expected = PASSCODES[userId]
  if (!expected) {
    return res.status(400).json({ error: 'Invalid userId' })
  }

  if (passcode !== expected) {
    return res.status(401).json({ error: 'Wrong passcode' })
  }

  const token = generateToken(userId)
  return res.status(200).json({ token, userId })
}
