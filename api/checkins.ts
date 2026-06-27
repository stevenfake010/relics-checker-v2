import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../server/cors'
import { getBearerUser, ServerConfigError, type UserId } from '../server/auth'
import { createSupabaseAdmin } from '../server/supabaseAdmin'
import { getCheckinTable, normalizeItemId } from '../server/checkinTables'

const COS_BUCKET = process.env.COS_BUCKET || 'heritage-1420709282'
const COS_REGION = process.env.COS_REGION || 'ap-shanghai'
const COS_ORIGIN = `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/`

type RequestBody = {
  table?: unknown
  itemId?: unknown
  photoUrl?: unknown
}

function parseBody(req: VercelRequest): RequestBody {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as RequestBody
    } catch {
      return {}
    }
  }
  return req.body as RequestBody
}

function getTableParam(req: VercelRequest, body: RequestBody): unknown {
  return body.table ?? req.query.table
}

function isAllowedPhotoUrl(value: unknown, userId: UserId): value is string | null {
  if (value === null) return true
  if (typeof value !== 'string') return false
  if (!value.startsWith(`${COS_ORIGIN}checkin/${userId}/`)) return false
  return value.length <= 2048
}

function handleError(err: unknown, res: VercelResponse) {
  if (err instanceof ServerConfigError || err instanceof Error) {
    if (err.message.startsWith('Missing required environment variable')) {
      return res.status(500).json({ error: 'Server is not configured' })
    }
  }
  console.error('[checkins] unexpected error:', err)
  return res.status(500).json({ error: 'Internal server error' })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, 'GET, POST, PATCH, DELETE')) return

  const user = getBearerUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const body = parseBody(req)
  const config = getCheckinTable(getTableParam(req, body))
  if (!config) return res.status(400).json({ error: 'Invalid checkin table' })

  try {
    const supabase = createSupabaseAdmin()

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from(config.table)
        .select(config.select)
        .order('checked_at', { ascending: false })

      if (error) return res.status(500).json({ error: 'Failed to fetch checkins' })
      return res.status(200).json({ data: data ?? [] })
    }

    const itemId = normalizeItemId(config, body.itemId ?? req.query.itemId)
    if (itemId === null) return res.status(400).json({ error: 'Invalid itemId' })

    if (req.method === 'POST') {
      const row: Record<string, unknown> = {
        user_id: user.userId,
        [config.idColumn]: itemId,
      }

      if (body.photoUrl !== undefined) {
        if (!config.supportsPhoto) return res.status(400).json({ error: 'Photos are not supported for this table' })
        if (!isAllowedPhotoUrl(body.photoUrl, user.userId)) {
          return res.status(400).json({ error: 'Invalid photoUrl' })
        }
        row.photo_url = body.photoUrl
      }

      const { data, error } = await supabase
        .from(config.table)
        .upsert(row, { onConflict: `user_id,${config.idColumn}` })
        .select(config.select)
        .single()

      if (error) return res.status(500).json({ error: 'Failed to save checkin' })
      return res.status(200).json({ data })
    }

    if (req.method === 'PATCH') {
      if (!config.supportsPhoto) return res.status(400).json({ error: 'Photos are not supported for this table' })
      if (!isAllowedPhotoUrl(body.photoUrl, user.userId)) {
        return res.status(400).json({ error: 'Invalid photoUrl' })
      }

      const { error } = await supabase
        .from(config.table)
        .update({ photo_url: body.photoUrl })
        .eq('user_id', user.userId)
        .eq(config.idColumn, itemId)

      if (error) return res.status(500).json({ error: 'Failed to update photo' })
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq('user_id', user.userId)
        .eq(config.idColumn, itemId)

      if (error) return res.status(500).json({ error: 'Failed to remove checkin' })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return handleError(err, res)
  }
}
