import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { ProjectsModule } from './projects/projects.module'
import { BootstrapModule } from './bootstrap/bootstrap.module'

@Module({
  imports: [ProjectsModule, BootstrapModule],
  controllers: [HealthController],
})
export class AppModule {}
