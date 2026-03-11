import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import {
  VERTICALER_PROJECT_ID,
  VERTICALER_PROJECT_NAME,
  VERTICALER_PROJECT_DESCRIPTION,
} from '@the-crew/shared-types'
import { Project } from '../projects/domain/project'
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../projects/domain/project-repository'

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name)

  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: ProjectRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    const projects = await this.projectRepo.findAll()
    if (projects.length > 0) {
      this.logger.log('Projects exist, skipping Verticaler bootstrap')
      return
    }

    this.logger.log('Empty instance detected — seeding Verticaler project')

    const project = Project.create({
      id: VERTICALER_PROJECT_ID,
      name: VERTICALER_PROJECT_NAME,
      description: VERTICALER_PROJECT_DESCRIPTION,
    })
    await this.projectRepo.save(project)

    this.logger.log(`Verticaler project created (id=${VERTICALER_PROJECT_ID})`)
  }
}
