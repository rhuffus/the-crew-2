import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ProjectsController } from './projects.controller'
import { PlatformClient } from './platform.client'

@Module({
  imports: [HttpModule],
  controllers: [ProjectsController],
  providers: [PlatformClient],
})
export class ProjectsModule {}
