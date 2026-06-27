import type { VercelRequest, VercelResponse } from '@vercel/node'
import STS from 'qcloud-cos-sts'
import { applyCors } from './_lib/cors.js'
import { getBearerUser, getRequiredEnv, ServerConfigError } from './_lib/auth.js'

const config = {
  bucket: process.env.COS_BUCKET || 'heritage-1420709282',
  region: process.env.COS_REGION || 'ap-shanghai',
  durationSeconds: 1800, // 30 min
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, 'GET')) return

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const user = getBearerUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const appId = config.bucket.split('-').pop()
    const allowPrefix = `checkin/${user.userId}/*`
    const policy = {
      version: '2.0',
      statement: [
        {
          action: ['name/cos:PutObject', 'name/cos:PostObject', 'name/cos:DeleteObject'],
          effect: 'allow',
          resource: [
            `qcs::cos:${config.region}:uid/${appId}:${config.bucket}/${allowPrefix}`,
          ],
          condition: {
            numeric_less_than_equal: {
              'cos:content-length': 10 * 1024 * 1024,
            },
          },
        },
      ],
    }

    const data = await STS.getCredential({
      secretId: getRequiredEnv('COS_SECRET_ID'),
      secretKey: getRequiredEnv('COS_SECRET_KEY'),
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
    if (err instanceof ServerConfigError) {
      return res.status(500).json({ error: 'Server is not configured' })
    }
    console.error('STS error:', err)
    res.status(500).json({ error: 'Failed to get temporary credentials' })
  }
}
