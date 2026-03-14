import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { ChatRepository } from '../domain/chat-repository'
import { ChatThread } from '../domain/chat-thread'
import { ChatMessage } from '../domain/chat-message'
import type {
  ScopeType,
  ChatMessageRole,
  ChatEntityRef,
  ChatActionSuggestion,
} from '@the-crew/shared-types'

@Injectable()
export class PrismaChatRepository implements ChatRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findByScope(
    projectId: string,
    scopeType: ScopeType,
    entityId: string | null,
  ): Promise<ChatThread | null> {
    const row = await this.prisma.chatThread.findFirst({
      where: {
        projectId,
        scopeType,
        entityId: entityId ?? null,
      },
    })
    if (!row) return null
    return this.reconstituteThread(row)
  }

  async findById(threadId: string): Promise<ChatThread | null> {
    const row = await this.prisma.chatThread.findUnique({ where: { id: threadId } })
    if (!row) return null
    return this.reconstituteThread(row)
  }

  async listByProject(projectId: string): Promise<ChatThread[]> {
    const rows = await this.prisma.chatThread.findMany({ where: { projectId } })
    return Promise.all(rows.map((row) => this.reconstituteThread(row)))
  }

  async save(thread: ChatThread): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.chatThread.upsert({
        where: { id: thread.id },
        create: {
          id: thread.id,
          projectId: thread.projectId,
          scopeType: thread.scopeType,
          entityId: thread.entityId,
          title: thread.title,
          createdAt: thread.createdAt,
        },
        update: {
          projectId: thread.projectId,
          scopeType: thread.scopeType,
          entityId: thread.entityId,
          title: thread.title,
        },
      })
      await tx.chatMessage.deleteMany({ where: { threadId: thread.id } })
      if (thread.messages.length > 0) {
        await tx.chatMessage.createMany({
          data: thread.messages.map((m) => ({
            id: m.id,
            threadId: m.threadId,
            role: m.role,
            content: m.content,
            entityRefs: m.entityRefs as object[],
            actions: m.actions as object[],
            createdAt: m.createdAt,
          })),
        })
      }
    })
  }

  async delete(threadId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.chatMessage.deleteMany({ where: { threadId } })
      await tx.chatThread.delete({ where: { id: threadId } })
    })
  }

  private async reconstituteThread(row: {
    id: string
    projectId: string
    scopeType: string
    entityId: string | null
    title: string
    createdAt: Date
  }): Promise<ChatThread> {
    const messageRows = await this.prisma.chatMessage.findMany({
      where: { threadId: row.id },
    })
    const messages = messageRows.map((m) =>
      ChatMessage.reconstitute({
        id: m.id,
        threadId: m.threadId,
        role: m.role as ChatMessageRole,
        content: m.content,
        entityRefs: m.entityRefs as unknown as ChatEntityRef[],
        actions: m.actions as unknown as ChatActionSuggestion[],
        createdAt: m.createdAt,
      }),
    )
    return ChatThread.reconstitute({
      id: row.id,
      projectId: row.projectId,
      scopeType: row.scopeType as ScopeType,
      entityId: row.entityId,
      title: row.title,
      messages,
      createdAt: row.createdAt,
    })
  }
}
