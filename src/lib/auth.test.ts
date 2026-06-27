import crypto from 'crypto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clearAuthToken, hasValidTokenForUser, setAuthToken } from './auth'
import { generateToken, verifyToken } from '../../api/_lib/auth.js'

const ORIGINAL_VERIFY_SECRET = process.env.VERIFY_SECRET
const TEST_VERIFY_SECRET = 'test-verify-secret'

function makeToken(userId: string, exp: number): string {
  return `${btoa(JSON.stringify({ userId, exp }))}.signature`
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', TEST_VERIFY_SECRET).update(payload).digest('hex')
}

describe('hasValidTokenForUser', () => {
  beforeEach(() => {
    process.env.VERIFY_SECRET = TEST_VERIFY_SECRET
    clearAuthToken()
  })

  afterEach(() => {
    if (ORIGINAL_VERIFY_SECRET === undefined) {
      delete process.env.VERIFY_SECRET
    } else {
      process.env.VERIFY_SECRET = ORIGINAL_VERIFY_SECRET
    }
  })

  it('accepts a non-expired token for the current identity', () => {
    setAuthToken(makeToken('zuo', Date.now() + 60_000))

    expect(hasValidTokenForUser('zuo')).toBe(true)
  })

  it('rejects a token issued for another identity', () => {
    setAuthToken(makeToken('zuo', Date.now() + 60_000))

    expect(hasValidTokenForUser('huang')).toBe(false)
  })

  it('rejects an expired token', () => {
    setAuthToken(makeToken('zuo', Date.now() - 1))

    expect(hasValidTokenForUser('zuo')).toBe(false)
  })
})

describe('verifyToken', () => {
  beforeEach(() => {
    process.env.VERIFY_SECRET = TEST_VERIFY_SECRET
  })

  afterEach(() => {
    if (ORIGINAL_VERIFY_SECRET === undefined) {
      delete process.env.VERIFY_SECRET
    } else {
      process.env.VERIFY_SECRET = ORIGINAL_VERIFY_SECRET
    }
  })

  it('accepts a valid signed token', () => {
    const token = generateToken('zuo')

    expect(verifyToken(token)).toEqual({ userId: 'zuo' })
  })

  it('rejects a tampered payload', () => {
    const token = generateToken('zuo')
    const [, hmac] = token.split('.')
    const tamperedPayload = Buffer.from(JSON.stringify({ userId: 'huang', exp: Date.now() + 60_000 })).toString('base64')

    expect(verifyToken(`${tamperedPayload}.${hmac}`)).toBeNull()
  })

  it('rejects a tampered hmac', () => {
    const token = generateToken('zuo')
    const [payload, hmac] = token.split('.')

    expect(verifyToken(`${payload}.${hmac.replace(/^./, hmac[0] === '0' ? '1' : '0')}`)).toBeNull()
  })

  it('rejects an expired token', () => {
    const payload = JSON.stringify({ userId: 'zuo', exp: Date.now() - 1 })
    const token = `${Buffer.from(payload).toString('base64')}.${signPayload(payload)}`

    expect(verifyToken(token)).toBeNull()
  })
})
