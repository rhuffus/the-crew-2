import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { PermissionManifest, ProjectRole } from '@the-crew/shared-types'
import { hasPermission, hasAnyPermission, buildManifest } from '@the-crew/shared-types'
import { permissionsApi } from '@/api/permissions'

/** Default manifest for when no project is loaded — editor for dev mode */
const DEV_MANIFEST = buildManifest('project:editor', 'platform:member')

export interface PermissionContextValue {
  manifest: PermissionManifest
  loading: boolean
  can: (permission: string) => boolean
  canAny: (permissions: string[]) => boolean
  role: ProjectRole | null
}

export const PermissionContext = createContext<PermissionContextValue>({
  manifest: DEV_MANIFEST,
  loading: false,
  can: (p) => hasPermission(DEV_MANIFEST, p),
  canAny: (ps) => hasAnyPermission(DEV_MANIFEST, ps),
  role: DEV_MANIFEST.projectRole,
})

/** Fetch the permission manifest for a project */
export function usePermissionManifest(projectId: string | null) {
  return useQuery({
    queryKey: ['permissions', projectId],
    queryFn: () => permissionsApi.getManifest(projectId!),
    enabled: !!projectId,
    staleTime: 60_000, // permissions don't change often
  })
}

/** Check a single permission against the current context */
export function usePermission(permission: string): boolean {
  const { can } = useContext(PermissionContext)
  return can(permission)
}

/** Check any of multiple permissions */
export function useAnyPermission(permissions: string[]): boolean {
  const { canAny } = useContext(PermissionContext)
  return canAny(permissions)
}

/** Get the full permission context */
export function usePermissions(): PermissionContextValue {
  return useContext(PermissionContext)
}
