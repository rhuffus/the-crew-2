import { Module } from '@nestjs/common'
import { ProjectDocumentsController } from './project-documents.controller'
import { ProjectDocumentService } from './application/project-document.service'
import { PrismaProjectDocumentRepository } from './infra/prisma-project-document.repository'
import { PROJECT_DOCUMENT_REPOSITORY } from './domain/project-document-repository'

@Module({
  controllers: [ProjectDocumentsController],
  providers: [
    ProjectDocumentService,
    {
      provide: PROJECT_DOCUMENT_REPOSITORY,
      useClass: PrismaProjectDocumentRepository,
    },
  ],
  exports: [PROJECT_DOCUMENT_REPOSITORY, ProjectDocumentService],
})
export class ProjectDocumentsModule {}
