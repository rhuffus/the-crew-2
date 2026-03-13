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
      className="flex items-center gap-2 rounded border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground shadow-md"
    >
      <span className="flex-1">{error.message}</span>
      <button
        data-testid="mutation-error-dismiss"
        onClick={() => onDismiss(error.id)}
        className="ml-2 text-destructive-foreground/70 hover:text-destructive-foreground"
        aria-label="Dismiss error"
      >
        &times;
      </button>
    </div>
  )
}
