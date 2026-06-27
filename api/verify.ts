import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../server/cors'
import { generateToken, getRequiredEnv, isUserId, ServerConfigError } from '../server/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, 'POST', 'Content-Type')) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, passcode } = req.body ?? {}
  if (!userId || !passcode) {
    return res.status(400).json({ error: 'Missing userId or passcode' })
  }

  if (!isUserId(userId)) {
    return res.status(400).json({ error: 'Invalid userId' })
  }

  try {
    const expected = getRequiredEnv(userId === 'zuo' ? 'PASSCODE_ZUO' : 'PASSCODE_HUANG')

    if (passcode !== expected) {
      return res.status(401).json({ error: 'Wrong passcode' })
    }

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
