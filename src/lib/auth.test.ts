import { beforeEach, describe, expect, it } from 'vitest'
import { clearAuthToken, hasValidTokenForUser, setAuthToken } from './auth'

function makeToken(userId: string, exp: number): string {
  return `${btoa(JSON.stringify({ userId, exp }))}.signature`
}

describe('hasValidTokenForUser', () => {
  beforeEach(() => {
    clearAuthToken()
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
