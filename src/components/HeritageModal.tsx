import { useEffect, useState, useRef } from 'react'
import type { HeritageSite } from '../data/heritage'
import { useIdentity, USER_CONFIGS } from '../contexts/IdentityContext'
import { useHeritageCheckins, useToggleHeritageCheckin, HERITAGE_CHECKINS_KEY } from '../hooks/useHeritageCheckins'
import { useHeritageCheckinSet } from '../hooks/useHeritageCheckins'
import { Avatar } from './Avatar'
import { PhotoLightbox } from './PhotoLightbox'
import { SignedImage } from './SignedImage'
import { uploadCheckinPhoto } from '../lib/cosUpload'
import { addHeritageCheckin, updateHeritageCheckinPhoto, deleteHeritageCheckinPhoto } from '../lib/heritageQueries'
import { useQueryClient } from '@tanstack/react-query'

interface HeritageModalProps {
  site: HeritageSite | null
  onClose: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  文化遗产: { bg: '#FFF0E5', fg: '#A23B2C' },
  自然遗产: { bg: '#E8F5E9', fg: '#2E7D32' },
  混合遗产: { bg: '#EDE7F6', fg: '#5E35B1' },
}

export function HeritageModal({ site, onClose }: HeritageModalProps) {
  const { currentUser } = useIdentity()
  const checkinSet = useHeritageCheckinSet()
  const { data: checkins } = useHeritageCheckins()
  const { mutate: toggleCheckin, isPending: toggling } = useToggleHeritageCheckin()
  const queryClient = useQueryClient()
  const [imgError, setImgError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImgError(false)
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
  const catColor = CATEGORY_COLORS[site.category] ?? CATEGORY_COLORS['文化遗产']

  // Get photos for this site
  const siteCheckins = (checkins ?? []).filter((c) => c.site_id === site.id && c.photo_url)

  // Current user's photo
  const myCheckin = currentUser
    ? (checkins ?? []).find((c) => c.site_id === site.id && c.user_id === currentUser)
    : null
  const myPhoto = myCheckin?.photo_url

  const handleToggle = () => {
    if (!currentUser || toggling) return
    const checked = checkinSet.has(`${currentUser}:${site.id}`)
    toggleCheckin({ userId: currentUser, itemId: site.id, checked })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser || !site) return

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('图片不能超过 10MB')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const url = await uploadCheckinPhoto(file, site.id, currentUser, setUploadProgress)

      if (!checkinSet.has(`${currentUser}:${site.id}`)) {
        await addHeritageCheckin(currentUser, site.id, url)
      } else {
        await updateHeritageCheckinPhoto(currentUser, site.id, url)
      }
      queryClient.invalidateQueries({ queryKey: HERITAGE_CHECKINS_KEY })
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
      await deleteHeritageCheckinPhoto(currentUser, site.id, myPhoto)
      queryClient.invalidateQueries({ queryKey: HERITAGE_CHECKINS_KEY })
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
        className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4"
        style={{ backgroundColor: 'rgba(26,20,16,0.6)' }}
        onClick={onClose}
      >
        <div
          className="w-full h-full sm:h-auto sm:max-w-lg sm:rounded-xl overflow-hidden relative sm:max-h-[92vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-modal)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div
            className="relative w-full h-56"
            style={{ backgroundColor: 'var(--color-surface-alt)' }}
          >
            {!imgError ? (
              <SignedImage
                src={site.imageUrl}
                alt={site.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center"
                style={{ backgroundColor: catColor.bg, color: catColor.fg }}
              >
                <div className="text-5xl mb-2">🏛️</div>
                <div className="text-sm font-medium px-4 text-center" style={{ fontFamily: 'var(--font-serif)' }}>
                  {site.name}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            >
              ✕
            </button>

            <div
              className="absolute bottom-3 left-3 px-2.5 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
              列入：{site.yearInscribed} 年
            </div>
          </div>

          <div className="p-6">
            <h2
              className="text-xl font-bold leading-snug mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              {site.name}
            </h2>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: catColor.bg, color: catColor.fg }}
              >
                {site.category}
              </span>
              <span className="text-sm" style={{ color: 'var(--color-mist)' }}>
                📍 {site.province}
              </span>
            </div>

            <p
              className="text-sm leading-relaxed mb-6 italic"
              style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-serif)' }}
            >
              {site.description}
            </p>

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
                      <div className="text-xs font-medium" style={{ color: 'var(--color-ink)' }}>
                        {cfg.label}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: checked ? cfg.color : 'var(--color-mist)' }}
                      >
                        {checked ? '已访问 ✓' : '未访问'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Checkin photos */}
            {siteCheckins.length > 0 && (
              <div className="mb-4">
                <h3
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-serif)' }}
                >
                  📸 打卡照片
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {siteCheckins.map((c) => {
                    const cfg = USER_CONFIGS[c.user_id as keyof typeof USER_CONFIGS]
                    const isMyPhoto = c.user_id === currentUser
                    return (
                      <div key={`${c.user_id}-${c.site_id}`} className="relative rounded-lg overflow-hidden group">
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
                          <span className="text-xs text-white flex-1">
                            {cfg?.label ?? c.user_id}
                          </span>
                          {isMyPhoto && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePhoto()
                              }}
                              disabled={deleting}
                              className="text-xs text-white/70 hover:text-red-400 transition-colors"
                              title="删除照片"
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

            {/* Action buttons */}
            <div className="space-y-2">
              {currentUser ? (
                <>
                  <button
                    onClick={handleToggle}
                    disabled={toggling}
                    className="w-full py-3 rounded-lg font-medium text-sm transition-all"
                    style={{
                      backgroundColor: checkinSet.has(`${currentUser}:${site.id}`)
                        ? 'var(--color-surface-alt)'
                        : 'var(--color-vermilion)',
                      color: checkinSet.has(`${currentUser}:${site.id}`)
                        ? 'var(--color-vermilion)'
                        : '#fff',
                      border: `1px solid var(--color-vermilion)`,
                      cursor: toggling ? 'wait' : 'pointer',
                      opacity: toggling ? 0.75 : 1,
                    }}
                  >
                    {toggling
                      ? '处理中...'
                      : checkinSet.has(`${currentUser}:${site.id}`)
                      ? `✓ 已访问（${USER_CONFIGS[currentUser].label}）— 点击取消`
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
                    {uploading
                      ? `📤 上传中 ${uploadProgress}%`
                      : myPhoto
                        ? '📷 更换打卡照片'
                        : '📷 上传打卡照片'}
                  </button>

                  {uploading && (
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-surface-alt)' }}
                    >
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${uploadProgress}%`,
                          backgroundColor: 'var(--color-vermilion)',
                        }}
                      />
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </>
              ) : (
                <p className="text-sm text-center" style={{ color: 'var(--color-mist)' }}>
                  请先选择身份才能打卡
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo lightbox */}
      {lightboxSrc && (
        <PhotoLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  )
}
