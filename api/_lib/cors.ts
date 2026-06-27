import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_ORIGINS = [
  'https://ctecharena.top',
  'https://www.ctecharena.top',
  'http://localhost:5173',
  'http://localhost:3000',
]

export function applyCors(
  req: VercelRequest,
  res: VercelResponse,
  methods: string,
  headers = 'Content-Type, Authorization'
): boolean {
  const origin = req.headers.origin ?? ''
  if (typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', `${methods}, OPTIONS`)
  res.setHeader('Access-Control-Allow-Headers', headers)
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }

  return false
}
