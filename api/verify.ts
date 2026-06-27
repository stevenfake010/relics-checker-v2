import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'
import { applyCors } from './_lib/cors.js'
import { generateToken, getRequiredEnv, isUserId, ServerConfigError } from './_lib/auth.js'

const MAX_FAILED_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const failedAttempts = new Map<string, { count: number; resetAt: number }>()

function getHeaderValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function getClientIp(req: VercelRequest): string {
  const forwardedFor = getHeaderValue(req.headers['x-forwarded-for'])
  return forwardedFor.split(',')[0]?.trim() || getHeaderValue(req.headers['x-real-ip']) || 'unknown'
}

function pruneExpiredAttempts(now = Date.now()) {
  for (const [key, entry] of failedAttempts) {
    if (entry.resetAt <= now) failedAttempts.delete(key)
  }
}

function getRateLimitKey(req: VercelRequest, userId: string): string {
  return `${getClientIp(req)}:${userId}`
}

function isRateLimited(key: string, now = Date.now()): boolean {
  pruneExpiredAttempts(now)
  const entry = failedAttempts.get(key)
  return !!entry && entry.count >= MAX_FAILED_ATTEMPTS && entry.resetAt > now
}

function recordFailedAttempt(key: string, now = Date.now()) {
  pruneExpiredAttempts(now)
  const current = failedAttempts.get(key)
  if (!current || current.resetAt <= now) {
    failedAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return
  }
  failedAttempts.set(key, { count: current.count + 1, resetAt: current.resetAt })
}

function clearFailedAttempts(key: string) {
  failedAttempts.delete(key)
}

export function timingSafeStringEqual(input: unknown, expected: string): boolean {
  if (typeof input !== 'string') return false

  const inputBuffer = Buffer.from(input)
  const expectedBuffer = Buffer.from(expected)
  const length = Math.max(inputBuffer.length, expectedBuffer.length)
  const paddedInput = Buffer.alloc(length)
  const paddedExpected = Buffer.alloc(length)

  inputBuffer.copy(paddedInput)
  expectedBuffer.copy(paddedExpected)

  return inputBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(paddedInput, paddedExpected)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, 'POST', 'Content-Type')) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, passcode } = req.body ?? {}
  if (!userId || typeof passcode !== 'string' || passcode.length === 0) {
    return res.status(400).json({ error: 'Missing userId or passcode' })
  }

  if (!isUserId(userId)) {
    return res.status(400).json({ error: 'Invalid userId' })
  }

  try {
    const rateLimitKey = getRateLimitKey(req, userId)
    if (isRateLimited(rateLimitKey)) {
      return res.status(429).json({ error: 'Too many attempts, please try again later' })
    }

    const expected = getRequiredEnv(userId === 'zuo' ? 'PASSCODE_ZUO' : 'PASSCODE_HUANG')

    if (!timingSafeStringEqual(passcode, expected)) {
      recordFailedAttempt(rateLimitKey)
      return res.status(401).json({ error: 'Wrong passcode' })
    }

    clearFailedAttempts(rateLimitKey)
    const token = generateToken(userId)
    return res.status(200).json({ token, userId })
  } catch (err) {
    if (err instanceof ServerConfigError) {
      return res.status(500).json({ error: 'Server is not configured' })
    }
    console.error('[verify] unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
