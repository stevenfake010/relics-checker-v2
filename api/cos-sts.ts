import type { VercelRequest, VercelResponse } from '@vercel/node'
import STS from 'qcloud-cos-sts'

const config = {
  secretId: process.env.COS_SECRET_ID!,
  secretKey: process.env.COS_SECRET_KEY!,
  bucket: process.env.COS_BUCKET || 'heritage-1420709282',
  region: process.env.COS_REGION || 'ap-shanghai',
  allowPrefix: 'checkin/*',
  durationSeconds: 1800, // 30 min
}

const ALLOWED_ORIGINS = [
  'https://ctecharena.top',
  'https://www.ctecharena.top',
  'http://localhost:5173',
  'http://localhost:3000',
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS - restrict to allowed origins
  const origin = req.headers.origin ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Rate limit: only allow GET
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const appId = config.bucket.split('-').pop()
    const policy = {
      version: '2.0',
      statement: [
        {
          action: ['name/cos:PutObject', 'name/cos:PostObject'],
          effect: 'allow',
          resource: [
            `qcs::cos:${config.region}:uid/${appId}:${config.bucket}/${config.allowPrefix}`,
          ],
        },
      ],
    }

    const data = await STS.getCredential({
      secretId: config.secretId,
      secretKey: config.secretKey,
      durationSeconds: config.durationSeconds,
      policy,
    })

    res.status(200).json({
      credentials: data.credentials,
      startTime: data.startTime,
      expiredTime: data.expiredTime,
      bucket: config.bucket,
      region: config.region,
    })
  } catch (err) {
    console.error('STS error:', err)
    res.status(500).json({ error: 'Failed to get temporary credentials' })
  }
}
