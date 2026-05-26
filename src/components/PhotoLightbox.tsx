import { useEffect } from 'react'
import { useSignedUrl } from '../hooks/useSignedUrl'

interface PhotoLightboxProps {
  src: string
  alt?: string
  onClose: () => void
}

export function PhotoLightbox({ src, alt, onClose }: PhotoLightboxProps) {
  const signedSrc = useSignedUrl(src)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
      >
        ✕
      </button>
      {signedSrc ? (
        <img
          src={signedSrc}
          alt={alt ?? '照片预览'}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="text-white text-sm">加载中...</div>
      )}
    </div>
  )
}
