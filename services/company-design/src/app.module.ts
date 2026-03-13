import { Module } from '@nestjs/common'
import { DrizzleModule, isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { HealthController } from './health.controller'
import { BootstrapModule } from './bootstrap/bootstrap.module'
import { LegacyBootstrapModule } from './bootstrap/legacy-bootstrap.module'
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
import { ProjectSeedModule } from './project-seed/project-seed.module'
import { ConstitutionModule } from './constitution/constitution.module'
import { OrganizationalUnitsModule } from './organizational-units/organizational-units.module'
import { LcpAgentsModule } from './lcp-agents/lcp-agents.module'
import { ProposalsModule } from './proposals/proposals.module'
import { GrowthEngineModule } from './growth-engine/growth-engine.module'
import { RuntimeModule } from './runtime/runtime.module'

const drizzleImport = isPersistenceModeDrizzle()
  ? [DrizzleModule.forRoot({ connectionString: process.env.DATABASE_URL! })]
  : []

@Module({
  imports: [
    ...drizzleImport,
    // CEO-first bootstrap (new projects)
    BootstrapModule,
    // Legacy Verticaler bootstrap (pre-populated company)
    LegacyBootstrapModule,
    // New domain modules (Live Company Pivot)
    ProjectSeedModule,
    ConstitutionModule,
    OrganizationalUnitsModule,
    LcpAgentsModule,
    ProposalsModule,
    GrowthEngineModule,
    // Legacy domain modules
    CompanyModelModule,
    DepartmentsModule,
    CapabilitiesModule,
    RolesModule,
    AgentArchetypesModule,
    AgentAssignmentsModule,
    SkillsModule,
    ContractsModule,
    WorkflowsModule,
    PoliciesModule,
    ArtifactsModule,
    // Cross-cutting modules
    ReleasesModule,
    ValidationsModule,
    AuditModule,
    GraphProjectionModule,
    SavedViewsModule,
    ChatModule,
    CommentsModule,
    CollaborationModule,
    OperationsModule,
    RuntimeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
