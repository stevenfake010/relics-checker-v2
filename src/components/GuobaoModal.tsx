import { useEffect, useState, useRef } from 'react'
import type { GuobaoSite } from '../data/guobao'
import { useIdentity, USER_CONFIGS } from '../contexts/IdentityContext'
import { useGuobaoCheckins, useGuobaoCheckinSet, useToggleGuobaoCheckin, GUOBAO_CHECKINS_KEY } from '../hooks/useGuobaoCheckins'
import { Avatar } from './Avatar'
import { PhotoLightbox } from './PhotoLightbox'
import { SignedImage } from './SignedImage'
import { uploadCheckinPhoto } from '../lib/cosUpload'
import { addGuobaoCheckin, updateGuobaoCheckinPhoto, deleteGuobaoCheckinPhoto } from '../lib/guobaoQueries'
import { useQueryClient } from '@tanstack/react-query'

interface GuobaoModalProps {
  site: GuobaoSite | null
  onClose: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  古建筑: { bg: '#FFF0E5', fg: '#A23B2C' },
  古遗址: { bg: '#E8F5E9', fg: '#2E7D32' },
  古墓葬: { bg: '#EDE7F6', fg: '#5E35B1' },
  石窟寺: { bg: '#FFF8E1', fg: '#F57F17' },
  '石刻及其他': { bg: '#E3F2FD', fg: '#1565C0' },
}

export function GuobaoModal({ site, onClose }: GuobaoModalProps) {
  const { currentUser } = useIdentity()
  const checkinSet = useGuobaoCheckinSet()
  const { data: checkins } = useGuobaoCheckins()
  const { mutate: toggleCheckin } = useToggleGuobaoCheckin()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setUploading(false)
    setUploadProgress(0)
    setLightboxSrc(null)
  }, [site?.id])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !lightboxSrc) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, lightboxSrc])

  if (!site) return null

  const checkedA = checkinSet.has(`zuo:${site.id}`)
  const checkedB = checkinSet.has(`huang:${site.id}`)
  const catColor = CATEGORY_COLORS[site.category] ?? CATEGORY_COLORS['古建筑']

  const siteCheckins = (checkins ?? []).filter((c) => c.site_id === site.id && c.photo_url)
  const myCheckin = currentUser
    ? (checkins ?? []).find((c) => c.site_id === site.id && c.user_id === currentUser)
    : null
  const myPhoto = myCheckin?.photo_url

  const handleToggle = () => {
    if (!currentUser) return
    const checked = checkinSet.has(`${currentUser}:${site.id}`)
    toggleCheckin({ userId: currentUser, siteId: site.id, checked })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser || !site) return
    if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return }
    if (file.size > 10 * 1024 * 1024) { alert('图片不能超过 10MB'); return }

    setUploading(true)
    setUploadProgress(0)
    try {
      const url = await uploadCheckinPhoto(file, `guobao_${site.id}`, currentUser, setUploadProgress)
      if (!checkinSet.has(`${currentUser}:${site.id}`)) {
        await addGuobaoCheckin(currentUser, site.id, url)
      } else {
        await updateGuobaoCheckinPhoto(currentUser, site.id, url)
      }
      queryClient.invalidateQueries({ queryKey: GUOBAO_CHECKINS_KEY })
    } catch (err) {
      console.error('Upload failed:', err)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async () => {
    if (!currentUser || !site || !myPhoto) return
    if (!confirm('确定要删除这张打卡照片吗？')) return
    setDeleting(true)
    try {
      await deleteGuobaoCheckinPhoto(currentUser, site.id)
      queryClient.invalidateQueries({ queryKey: GUOBAO_CHECKINS_KEY })
    } catch (err) {
      console.error('Delete failed:', err)
      alert('删除失败，请重试')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(26,20,16,0.6)' }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg rounded-xl p-6 relative max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-modal)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
            style={{ color: 'var(--color-mist)' }}
          >
            ✕
          </button>

          <div className="mb-1 text-xs" style={{ color: 'var(--color-mist)' }}>
            编号 {site.id} · 第{site.batch === 1 ? '一' : '二'}批
          </div>

          <h2
            className="text-xl font-bold mb-1 pr-8"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            {site.name}
          </h2>

          <p className="text-sm mb-4" style={{ color: 'var(--color-mist)' }}>
            📍 {site.province} · {site.city}
          </p>

          <div className="flex gap-2 flex-wrap mb-6">
            <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: catColor.bg, color: catColor.fg }}>
              {site.category}
            </span>
            <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-mist)' }}>
              {site.era}
            </span>
          </div>

          {/* Dual status */}
          <div
            className="flex items-center justify-between p-4 rounded-lg mb-4"
            style={{ backgroundColor: 'var(--color-surface-alt)' }}
          >
            {(['zuo', 'huang'] as const).map((uid) => {
              const cfg = USER_CONFIGS[uid]
              const checked = uid === 'zuo' ? checkedA : checkedB
              return (
                <div key={uid} className="flex items-center gap-2">
                  <Avatar user={cfg} size={36} active={checked} dimWhenInactive />
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'var(--color-ink)' }}>{cfg.label}</div>
                    <div className="text-xs" style={{ color: checked ? cfg.color : 'var(--color-mist)' }}>
                      {checked ? '已打卡 ✓' : '未打卡'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Photos */}
          {siteCheckins.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-serif)' }}>
                📸 打卡照片
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {siteCheckins.map((c) => {
                  const cfg = USER_CONFIGS[c.user_id as keyof typeof USER_CONFIGS]
                  const isMyPhoto = c.user_id === currentUser
                  return (
                    <div key={`${c.user_id}-${c.site_id}`} className="relative rounded-lg overflow-hidden">
                      <SignedImage
                        src={c.photo_url!}
                        alt={`${cfg?.label ?? c.user_id} 的打卡照片`}
                        className="w-full aspect-square object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxSrc(c.photo_url!)}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 px-2 py-1 flex items-center gap-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                      >
                        {cfg && <Avatar user={cfg} size={18} active />}
                        <span className="text-xs text-white flex-1">{cfg?.label ?? c.user_id}</span>
                        {isMyPhoto && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto() }}
                            disabled={deleting}
                            className="text-xs text-white/70 hover:text-red-400 transition-colors"
                          >
                            {deleting ? '...' : '🗑'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {currentUser ? (
              <>
                <button
                  onClick={handleToggle}
                  className="w-full py-3 rounded-lg font-medium text-sm transition-all"
                  style={{
                    backgroundColor: checkinSet.has(`${currentUser}:${site.id}`) ? 'var(--color-surface-alt)' : 'var(--color-vermilion)',
                    color: checkinSet.has(`${currentUser}:${site.id}`) ? 'var(--color-vermilion)' : '#fff',
                    border: '1px solid var(--color-vermilion)',
                  }}
                >
                  {checkinSet.has(`${currentUser}:${site.id}`)
                    ? `✓ 已打卡（${USER_CONFIGS[currentUser].label}）— 点击取消`
                    : `打卡 — ${USER_CONFIGS[currentUser].label}`}
                </button>

                <button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="w-full py-3 rounded-lg font-medium text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    color: 'var(--color-ink)',
                    border: '1px solid var(--color-border)',
                    opacity: uploading ? 0.7 : 1,
                  }}
                >
                  {uploading ? `📤 上传中 ${uploadProgress}%` : myPhoto ? '📷 更换打卡照片' : '📷 上传打卡照片'}
                </button>

                {uploading && (
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                    <div className="h-full transition-all duration-300" style={{ width: `${uploadProgress}%`, backgroundColor: 'var(--color-vermilion)' }} />
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </>
            ) : (
              <p className="text-sm text-center" style={{ color: 'var(--color-mist)' }}>请先选择身份才能打卡</p>
            )}
          </div>
        </div>
      </div>

      {lightboxSrc && <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </>
  )
}
