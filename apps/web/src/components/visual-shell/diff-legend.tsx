const LEGEND_ITEMS = [
  { status: 'added', color: 'bg-green-500', label: 'Added' },
  { status: 'removed', color: 'bg-red-500', label: 'Removed' },
  { status: 'modified', color: 'bg-amber-500', label: 'Modified' },
  { status: 'unchanged', color: 'bg-gray-300', label: 'Unchanged' },
] as const

export function DiffLegend() {
  return (
    <div
      data-testid="diff-legend"
      className="absolute bottom-4 left-4 z-10 rounded-lg border border-border bg-card/95 px-3 py-2 shadow-md backdrop-blur-sm"
    >
      <div className="flex flex-col gap-1">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${item.color}`} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
