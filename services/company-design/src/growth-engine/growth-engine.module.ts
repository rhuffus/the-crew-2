import { Module } from '@nestjs/common'
import { ProposalsModule } from '../proposals/proposals.module'
import { ConstitutionModule } from '../constitution/constitution.module'
import { OrganizationalUnitsModule } from '../organizational-units/organizational-units.module'
import { ProjectSeedModule } from '../project-seed/project-seed.module'
import { GrowthEngineAppService } from './application/growth-engine.app-service'
import { GrowthEngineController } from './application/growth-engine.controller'

@Module({
  imports: [ProposalsModule, ConstitutionModule, OrganizationalUnitsModule, ProjectSeedModule],
  providers: [GrowthEngineAppService],
  controllers: [GrowthEngineController],
  exports: [GrowthEngineAppService],
})
export class GrowthEngineModule {}
