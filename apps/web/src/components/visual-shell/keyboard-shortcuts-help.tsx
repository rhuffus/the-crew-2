import { useRef } from 'react'
import { X } from 'lucide-react'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useFocusTrap } from '@/hooks/use-focus-trap'

interface ShortcutEntry {
  keys: string
  description: string
}

const SHORTCUT_SECTIONS: { title: string; shortcuts: ShortcutEntry[] }[] = [
  {
    title: 'Creation',
    shortcuts: [
      { keys: 'N', description: 'Open node palette' },
      { keys: 'E', description: 'Open relationship palette' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'Enter', description: 'Drill into selected node' },
      { keys: 'Escape', description: 'Cancel / clear / drill out' },
      { keys: 'Tab', description: 'Next node' },
      { keys: 'Shift + Tab', description: 'Previous node' },
      { keys: 'F', description: 'Fit view' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: 'Ctrl + Z', description: 'Undo' },
      { keys: 'Ctrl + Shift + Z', description: 'Redo' },
      { keys: 'Ctrl + A', description: 'Select all' },
      { keys: 'Delete', description: 'Delete selected edge' },
    ],
  },
  {
    title: 'Panels & View',
    shortcuts: [
      { keys: 'Ctrl + Shift + E', description: 'Toggle explorer' },
      { keys: 'Ctrl + Shift + I', description: 'Toggle inspector' },
      { keys: '[', description: 'Collapse selected node' },
      { keys: ']', description: 'Expand selected node' },
      { keys: 'Ctrl + [', description: 'Collapse all' },
      { keys: 'Ctrl + ]', description: 'Expand all' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: '?', description: 'Toggle this help' },
    ],
  },
]

export function KeyboardShortcutsHelp() {
  const showKeyboardHelp = useVisualWorkspaceStore((s) => s.showKeyboardHelp)
  const dismissKeyboardHelp = useVisualWorkspaceStore((s) => s.dismissKeyboardHelp)
  const dialogRef = useRef<HTMLDivElement>(null)

  useFocusTrap(dialogRef, showKeyboardHelp)

  if (!showKeyboardHelp) return null

  return (
    <div
      data-testid="keyboard-shortcuts-help"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismissKeyboardHelp()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        className="max-h-[80vh] w-[480px] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h2>
          <button
            type="button"
            aria-label="Close"
            data-testid="close-keyboard-help"
            onClick={dismissKeyboardHelp}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {SHORTCUT_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-foreground">{shortcut.description}</span>
                  <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
