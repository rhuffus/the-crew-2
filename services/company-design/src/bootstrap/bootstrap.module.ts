/**
 * CEO-First Bootstrap Module — new projects use this path.
 * Rewritten as part of LCP-013. Legacy Verticaler bootstrap lives in legacy-bootstrap.module.ts.
 * Extended by LCP-016 to include VerticalerDemoSeeder.
 */
import { Module } from '@nestjs/common'
import { ProjectSeedModule } from '../project-seed/project-seed.module'
import { ConstitutionModule } from '../constitution/constitution.module'
import { OrganizationalUnitsModule } from '../organizational-units/organizational-units.module'
import { LcpAgentsModule } from '../lcp-agents/lcp-agents.module'
import { ProposalsModule } from '../proposals/proposals.module'
import { RuntimeModule } from '../runtime/runtime.module'
import { CeoFirstBootstrapService } from './ceo-first-bootstrap.service'
import { BootstrapController } from './bootstrap.controller'
import { VerticalerDemoSeeder } from './verticaler-demo-seeder'

@Module({
  imports: [
    ProjectSeedModule,
    ConstitutionModule,
    OrganizationalUnitsModule,
    LcpAgentsModule,
    ProposalsModule,
    RuntimeModule,
  ],
  controllers: [BootstrapController],
  providers: [CeoFirstBootstrapService, VerticalerDemoSeeder],
  exports: [CeoFirstBootstrapService],
})
export class BootstrapModule {}
