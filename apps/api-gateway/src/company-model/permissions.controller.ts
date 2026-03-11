import { Controller, Get, Param } from '@nestjs/common'
import { buildManifest, type ProjectRole } from '@the-crew/shared-types'

/**
 * Permissions controller — returns the permission manifest for the current user.
 * In dev mode (no auth system), always returns an editor manifest.
 * When real auth is added, this will resolve the user's project membership.
 */
@Controller('projects/:projectId/permissions')
export class PermissionsController {
  @Get()
  getPermissions(@Param('projectId') _projectId: string) {
    // DEV_MODE: no auth system yet — return editor permissions
    const defaultRole: ProjectRole = 'project:editor'
    return buildManifest(defaultRole, 'platform:member')
  }
}
