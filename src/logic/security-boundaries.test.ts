import { afterEach, describe, expect, it } from 'vitest'
import { isAllowedCosKey } from '../../api/cos-sign.js'
import { resolveCosAppId } from '../../api/cos-sts.js'
import { timingSafeStringEqual } from '../../api/verify.js'
import { detectAllowedImageType } from '../lib/cosUpload'

const ORIGINAL_COS_APP_ID = process.env.COS_APP_ID

afterEach(() => {
  if (ORIGINAL_COS_APP_ID === undefined) {
    delete process.env.COS_APP_ID
  } else {
    process.env.COS_APP_ID = ORIGINAL_COS_APP_ID
  }
})

describe('isAllowedCosKey', () => {
  it.each([
    'heritage/故宫.png',
    'heritage/“天地之中”历史建筑群.png',
    'checkin/zuo/relic_1/123.jpg',
  ])('accepts scoped key %s', (key) => {
    expect(isAllowedCosKey(key)).toBe(true)
  })

  it.each([
    '../secret.jpg',
    '/heritage/故宫.png',
    'heritage/../secret.jpg',
    'heritage//故宫.png',
    'heritage/evil\nheader.jpg',
    'heritage/evil?download=1',
    'heritage/evil#fragment',
    'checkin\\zuo\\photo.jpg',
  ])('rejects unsafe key %s', (key) => {
    expect(isAllowedCosKey(key)).toBe(false)
  })
})

describe('resolveCosAppId', () => {
  it('uses an explicit COS_APP_ID when configured', () => {
    process.env.COS_APP_ID = '1234567890'

    expect(resolveCosAppId('custom-bucket')).toBe('1234567890')
  })

  it('falls back to the numeric suffix in a standard bucket name', () => {
    delete process.env.COS_APP_ID

    expect(resolveCosAppId('heritage-1420709282')).toBe('1420709282')
  })

  it('fails loudly for non-standard buckets without COS_APP_ID', () => {
    delete process.env.COS_APP_ID

    expect(() => resolveCosAppId('heritage')).toThrow('COS_APP_ID')
  })
})

describe('timingSafeStringEqual', () => {
  it('accepts exact matches and rejects different values', () => {
    expect(timingSafeStringEqual('passcode', 'passcode')).toBe(true)
    expect(timingSafeStringEqual('passcodf', 'passcode')).toBe(false)
    expect(timingSafeStringEqual('passcode-extra', 'passcode')).toBe(false)
    expect(timingSafeStringEqual(1234, '1234')).toBe(false)
  })
})

describe('detectAllowedImageType', () => {
  it('recognizes jpeg magic bytes', async () => {
    const file = new File([new Uint8Array([0xFF, 0xD8, 0xFF, 0x00])], 'photo.jpg', {
      type: 'image/jpeg',
    })

    await expect(detectAllowedImageType(file)).resolves.toEqual({ mimeType: 'image/jpeg', extension: 'jpg' })
  })

  it('rejects svg text even when the file type claims image/svg+xml', async () => {
    const file = new File(['<svg><script>alert(1)</script></svg>'], 'photo.svg', {
      type: 'image/svg+xml',
    })

    await expect(detectAllowedImageType(file)).resolves.toBeNull()
  })
})
