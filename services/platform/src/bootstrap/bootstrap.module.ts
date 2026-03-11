import { Module } from '@nestjs/common'
import { ProjectsModule } from '../projects/projects.module'
import { BootstrapService } from './bootstrap.service'

@Module({
  imports: [ProjectsModule],
  providers: [BootstrapService],
})
export class BootstrapModule {}
