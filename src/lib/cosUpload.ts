/**
 * Upload checkin photos to COS via STS temporary credentials.
 * Uses cos-js-sdk-v5 for reliable browser uploads.
 */
import COS from 'cos-js-sdk-v5'
import { getAuthToken } from './auth'

const cos = new COS({
  getAuthorization: async (_options, callback) => {
    const authToken = getAuthToken() ?? ''
    const resp = await fetch('/api/cos-sts', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!resp.ok) throw new Error(`STS request failed: ${resp.status}`)
    const data = await resp.json()
    callback({
      TmpSecretId: data.credentials.tmpSecretId,
      TmpSecretKey: data.credentials.tmpSecretKey,
      SecurityToken: data.credentials.sessionToken,
      StartTime: data.startTime,
      ExpiredTime: data.expiredTime,
    })
  },
})

const BUCKET = 'heritage-1420709282'
const REGION = 'ap-shanghai'
const COS_ORIGIN = `https://${BUCKET}.cos.${REGION}.myqcloud.com/`

function generateKey(siteId: string, userId: string, file: File): string {
  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const ext = /^[a-z0-9]+$/.test(rawExt) ? rawExt : 'jpg'
  const safeSiteId = siteId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const ts = Date.now()
  return `checkin/${userId}/${safeSiteId}/${ts}.${ext}`
}

export async function uploadCheckinPhoto(
  file: File,
  siteId: string,
  userId: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const key = generateKey(siteId, userId, file)

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Body: file,
        onProgress: (info) => {
          if (onProgress) onProgress(Math.round(info.percent * 100))
        },
      },
      (err) => {
        if (err) {
          reject(err)
        } else {
          const url = `https://${BUCKET}.cos.${REGION}.myqcloud.com/${key}`
          resolve(url)
        }
      }
    )
  })
}

export async function deleteCheckinPhotoObject(url: string): Promise<void> {
  const key = extractUploadedPhotoKey(url)
  if (!key) throw new Error('Invalid photo URL')

  return new Promise((resolve, reject) => {
    cos.deleteObject({ Bucket: BUCKET, Region: REGION, Key: key }, (err) => {
      if (!err || err.statusCode === 404 || err.code === 'NoSuchKey') {
        resolve()
      } else {
        reject(err)
      }
    })
  })
}

function extractUploadedPhotoKey(url: string): string | null {
  if (url.startsWith(COS_ORIGIN)) {
    return decodeURIComponent(url.slice(COS_ORIGIN.length).split('?')[0])
  }
  if (url.startsWith('checkin/')) return url
  return null
}
