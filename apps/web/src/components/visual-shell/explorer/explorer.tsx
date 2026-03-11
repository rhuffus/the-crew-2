import { PanelLeft, TreesIcon, Layers, ShieldCheck, Filter, Bookmark, MessageSquare, Activity } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { EntityTree } from './entity-tree'
import { LayersPanel } from './layers-panel'
import { ValidationSummary } from './validation-summary'
import { FilterPanel } from './filter-panel'
import { SavedViewsPanel } from './saved-views-panel'
import { ChatThreadsPanel } from './chat-threads-panel'
import { OperationsPanel } from './operations-panel'

type ExplorerTab = 'tree' | 'layers' | 'filters' | 'views' | 'validation' | 'chat' | 'operations'

const tabs: { id: ExplorerTab; icon: typeof TreesIcon; label: string }[] = [
  { id: 'tree', icon: TreesIcon, label: 'Entity Tree' },
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'filters', icon: Filter, label: 'Filters' },
  { id: 'views', icon: Bookmark, label: 'Saved Views' },
  { id: 'validation', icon: ShieldCheck, label: 'Validation' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'operations', icon: Activity, label: 'Operations' },
]

export function Explorer() {
  const [activeTab, setActiveTab] = useState<ExplorerTab>('tree')
  const { explorerCollapsed, toggleExplorer, validationIssues, projectId, showOperationsOverlay, operationsStatus, focusNode } =
    useVisualWorkspaceStore()

  const errorCount = validationIssues.filter((i) => i.severity === 'error').length
  const warningCount = validationIssues.filter((i) => i.severity === 'warning').length

  if (explorerCollapsed) {
    return (
      <div
        data-testid="explorer-collapsed"
        className="flex w-12 flex-col items-center border-r border-border bg-card py-2"
      >
        <button
          type="button"
          aria-label="Expand explorer"
          onClick={toggleExplorer}
          className="rounded p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-label={tab.label}
            title={tab.label}
            onClick={() => {
              setActiveTab(tab.id)
              toggleExplorer()
            }}
            className={cn(
              'mt-1 rounded p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              activeTab === tab.id && 'bg-accent text-accent-foreground',
            )}
          >
            <tab.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div data-testid="explorer" className="flex h-full w-full min-w-0 flex-col overflow-hidden border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <button
          type="button"
          aria-label="Collapse explorer"
          onClick={toggleExplorer}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>
      <div className="flex border-b border-border" role="tablist" aria-label="Explorer tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`explorer-tabpanel-${tab.id}`}
            id={`explorer-tab-${tab.id}`}
            aria-label={tab.label}
            title={tab.label}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              activeTab === tab.id && 'border-b-2 border-primary text-foreground',
            )}
          >
            <tab.icon className="mx-auto h-4 w-4" />
          </button>
        ))}
      </div>
      <div
        className="flex-1 overflow-y-auto"
        role="tabpanel"
        id={`explorer-tabpanel-${activeTab}`}
        aria-labelledby={`explorer-tab-${activeTab}`}
      >
        {activeTab === 'tree' && <EntityTree />}
        {activeTab === 'layers' && <LayersPanel />}
        {activeTab === 'filters' && <FilterPanel />}
        {activeTab === 'views' && <SavedViewsPanel />}
        {activeTab === 'validation' && (
          <ValidationSummary
            errors={errorCount}
            warnings={warningCount}
            projectId={projectId ?? undefined}
          />
        )}
        {activeTab === 'chat' && <ChatThreadsPanel projectId={projectId ?? undefined} />}
        {activeTab === 'operations' && (
          <OperationsPanel
            projectId={projectId ?? ''}
            operationsStatus={showOperationsOverlay ? operationsStatus : null}
            onFocusNode={focusNode}
          />
        )}
      </div>
    </div>
  )
}
