import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NodeStatus } from '@the-crew/shared-types'
import { GitBranch, AlertCircle, AlertTriangle } from 'lucide-react'

interface WorkflowStageData {
  label: string
  sublabel: string | null
  status: NodeStatus
  validationCount?: number
  [key: string]: unknown
}

const STATUS_RING: Record<NodeStatus, string> = {
  normal: 'ring-blue-200',
  warning: 'ring-yellow-400',
  error: 'ring-red-400',
  dimmed: 'ring-slate-200 opacity-50',
}

function WorkflowStageNodeComponent({ data }: NodeProps) {
  const stageData = data as unknown as WorkflowStageData
  const ringClass = STATUS_RING[stageData.status] ?? STATUS_RING.normal

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-blue-400" />
      <div
        data-testid="workflow-stage-node"
        className={`relative flex flex-col items-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 shadow-sm ring-2 ${ringClass} min-w-[140px]`}
      >
        <GitBranch className="h-5 w-5 text-blue-500" />
        <div className="mt-2 text-sm font-semibold text-blue-800 text-center leading-tight">
          {stageData.label}
        </div>
        {stageData.sublabel && (
          <div className="mt-1 text-xs text-blue-500 text-center leading-tight max-w-[160px]">
            {stageData.sublabel}
          </div>
        )}
        {stageData.status === 'error' && (
          <div
            data-testid="validation-badge-error"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow"
            title={stageData.validationCount ? `${stageData.validationCount} error(s)` : 'Validation error'}
          >
            <AlertCircle className="h-3 w-3 text-white" />
          </div>
        )}
        {stageData.status === 'warning' && (
          <div
            data-testid="validation-badge-warning"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 shadow"
            title={stageData.validationCount ? `${stageData.validationCount} warning(s)` : 'Validation warning'}
          >
            <AlertTriangle className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-blue-400" />
    </>
  )
}

export const WorkflowStageNode = memo(WorkflowStageNodeComponent)
