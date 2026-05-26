import { useEffect, useState, useRef } from 'react'
import type { Relic } from '../data/types'
import { ERA_LABELS, CAT_LABELS } from '../data/meta'
import { useIdentity, USER_CONFIGS } from '../contexts/IdentityContext'
import { useCheckins, useCheckinSet, useToggleCheckin, CHECKINS_KEY } from '../hooks/useCheckins'
import { Avatar } from './Avatar'
import { PhotoLightbox } from './PhotoLightbox'
import { SignedImage } from './SignedImage'
import { uploadCheckinPhoto } from '../lib/cosUpload'
import { updateCheckinPhoto, deleteCheckinPhoto } from '../lib/queries'
import { useQueryClient } from '@tanstack/react-query'

interface RelicModalProps {
  relic: Relic | null
  onClose: () => void
}

export function RelicModal({ relic, onClose }: RelicModalProps) {
  const { currentUser } = useIdentity()
  const checkinSet = useCheckinSet()
  const { data: checkins } = useCheckins()
  const { mutate: toggleCheckin } = useToggleCheckin()
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
  }, [relic?.id])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !lightboxSrc) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, lightboxSrc])

  if (!relic) return null

  const checkedA = checkinSet.has(`zuo:${relic.id}`)
  const checkedB = checkinSet.has(`huang:${relic.id}`)

  // Photos for this relic
  const relicCheckins = (checkins ?? []).filter((c) => c.relic_id === relic.id && c.photo_url)

  // Current user's photo
  const myCheckin = currentUser
    ? (checkins ?? []).find((c) => c.relic_id === relic.id && c.user_id === currentUser)
    : null
  const myPhoto = myCheckin?.photo_url

  const handleToggle = () => {
    if (!currentUser) return
    const checked = checkinSet.has(`${currentUser}:${relic.id}`)
    toggleCheckin({ userId: currentUser, relicId: relic.id, checked })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser || !relic) return

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
      // Use relic_ prefix for relic photos to distinguish from heritage
      const url = await uploadCheckinPhoto(file, `relic_${relic.id}`, currentUser, setUploadProgress)

      // If not checked in yet, do a checkin first
      if (!checkinSet.has(`${currentUser}:${relic.id}`)) {
        toggleCheckin({ userId: currentUser, relicId: relic.id, checked: false })
      }

      await updateCheckinPhoto(currentUser, relic.id, url)
      queryClient.invalidateQueries({ queryKey: CHECKINS_KEY })
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
    if (!currentUser || !relic || !myPhoto) return
    if (!confirm('确定要删除这张打卡照片吗？')) return

    setDeleting(true)
    try {
      await deleteCheckinPhoto(currentUser, relic.id)
      queryClient.invalidateQueries({ queryKey: CHECKINS_KEY })
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
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-modal)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
            style={{ color: 'var(--color-mist)' }}
          >
            ✕
          </button>

          {/* ID badge */}
          <div className="mb-1 text-xs" style={{ color: 'var(--color-mist)' }}>
            No. {relic.id}
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold mb-1 pr-8"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            {relic.name}
          </h2>

          {/* Location */}
          <p className="text-sm mb-4" style={{ color: 'var(--color-mist)' }}>
            📍 {relic.location}
          </p>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-4">
            <Tag>{ERA_LABELS[relic.era]}</Tag>
            <Tag>{CAT_LABELS[relic.cat]}</Tag>
            {relic.noPublicDisplay && <Tag accent>暂不公开展出</Tag>}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-ink)' }}>
            {relic.desc}
          </p>

          {/* Exhibitions */}
          {relic.exhibitions && relic.exhibitions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--color-mist)' }}>
                展览记录
              </h3>
              <ul className="space-y-1">
                {relic.exhibitions.map((ex, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--color-ink)' }}>
                    <span style={{ color: 'var(--color-mist)' }}>
                      {ex.year === '常设' ? '常设' : ex.year + '年'}
                    </span>
                    <span>{ex.venue}</span>
                    <span style={{ color: 'var(--color-mist)' }}>·</span>
                    <span style={{ color: 'var(--color-mist)' }}>{ex.show}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dual Seal Status */}
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
                    <div className="text-xs" style={{ color: checked ? cfg.color : 'var(--color-mist)' }}>
                      {checked ? '已打卡 ✓' : '未打卡'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Checkin photos */}
          {relicCheckins.length > 0 && (
            <div className="mb-4">
              <h3
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-serif)' }}
              >
                📸 打卡照片
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {relicCheckins.map((c) => {
                  const cfg = USER_CONFIGS[c.user_id as keyof typeof USER_CONFIGS]
                  const isMyPhoto = c.user_id === currentUser
                  return (
                    <div key={`${c.user_id}-${c.relic_id}`} className="relative rounded-lg overflow-hidden group">
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
                  className="w-full py-3 rounded-lg font-medium text-sm transition-all"
                  style={{
                    backgroundColor: checkinSet.has(`${currentUser}:${relic.id}`)
                      ? 'var(--color-surface-alt)'
                      : 'var(--color-vermilion)',
                    color: checkinSet.has(`${currentUser}:${relic.id}`)
                      ? 'var(--color-vermilion)'
                      : '#fff',
                    border: `1px solid var(--color-vermilion)`,
                  }}
                >
                  {checkinSet.has(`${currentUser}:${relic.id}`)
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

function Tag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-xs"
      style={{
        backgroundColor: accent ? '#FFF3CD' : 'var(--color-surface-alt)',
        color: accent ? '#856404' : 'var(--color-mist)',
      }}
    >
      {children}
    </span>
  )
}
