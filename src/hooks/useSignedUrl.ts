import { useState, useEffect } from 'react'
import { getAuthToken } from '../lib/auth'
import { CLIENT_COS_ORIGIN } from '../lib/cosConfig'

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>()

export async function fetchSignedUrl(key: string): Promise<string> {
  const cached = signedUrlCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url
  }

  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const resp = await fetch(`/api/cos-sign?key=${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!resp.ok) throw new Error(`Failed to sign: ${resp.status}`)
  const { url } = await resp.json()

  // Cache with 80% of expected TTL
  const ttl = key.startsWith('heritage/') ? 86400 * 0.8 : 1800 * 0.8
  signedUrlCache.set(key, { url, expiresAt: Date.now() + ttl * 1000 })

  return url
}

export async function fetchSignedUrls(keys: string[]): Promise<Record<string, string>> {
  // Filter out already cached
  const uncached: string[] = []
  const result: Record<string, string> = {}

  for (const key of keys) {
    const cached = signedUrlCache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      result[key] = cached.url
    } else {
      uncached.push(key)
    }
  }

  if (uncached.length === 0) return result

  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const resp = await fetch('/api/cos-sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ keys: uncached }),
  })

  if (!resp.ok) throw new Error(`Failed to batch sign: ${resp.status}`)
  const { urls } = await resp.json()

  for (const [key, url] of Object.entries(urls as Record<string, string>)) {
    const ttl = key.startsWith('heritage/') ? 86400 * 0.8 : 1800 * 0.8
    signedUrlCache.set(key, { url, expiresAt: Date.now() + ttl * 1000 })
    result[key] = url
  }

  return result
}

// Extract COS key from a full URL or return as-is if already a key
export function extractCosKey(url: string): string | null {
  if (url.startsWith(CLIENT_COS_ORIGIN)) {
    return decodeURIComponent(url.slice(CLIENT_COS_ORIGIN.length).split('?')[0])
  }
  if (url.startsWith('heritage/') || url.startsWith('checkin/')) {
    return url
  }
  return null
}

// Hook: returns signed URL for a single COS key/URL
export function useSignedUrl(urlOrKey: string | null | undefined): string | null {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!urlOrKey) {
      setSignedUrl(null)
      return
    }

    const key = extractCosKey(urlOrKey)
    if (!key) {
      // Not a COS URL, use as-is
      setSignedUrl(urlOrKey)
      return
    }

    let cancelled = false
    fetchSignedUrl(key)
      .then((url) => { if (!cancelled) setSignedUrl(url) })
      .catch(() => {
        signedUrlCache.delete(key)
        if (!cancelled) setSignedUrl(null)
      })
    return () => { cancelled = true }
  }, [urlOrKey])

  return signedUrl
}
