import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { ScopeType, ChatThreadDto, ChatMessageDto, CreateChatMessageDto } from '@the-crew/shared-types'
import { CHAT_REPOSITORY, type ChatRepository } from '../domain/chat-repository'
import { ChatThread } from '../domain/chat-thread'
import { ChatMapper } from './chat.mapper'

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly repo: ChatRepository,
  ) {}

  async getOrCreateThread(projectId: string, scopeType: ScopeType, entityId: string | null): Promise<ChatThreadDto> {
    let thread = await this.repo.findByScope(projectId, scopeType, entityId)
    if (!thread) {
      thread = ChatThread.create(projectId, scopeType, entityId)
      await this.repo.save(thread)
    }
    return ChatMapper.threadToDto(thread)
  }

  async sendMessage(threadId: string, dto: CreateChatMessageDto): Promise<ChatMessageDto> {
    const thread = await this.repo.findById(threadId)
    if (!thread) {
      throw new NotFoundException(`Thread ${threadId} not found`)
    }
    const message = thread.addMessage('user', dto.content, dto.entityRefs ?? [])
    await this.repo.save(thread)
    return ChatMapper.messageToDto(message)
  }

  async listMessages(threadId: string, limit = 50, before?: string): Promise<ChatMessageDto[]> {
    const thread = await this.repo.findById(threadId)
    if (!thread) {
      throw new NotFoundException(`Thread ${threadId} not found`)
    }
    let msgs = [...thread.messages]
    if (before) {
      const beforeDate = new Date(before)
      msgs = msgs.filter((m) => m.createdAt < beforeDate)
    }
    // Newest last (chronological), take last N
    msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    return msgs.slice(-limit).map(ChatMapper.messageToDto)
  }

  async listThreads(projectId: string): Promise<ChatThreadDto[]> {
    const threads = await this.repo.listByProject(projectId)
    return threads.map(ChatMapper.threadToDto)
  }

  async deleteThread(threadId: string): Promise<void> {
    const thread = await this.repo.findById(threadId)
    if (!thread) {
      throw new NotFoundException(`Thread ${threadId} not found`)
    }
    await this.repo.delete(threadId)
  }
}
