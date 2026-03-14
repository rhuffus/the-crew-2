import { Module } from '@nestjs/common'
import { ArtifactsController } from './artifacts.controller'
import { ArtifactService } from './application/artifact.service'
import { PrismaArtifactRepository } from './infra/prisma-artifact.repository'
import { ARTIFACT_REPOSITORY } from './domain/artifact-repository'

@Module({
  controllers: [ArtifactsController],
  providers: [
    ArtifactService,
    {
      provide: ARTIFACT_REPOSITORY,
      useClass: PrismaArtifactRepository,
    },
  ],
  exports: [ARTIFACT_REPOSITORY],
})
export class ArtifactsModule {}
