import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { SavedViewsController } from './saved-views.controller'
import { SavedViewService } from './application/saved-view.service'
import { InMemorySavedViewRepository } from './infra/in-memory-saved-view.repository'
import { DrizzleSavedViewRepository } from './infra/drizzle-saved-view.repository'
import { SAVED_VIEW_REPOSITORY } from './domain/saved-view-repository'

@Module({
  controllers: [SavedViewsController],
  providers: [
    SavedViewService,
    {
      provide: SAVED_VIEW_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleSavedViewRepository
        : InMemorySavedViewRepository,
    },
  ],
})
export class SavedViewsModule {}
