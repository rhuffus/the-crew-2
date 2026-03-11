import { AlertTriangle } from 'lucide-react'

/**
 * Visible disclaimer shown in dev mode to remind users that all state is
 * in-memory and ephemeral. Renders nothing in production builds.
 */
export function DevModeBanner() {
  if (!import.meta.env.DEV) return null

  return (
    <div
      data-testid="dev-mode-banner"
      className="flex items-center justify-center gap-1.5 bg-amber-100 px-3 py-1 text-[11px] text-amber-800 border-b border-amber-200"
    >
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>Dev mode — all data is in-memory and resets on service restart</span>
    </div>
  )
}
