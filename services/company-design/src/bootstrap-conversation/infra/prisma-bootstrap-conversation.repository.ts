import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { BootstrapConversationStatus } from '@the-crew/shared-types'
import type { BootstrapConversationRepository } from '../domain/bootstrap-conversation-repository'
import { BootstrapConversation } from '../domain/bootstrap-conversation'

@Injectable()
export class PrismaBootstrapConversationRepository implements BootstrapConversationRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findByProjectId(projectId: string): Promise<BootstrapConversation | null> {
    const row = await this.prisma.bootstrapConversation.findUnique({
      where: { projectId },
    })
    return row ? this.toDomain(row) : null
  }

  async findById(id: string): Promise<BootstrapConversation | null> {
    const row = await this.prisma.bootstrapConversation.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async save(conversation: BootstrapConversation): Promise<void> {
    const data = {
      projectId: conversation.projectId,
      threadId: conversation.threadId,
      ceoAgentId: conversation.ceoAgentId,
      status: conversation.status,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }
    await this.prisma.bootstrapConversation.upsert({
      where: { id: conversation.id },
      create: { id: conversation.id, ...data },
      update: data,
    })
  }

  private toDomain(row: {
    id: string
    projectId: string
    threadId: string
    ceoAgentId: string
    status: string
    createdAt: Date
    updatedAt: Date
  }): BootstrapConversation {
    return BootstrapConversation.reconstitute({
      id: row.id,
      projectId: row.projectId,
      threadId: row.threadId,
      ceoAgentId: row.ceoAgentId,
      status: row.status as BootstrapConversationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
