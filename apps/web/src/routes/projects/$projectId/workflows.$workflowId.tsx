import { useCallback, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { NodeType } from '@the-crew/shared-types'
import { VisualShell } from '@/components/visual-shell/visual-shell'
import { WorkflowCanvas } from '@/components/visual-shell/workflow-canvas'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useValidations } from '@/hooks/use-validations'
import { useVisualGraph } from '@/hooks/use-visual-graph'
import { useEntityMutation } from '@/hooks/use-entity-mutation'
import { useCanvasKeyboard } from '@/hooks/use-canvas-keyboard'

export const Route = createFileRoute('/projects/$projectId/workflows/$workflowId')({
  component: WorkflowCanvasPage,
})

function WorkflowCanvasPage() {
  const { projectId, workflowId } = Route.useParams()
  const navigate = useNavigate()
  const { setView, setProjectId, setValidationIssues, setBreadcrumb, setGraphNodes, setGraphEdges } = useVisualWorkspaceStore()

  useEffect(() => {
    setView('workflow', workflowId)
    setProjectId(projectId)
  }, [setView, setProjectId, workflowId, projectId])

  // Fetch graph to get breadcrumb data
  const { data: graph } = useVisualGraph(projectId, 'L3', workflowId)

  // Sync breadcrumb from graph response to store
  useEffect(() => {
    if (graph?.breadcrumb) {
      setBreadcrumb(graph.breadcrumb)
    }
  }, [graph, setBreadcrumb])

  const { data: validationResult } = useValidations(projectId)

  useEffect(() => {
    setValidationIssues(validationResult?.issues ?? [])
  }, [validationResult, setValidationIssues])

  // Sync graph nodes to store for keyboard navigation (Tab cycling)
  useEffect(() => {
    if (graph) {
      setGraphNodes(graph.nodes)
      setGraphEdges(graph.edges)
    }
  }, [graph, setGraphNodes, setGraphEdges])

  // L3 is max depth — no drill-in from here
  const handleDrillIn = useCallback(() => {
    // no-op: workflow-stage nodes are not drillable
  }, [])

  // Escape with no selection: navigate up to parent department or org
  const handleDrillOut = useCallback(() => {
    const state = useVisualWorkspaceStore.getState()
    const entry = state.popNavigation()

    // Trigger drill-out transition animation
    state.startTransition('drill-out', entry?.focusNodeId ?? workflowId)

    if (entry?.view === 'department' && entry.entityId) {
      navigate({
        to: '/projects/$projectId/departments/$departmentId',
        params: { projectId, departmentId: entry.entityId },
      })
    } else {
      navigate({
        to: '/projects/$projectId/org',
        params: { projectId },
      })
    }
  }, [navigate, projectId, workflowId])

  useCanvasKeyboard({ onDrillIn: handleDrillIn, onDrillOut: handleDrillOut })

  const { updateEntity } = useEntityMutation(projectId)

  const handleNodeUpdate = useCallback(
    (entityId: string, nodeType: NodeType, patch: Record<string, string>) => {
      updateEntity(entityId, nodeType, patch)
    },
    [updateEntity],
  )

  return (
    <VisualShell onNodeUpdate={handleNodeUpdate}>
      <WorkflowCanvas projectId={projectId} workflowId={workflowId} />
    </VisualShell>
  )
}
