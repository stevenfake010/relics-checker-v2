interface ErrorScreenProps {
  error?: Error | null
  onRetry?: () => void
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-paper)' }}
    >
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h2
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
        >
          出错了
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-mist)' }}>
          {error?.message ?? '发生了未知错误，请稍后重试。'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: 'var(--color-vermilion)' }}
          >
            重试
          </button>
        )}
      </div>
    </div>
  )
}
