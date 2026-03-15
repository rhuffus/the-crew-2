import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ThinkingBubbleProps {
  startTime: number
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export function ThinkingBubble({ startTime }: ThinkingBubbleProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <div
      data-testid="thinking-bubble"
      className="flex flex-col gap-1 items-start"
    >
      <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-muted text-foreground">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="text-xs">
            Thinking... {elapsed >= 1000 && formatElapsed(elapsed)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ThinkingDurationBadge({ durationMs }: { durationMs: number }) {
  return (
    <div
      data-testid="thinking-duration"
      className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground/60"
    >
      <span>&#10003;</span>
      <span>Thought for {formatElapsed(durationMs)}</span>
    </div>
  )
}
