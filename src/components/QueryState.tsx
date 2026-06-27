interface QueryStateProps {
  isLoading: boolean
  isError: boolean
  error: unknown
  loadingText?: string
  errorTitle?: string
  onRetry?: () => void
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return '请检查网络或稍后重试'
}

export function QueryState({
  isLoading,
  isError,
  error,
  loadingText = '正在读取打卡数据...',
  errorTitle = '打卡数据读取失败',
  onRetry,
}: QueryStateProps) {
  if (!isLoading && !isError) return null

  return (
    <div
      className="rounded-lg border p-6 text-center"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {isLoading ? (
        <p className="text-sm" style={{ color: 'var(--color-mist)' }}>
          {loadingText}
        </p>
      ) : (
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-medium" style={{ color: 'var(--color-ink)' }}>
              {errorTitle}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-mist)' }}>
              {getErrorMessage(error)}
            </p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded text-sm"
              style={{ backgroundColor: 'var(--color-vermilion)', color: '#fff' }}
            >
              重新加载
            </button>
          )}
        </div>
      )}
    </div>
  )
}
