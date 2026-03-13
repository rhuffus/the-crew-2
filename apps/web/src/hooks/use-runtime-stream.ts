import { useEffect } from 'react'
import { useRuntimeStatusStore } from '@/stores/runtime-status-store'
import type { DesignMode } from '@/stores/visual-workspace-store'

export function useRuntimeStream(projectId: string | null, designMode: DesignMode) {
  const connect = useRuntimeStatusStore(s => s.connect)
  const disconnect = useRuntimeStatusStore(s => s.disconnect)

  useEffect(() => {
    if (!projectId || designMode !== 'live') {
      disconnect()
      return
    }

    connect(projectId)

    return () => { disconnect() }
  }, [projectId, designMode, connect, disconnect])
}
