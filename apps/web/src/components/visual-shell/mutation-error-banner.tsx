import { useEffect, useState } from 'react'

export interface MutationError {
  id: string
  message: string
  timestamp: number
}

interface MutationErrorBannerProps {
  errors: MutationError[]
  onDismiss: (id: string) => void
}

const AUTO_DISMISS_MS = 5000

export function MutationErrorBanner({ errors, onDismiss }: MutationErrorBannerProps) {
  if (errors.length === 0) return null

  return (
    <div
      data-testid="mutation-error-banner"
      className="absolute bottom-16 right-4 z-50 flex flex-col gap-2"
    >
      {errors.map((err) => (
        <ErrorToast key={err.id} error={err} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ErrorToast({ error, onDismiss }: { error: MutationError; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss(error.id)
    }, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [error.id, onDismiss])

  if (!visible) return null

  return (
    <div
      data-testid="mutation-error-toast"
      className="flex items-center gap-2 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800 shadow-md dark:border-red-800 dark:bg-red-950 dark:text-red-200"
    >
      <span className="flex-1">{error.message}</span>
      <button
        data-testid="mutation-error-dismiss"
        onClick={() => onDismiss(error.id)}
        className="ml-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-100"
        aria-label="Dismiss error"
      >
        &times;
      </button>
    </div>
  )
}
