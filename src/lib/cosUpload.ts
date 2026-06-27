/**
 * Upload checkin photos to COS via STS temporary credentials.
 * Uses cos-js-sdk-v5 for reliable browser uploads.
 */
import COS from 'cos-js-sdk-v5'
import { getAuthToken } from './auth'
import { CLIENT_COS_BUCKET, CLIENT_COS_ORIGIN, CLIENT_COS_REGION } from './cosConfig'

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

const MAX_PHOTO_BYTES = 10 * 1024 * 1024

interface AllowedImageType {
  mimeType: string
  extension: string
}

function matches(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((value, index) => bytes[offset + index] === value)
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length))
}

function detectIsoImage(bytes: Uint8Array): AllowedImageType | null {
  if (bytes.length < 12 || ascii(bytes, 4, 4) !== 'ftyp') return null

  const brands = new Set(['heic', 'heix', 'hevc', 'hevx', 'heif', 'mif1', 'msf1'])
  for (let offset = 8; offset + 4 <= Math.min(bytes.length, 32); offset += 4) {
    if (brands.has(ascii(bytes, offset, 4))) {
      return { mimeType: 'image/heic', extension: 'heic' }
    }
  }

  return null
}

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read image bytes'))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image bytes'))
    reader.readAsArrayBuffer(blob)
  })
}

export async function detectAllowedImageType(file: File): Promise<AllowedImageType | null> {
  const bytes = new Uint8Array(await readBlobAsArrayBuffer(file.slice(0, 32)))

  if (matches(bytes, [0xFF, 0xD8, 0xFF])) return { mimeType: 'image/jpeg', extension: 'jpg' }
  if (matches(bytes, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return { mimeType: 'image/png', extension: 'png' }
  }
  if (matches(bytes, [0x47, 0x49, 0x46, 0x38])) return { mimeType: 'image/gif', extension: 'gif' }
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') {
    return { mimeType: 'image/webp', extension: 'webp' }
  }

  return detectIsoImage(bytes)
}

function generateKey(siteId: string, userId: string, ext: string): string {
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
  if (file.size > MAX_PHOTO_BYTES) throw new Error('Photo exceeds 10MB')

  const imageType = await detectAllowedImageType(file)
  if (!imageType) throw new Error('Unsupported image type')

  const key = generateKey(siteId, userId, imageType.extension)

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: CLIENT_COS_BUCKET,
        Region: CLIENT_COS_REGION,
        Key: key,
        Body: file,
        ContentType: imageType.mimeType,
        onProgress: (info) => {
          if (onProgress) onProgress(Math.round(info.percent * 100))
        },
      },
      (err) => {
        if (err) {
          reject(err)
        } else {
          const url = `${CLIENT_COS_ORIGIN}${key}`
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
    cos.deleteObject({ Bucket: CLIENT_COS_BUCKET, Region: CLIENT_COS_REGION, Key: key }, (err) => {
      if (!err || err.statusCode === 404 || err.code === 'NoSuchKey') {
        resolve()
      } else {
        reject(err)
      }
    })
  })
}

function extractUploadedPhotoKey(url: string): string | null {
  if (url.startsWith(CLIENT_COS_ORIGIN)) {
    return decodeURIComponent(url.slice(CLIENT_COS_ORIGIN.length).split('?')[0])
  }
  if (url.startsWith('checkin/')) return url
  return null
}
