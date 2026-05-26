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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

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
