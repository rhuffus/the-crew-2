import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { CompanyModelController } from './company-model.controller'
import { DepartmentsController } from './departments.controller'
import { CapabilitiesController } from './capabilities.controller'
import { ContractsController } from './contracts.controller'
import { WorkflowsController } from './workflows.controller'
import { RolesController } from './roles.controller'
import { AgentArchetypesController } from './agent-archetypes.controller'
import { AgentAssignmentsController } from './agent-assignments.controller'
import { SkillsController } from './skills.controller'
import { PoliciesController } from './policies.controller'
import { ReleasesController } from './releases.controller'
import { ValidationsController } from './validations.controller'
import { AuditController } from './audit.controller'
import { VisualGraphController } from './visual-graph.controller'
import { SavedViewsController } from './saved-views.controller'
import { ChatController } from './chat.controller'
import { PermissionsController } from './permissions.controller'
import { ArtifactsController } from './artifacts.controller'
import { CommentsController } from './comments.controller'
import { CollaborationController } from './collaboration.controller'
import { OperationsController } from './operations.controller'
import { CompanyDesignClient } from './company-design.client'

@Module({
  imports: [HttpModule],
  controllers: [CompanyModelController, DepartmentsController, CapabilitiesController, RolesController, AgentArchetypesController, AgentAssignmentsController, SkillsController, ContractsController, WorkflowsController, PoliciesController, ReleasesController, ValidationsController, AuditController, VisualGraphController, SavedViewsController, ChatController, PermissionsController, ArtifactsController, CommentsController, CollaborationController, OperationsController],
  providers: [CompanyDesignClient],
})
export class CompanyModelModule {}
