/**
 * Auth token helpers.
 *
 * The token is issued by /api/verify as `base64(payload).hmac`, where payload
 * is `{ userId, exp }` (exp is epoch milliseconds). The HMAC can only be
 * verified server-side (needs VERIFY_SECRET), so on the client we just do a
 * lightweight structural + expiry check to decide whether to show the app or
 * force the user back through passcode verification.
 *
 * This is intentionally NOT a security boundary — the real check happens in the
 * API routes. It only prevents the "selected identity but no/expired token"
 * ghost state that silently breaks every signed image with 401s.
 */

const TOKEN_KEY = 'auth_token'

export interface TokenPayload {
  userId: string
  exp: number // epoch ms
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/** Decode the payload without verifying the HMAC (client-side display logic only). */
export function decodeTokenPayload(token: string | null): TokenPayload | null {
  if (!token) return null
  try {
    const [payloadB64] = token.split('.')
    if (!payloadB64) return null
    const json = atob(payloadB64)
    const data = JSON.parse(json) as Partial<TokenPayload>
    if (typeof data.userId !== 'string' || typeof data.exp !== 'number') return null
    return { userId: data.userId, exp: data.exp }
  } catch {
    return null
  }
}

/** True only when a token exists, is well-formed, and is not expired. */
export function hasValidToken(): boolean {
  const payload = decodeTokenPayload(getAuthToken())
  if (!payload) return false
  return payload.exp > Date.now()
}

/** The authenticated userId from the token, or null. */
export function getAuthedUserId(): string | null {
  const payload = decodeTokenPayload(getAuthToken())
  if (!payload || payload.exp <= Date.now()) return null
  return payload.userId
}
