import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { CompanyModelModule } from './company-model/company-model.module'
import { DepartmentsModule } from './departments/departments.module'
import { CapabilitiesModule } from './capabilities/capabilities.module'
import { ContractsModule } from './contracts/contracts.module'
import { WorkflowsModule } from './workflows/workflows.module'
import { RolesModule } from './roles/roles.module'
import { AgentArchetypesModule } from './agent-archetypes/agent-archetypes.module'
import { AgentAssignmentsModule } from './agent-assignments/agent-assignments.module'
import { SkillsModule } from './skills/skills.module'
import { PoliciesModule } from './policies/policies.module'
import { ReleasesModule } from './releases/releases.module'
import { ValidationsModule } from './validations/validations.module'
import { AuditModule } from './audit/audit.module'
import { GraphProjectionModule } from './graph-projection/graph-projection.module'
import { SavedViewsModule } from './saved-views/saved-views.module'
import { ChatModule } from './chat/chat.module'
import { ArtifactsModule } from './artifacts/artifacts.module'
import { CommentsModule } from './comments/comments.module'
import { CollaborationModule } from './collaboration/collaboration.module'
import { OperationsModule } from './operations/operations.module'

@Module({
  imports: [CompanyModelModule, DepartmentsModule, CapabilitiesModule, RolesModule, AgentArchetypesModule, AgentAssignmentsModule, SkillsModule, ContractsModule, WorkflowsModule, PoliciesModule, ArtifactsModule, ReleasesModule, ValidationsModule, AuditModule, GraphProjectionModule, SavedViewsModule, ChatModule, CommentsModule, CollaborationModule, OperationsModule],
  controllers: [HealthController],
})
export class AppModule {}
