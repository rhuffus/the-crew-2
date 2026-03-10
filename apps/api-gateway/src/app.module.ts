import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { ProjectsModule } from './projects/projects.module'
import { CompanyModelModule } from './company-model/company-model.module'

@Module({
  imports: [ProjectsModule, CompanyModelModule],
  controllers: [HealthController],
})
export class AppModule {}
