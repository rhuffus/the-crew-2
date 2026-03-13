import type { RuntimeBadgeDto, RuntimeBadgeType } from '@the-crew/shared-types'

const BADGE_ICONS: Record<RuntimeBadgeType, string> = {
  running: '\u25CF',
  waiting: '\u25CB',
  blocked: '\u25A0',
  error: '\u26A0',
  queue: '\u2630',
  cost: '$',
}

const BADGE_COLORS: Record<RuntimeBadgeDto['severity'], string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
}

const PULSE_TYPES = new Set<RuntimeBadgeType>(['running', 'waiting'])

export function RuntimeBadges({ badges }: { badges: RuntimeBadgeDto[] }) {
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-0.5 mt-1" data-testid="runtime-badges">
      {badges.map((badge, idx) => (
        <span
          key={idx}
          data-testid={`runtime-badge-${badge.type}`}
          className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium leading-none ${BADGE_COLORS[badge.severity]}`}
        >
          <span className={PULSE_TYPES.has(badge.type) ? 'animate-pulse' : ''}>
            {BADGE_ICONS[badge.type]}
          </span>
          {badge.label}
        </span>
      ))}
    </div>
  )
}
