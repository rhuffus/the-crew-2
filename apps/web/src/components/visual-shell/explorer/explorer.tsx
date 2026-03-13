import { PanelLeft, TreesIcon, Layers, ShieldCheck, Filter, Bookmark, MessageSquare, Activity, Clock, MessageSquarePlus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { EntityTree } from './entity-tree'
import { OverlaysPanel } from './overlays-panel'
import { ValidationSummary } from './validation-summary'
import { FilterPanel } from './filter-panel'
import { SavedViewsPanel } from './saved-views-panel'
import { ChatThreadsPanel } from './chat-threads-panel'
import { OperationsPanel } from './operations-panel'
import { TimelinePanel } from './timeline-panel'
import { ProposalsPanel } from './proposals-panel'

type ExplorerTab = 'tree' | 'overlays' | 'filters' | 'views' | 'validation' | 'chat' | 'operations' | 'timeline' | 'proposals'

const tabConfig: { id: ExplorerTab; icon: typeof TreesIcon; labelKey: string }[] = [
  { id: 'tree', icon: TreesIcon, labelKey: 'tab.tree' },
  { id: 'overlays', icon: Layers, labelKey: 'tab.overlays' },
  { id: 'filters', icon: Filter, labelKey: 'tab.filters' },
  { id: 'views', icon: Bookmark, labelKey: 'tab.views' },
  { id: 'validation', icon: ShieldCheck, labelKey: 'tab.validation' },
  { id: 'chat', icon: MessageSquare, labelKey: 'tab.chat' },
  { id: 'operations', icon: Activity, labelKey: 'tab.operations' },
  { id: 'timeline', icon: Clock, labelKey: 'tab.timeline' },
  { id: 'proposals', icon: MessageSquarePlus, labelKey: 'tab.proposals' },
]

export function Explorer() {
  const [activeTab, setActiveTab] = useState<ExplorerTab>('tree')
  const explorerCollapsed = useVisualWorkspaceStore((s) => s.explorerCollapsed)
  const toggleExplorer = useVisualWorkspaceStore((s) => s.toggleExplorer)
  const validationIssues = useVisualWorkspaceStore((s) => s.validationIssues)
  const projectId = useVisualWorkspaceStore((s) => s.projectId)
  const showOperationsOverlay = useVisualWorkspaceStore((s) => s.showOperationsOverlay)
  const operationsStatus = useVisualWorkspaceStore((s) => s.operationsStatus)
  const focusNode = useVisualWorkspaceStore((s) => s.focusNode)
  const { t } = useTranslation('explorer')

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
          aria-label={t('expand')}
          onClick={toggleExplorer}
          className="rounded p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-label={t(tab.labelKey)}
            title={t(tab.labelKey)}
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
          {t('title')}
        </span>
        <button
          type="button"
          aria-label={t('collapse')}
          onClick={toggleExplorer}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>
      <div className="flex border-b border-border" role="tablist" aria-label="Explorer tabs">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`explorer-tabpanel-${tab.id}`}
            id={`explorer-tab-${tab.id}`}
            aria-label={t(tab.labelKey)}
            title={t(tab.labelKey)}
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
        {activeTab === 'overlays' && <OverlaysPanel />}
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
        {activeTab === 'timeline' && <TimelinePanel />}
        {activeTab === 'proposals' && <ProposalsPanel />}
      </div>
    </div>
  )
}
