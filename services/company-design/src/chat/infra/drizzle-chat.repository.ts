import { Inject, Injectable } from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { ChatRepository } from '../domain/chat-repository'
import { ChatThread } from '../domain/chat-thread'
import { ChatMessage } from '../domain/chat-message'
import type {
  ScopeType,
  ChatMessageRole,
  ChatEntityRef,
  ChatActionSuggestion,
} from '@the-crew/shared-types'
import { chatThreads } from '../../drizzle/schema/chat-threads'
import { chatMessages } from '../../drizzle/schema/chat-messages'

@Injectable()
export class DrizzleChatRepository implements ChatRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findByScope(
    projectId: string,
    scopeType: ScopeType,
    entityId: string | null,
  ): Promise<ChatThread | null> {
    const conditions = [
      eq(chatThreads.projectId, projectId),
      eq(chatThreads.scopeType, scopeType),
    ]
    if (entityId !== null) {
      conditions.push(eq(chatThreads.entityId, entityId))
    } else {
      conditions.push(isNull(chatThreads.entityId))
    }
    const threadRows = await this.db
      .select()
      .from(chatThreads)
      .where(and(...conditions))
      .limit(1)
    if (!threadRows[0]) return null
    return this.reconstituteThread(threadRows[0])
  }

  async findById(threadId: string): Promise<ChatThread | null> {
    const threadRows = await this.db
      .select()
      .from(chatThreads)
      .where(eq(chatThreads.id, threadId))
      .limit(1)
    if (!threadRows[0]) return null
    return this.reconstituteThread(threadRows[0])
  }

  async listByProject(projectId: string): Promise<ChatThread[]> {
    const threadRows = await this.db
      .select()
      .from(chatThreads)
      .where(eq(chatThreads.projectId, projectId))
    return Promise.all(threadRows.map((row) => this.reconstituteThread(row)))
  }

  async save(thread: ChatThread): Promise<void> {
    await this.db.transaction(async (tx) => {
      const threadRow = this.toThreadRow(thread)
      await tx
        .insert(chatThreads)
        .values(threadRow)
        .onConflictDoUpdate({ target: chatThreads.id, set: threadRow })
      await tx.delete(chatMessages).where(eq(chatMessages.threadId, thread.id))
      if (thread.messages.length > 0) {
        const msgRows = thread.messages.map((m) => this.toMessageRow(m))
        await tx.insert(chatMessages).values(msgRows)
      }
    })
  }

  async delete(threadId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(chatMessages).where(eq(chatMessages.threadId, threadId))
      await tx.delete(chatThreads).where(eq(chatThreads.id, threadId))
    })
  }

  private async reconstituteThread(
    row: typeof chatThreads.$inferSelect,
  ): Promise<ChatThread> {
    const messageRows = await this.db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, row.id))
    const messages = messageRows.map((m) => this.toMessageDomain(m))
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

  private toMessageDomain(
    row: typeof chatMessages.$inferSelect,
  ): ChatMessage {
    return ChatMessage.reconstitute({
      id: row.id,
      threadId: row.threadId,
      role: row.role as ChatMessageRole,
      content: row.content,
      entityRefs: row.entityRefs as ChatEntityRef[],
      actions: row.actions as ChatActionSuggestion[],
      createdAt: row.createdAt,
    })
  }

  private toThreadRow(
    thread: ChatThread,
  ): typeof chatThreads.$inferInsert {
    return {
      id: thread.id,
      projectId: thread.projectId,
      scopeType: thread.scopeType,
      entityId: thread.entityId,
      title: thread.title,
      createdAt: thread.createdAt,
    }
  }

  private toMessageRow(
    message: ChatMessage,
  ): typeof chatMessages.$inferInsert {
    return {
      id: message.id,
      threadId: message.threadId,
      role: message.role,
      content: message.content,
      entityRefs: message.entityRefs,
      actions: message.actions,
      createdAt: message.createdAt,
    }
  }
}
