import type { VercelRequest } from '@vercel/node'
import crypto from 'crypto'

export type UserId = 'zuo' | 'huang'

export const USER_IDS: UserId[] = ['zuo', 'huang']

export class ServerConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerConfigError'
  }
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new ServerConfigError(`Missing required environment variable: ${name}`)
  }
  return value
}

function getVerifySecret(): string {
  return getRequiredEnv('VERIFY_SECRET')
}

export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && USER_IDS.includes(value as UserId)
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', getVerifySecret()).update(payload).digest('hex')
}

function safeEqualHex(left: string, right: string): boolean {
  try {
    const leftBuffer = Buffer.from(left, 'hex')
    const rightBuffer = Buffer.from(right, 'hex')
    return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
  } catch {
    return false
  }
}

export function generateToken(userId: UserId): string {
  const payload = JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  return `${Buffer.from(payload).toString('base64')}.${signPayload(payload)}`
}

export function verifyToken(token: string): { userId: UserId } | null {
  try {
    const [payloadB64, hmac] = token.split('.')
    if (!payloadB64 || !hmac) return null

    const payload = Buffer.from(payloadB64, 'base64').toString()
    if (!safeEqualHex(hmac, signPayload(payload))) return null

    const data = JSON.parse(payload) as { userId?: unknown; exp?: unknown }
    if (!isUserId(data.userId)) return null
    if (typeof data.exp !== 'number' || data.exp <= Date.now()) return null

    return { userId: data.userId }
  } catch {
    return null
  }
}

export function getBearerUser(req: VercelRequest): { userId: UserId } | null {
  const authHeader = req.headers.authorization ?? ''
  const token = Array.isArray(authHeader) ? authHeader[0] : authHeader
  return verifyToken(token.replace(/^Bearer\s+/i, ''))
}
