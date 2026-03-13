import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { SkillsController } from './skills.controller'
import { SkillService } from './application/skill.service'
import { InMemorySkillRepository } from './infra/in-memory-skill.repository'
import { DrizzleSkillRepository } from './infra/drizzle-skill.repository'
import { SKILL_REPOSITORY } from './domain/skill-repository'

@Module({
  controllers: [SkillsController],
  providers: [
    SkillService,
    {
      provide: SKILL_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleSkillRepository
        : InMemorySkillRepository,
    },
  ],
  exports: [SKILL_REPOSITORY],
})
export class SkillsModule {}
