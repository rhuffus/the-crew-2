import { Module } from '@nestjs/common'
import { SkillsController } from './skills.controller'
import { SkillService } from './application/skill.service'
import { InMemorySkillRepository } from './infra/in-memory-skill.repository'
import { SKILL_REPOSITORY } from './domain/skill-repository'

@Module({
  controllers: [SkillsController],
  providers: [
    SkillService,
    { provide: SKILL_REPOSITORY, useClass: InMemorySkillRepository },
  ],
  exports: [SKILL_REPOSITORY],
})
export class SkillsModule {}
