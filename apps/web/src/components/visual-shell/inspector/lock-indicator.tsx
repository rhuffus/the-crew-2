import { Lock, Unlock } from 'lucide-react'
import type { NodeType } from '@the-crew/shared-types'
import { useLockByEntity, useAcquireLock, useReleaseLock } from '@/hooks/use-collaboration'
import { usePermission } from '@/hooks/use-permissions'

export interface LockIndicatorProps {
  projectId: string
  entityId: string
  nodeType: NodeType
}

export function LockIndicator({ projectId, entityId, nodeType }: LockIndicatorProps) {
  const { data: lock } = useLockByEntity(projectId, entityId)
  const acquireLock = useAcquireLock(projectId)
  const releaseLock = useReleaseLock(projectId)
  const canAcquire = usePermission('lock:acquire')
  const canReleaseOwn = usePermission('lock:release:own')
  const canReleaseAny = usePermission('lock:release:any')

  const isLocked = !!lock
  const isOwnLock = isLocked && lock.lockedBy === 'current-user'
  const canRelease = isLocked && (canReleaseAny || (canReleaseOwn && isOwnLock))

  const handleAcquire = () => {
    acquireLock.mutate({
      entityId,
      nodeType,
      lockedBy: 'current-user',
      lockedByName: 'You',
    })
  }

  const handleRelease = () => {
    releaseLock.mutate({ entityId })
  }

  if (isLocked) {
    return (
      <div data-testid="lock-indicator" className="flex items-center gap-1.5 rounded bg-orange-50 border border-orange-200 px-2 py-1">
        <Lock className="h-3 w-3 text-orange-600" />
        <span className="text-[11px] text-orange-700">
          Locked by {lock.lockedByName}
        </span>
        {canRelease && (
          <button
            type="button"
            data-testid="release-lock-btn"
            onClick={handleRelease}
            disabled={releaseLock.isPending}
            className="ml-1 text-[10px] text-orange-600 hover:text-orange-800 underline"
          >
            Release
          </button>
        )}
      </div>
    )
  }

  if (canAcquire) {
    return (
      <button
        type="button"
        data-testid="acquire-lock-btn"
        onClick={handleAcquire}
        disabled={acquireLock.isPending}
        className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent"
      >
        <Unlock className="h-3 w-3" />
        Lock for editing
      </button>
    )
  }

  return null
}
