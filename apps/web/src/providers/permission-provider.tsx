import { useMemo, useContext, type ReactNode } from 'react'
import type { PermissionManifest } from '@the-crew/shared-types'
import { hasPermission, hasAnyPermission, buildManifest } from '@the-crew/shared-types'
import { PermissionContext, usePermissionManifest } from '@/hooks/use-permissions'

// DEV_MODE: no auth system — hardcoded editor permissions. TODO: resolve from real auth when available
const DEV_MANIFEST = buildManifest('project:editor', 'platform:member')

interface PermissionProviderProps {
  projectId: string | null
  children: ReactNode
}

export function PermissionProvider({ projectId, children }: PermissionProviderProps) {
  const { data, isLoading } = usePermissionManifest(projectId)

  const manifest: PermissionManifest = data ?? DEV_MANIFEST

  const value = useMemo(
    () => ({
      manifest,
      loading: isLoading,
      can: (p: string) => hasPermission(manifest, p),
      canAny: (ps: string[]) => hasAnyPermission(manifest, ps),
      role: manifest.projectRole,
    }),
    [manifest, isLoading],
  )

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

/**
 * Guard component: only renders children if the user has the required permission.
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const { can } = useContext(PermissionContext)
  return <>{can(permission) ? children : fallback}</>
}
