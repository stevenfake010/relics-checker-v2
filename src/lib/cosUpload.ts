/**
 * Upload checkin photos to COS via STS temporary credentials.
 * Uses cos-js-sdk-v5 for reliable browser uploads.
 */
import COS from 'cos-js-sdk-v5'

const cos = new COS({
  getAuthorization: async (_options, callback) => {
    const resp = await fetch('/api/cos-sts')
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

function generateKey(siteId: string, userId: string, file: File): string {
  const ext = file.name.split('.').pop() || 'jpg'
  const ts = Date.now()
  return `checkin/${siteId}/${userId}_${ts}.${ext}`
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
      (err, _data) => {
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
