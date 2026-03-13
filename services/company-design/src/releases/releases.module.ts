import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { ReleasesController } from './releases.controller'
import { ReleaseService } from './application/release.service'
import { SnapshotCollector } from './application/snapshot-collector'
import { SnapshotDiffer } from './application/snapshot-differ'
import { InMemoryReleaseRepository } from './infra/in-memory-release.repository'
import { DrizzleReleaseRepository } from './infra/drizzle-release.repository'
import { RELEASE_REPOSITORY } from './domain/release-repository'
import { CompanyModelModule } from '../company-model/company-model.module'
import { DepartmentsModule } from '../departments/departments.module'
import { CapabilitiesModule } from '../capabilities/capabilities.module'
import { RolesModule } from '../roles/roles.module'
import { AgentArchetypesModule } from '../agent-archetypes/agent-archetypes.module'
import { AgentAssignmentsModule } from '../agent-assignments/agent-assignments.module'
import { SkillsModule } from '../skills/skills.module'
import { ContractsModule } from '../contracts/contracts.module'
import { WorkflowsModule } from '../workflows/workflows.module'
import { PoliciesModule } from '../policies/policies.module'
import { ArtifactsModule } from '../artifacts/artifacts.module'
import { ValidationsModule } from '../validations/validations.module'
import { OrganizationalUnitsModule } from '../organizational-units/organizational-units.module'
import { LcpAgentsModule } from '../lcp-agents/lcp-agents.module'
import { ProposalsModule } from '../proposals/proposals.module'

@Module({
  imports: [
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
    ValidationsModule,
    OrganizationalUnitsModule,
    LcpAgentsModule,
    ProposalsModule,
  ],
  controllers: [ReleasesController],
  providers: [
    ReleaseService,
    SnapshotCollector,
    SnapshotDiffer,
    {
      provide: RELEASE_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleReleaseRepository
        : InMemoryReleaseRepository,
    },
  ],
  exports: [SnapshotCollector, RELEASE_REPOSITORY],
})
export class ReleasesModule {}
