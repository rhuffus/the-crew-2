import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { CommentDto, CreateCommentDto, UpdateCommentDto } from '@the-crew/shared-types'
import { COMMENT_REPOSITORY, type CommentRepository } from '../domain/comment-repository'
import { Comment } from '../domain/comment'
import { CommentMapper } from './comment.mapper'

@Injectable()
export class CommentService {
  constructor(
    @Inject(COMMENT_REPOSITORY) private readonly repo: CommentRepository,
  ) {}

  async create(projectId: string, dto: CreateCommentDto): Promise<CommentDto> {
    const comment = Comment.create(
      projectId,
      dto.targetType,
      dto.targetId ?? null,
      dto.scopeType,
      dto.authorId,
      dto.authorName,
      dto.content,
      dto.parentId ?? null,
    )

    if (dto.parentId) {
      const parent = await this.repo.findById(dto.parentId)
      if (!parent) {
        throw new NotFoundException(`Parent comment ${dto.parentId} not found`)
      }
      parent.incrementReplyCount()
      await this.repo.save(parent)
    }

    await this.repo.save(comment)
    return CommentMapper.toDto(comment)
  }

  async update(id: string, dto: UpdateCommentDto): Promise<CommentDto> {
    const comment = await this.repo.findById(id)
    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`)
    }

    if (dto.content !== undefined) {
      comment.updateContent(dto.content)
    }
    if (dto.resolved !== undefined) {
      if (dto.resolved) {
        comment.resolve()
      } else {
        comment.unresolve()
      }
    }

    await this.repo.save(comment)
    return CommentMapper.toDto(comment)
  }

  async resolve(id: string): Promise<CommentDto> {
    const comment = await this.repo.findById(id)
    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`)
    }
    comment.resolve()
    await this.repo.save(comment)
    return CommentMapper.toDto(comment)
  }

  async delete(id: string): Promise<void> {
    const comment = await this.repo.findById(id)
    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`)
    }
    await this.repo.delete(id)
  }

  async listByProject(projectId: string): Promise<CommentDto[]> {
    const comments = await this.repo.listByProject(projectId)
    return comments.map(CommentMapper.toDto)
  }

  async listByTarget(projectId: string, targetType: string, targetId: string | null): Promise<CommentDto[]> {
    const comments = await this.repo.listByTarget(projectId, targetType, targetId)
    return comments.map(CommentMapper.toDto)
  }

  async listByEntity(projectId: string, entityId: string): Promise<CommentDto[]> {
    const comments = await this.repo.listByEntity(projectId, entityId)
    return comments.map(CommentMapper.toDto)
  }

  async getById(id: string): Promise<CommentDto> {
    const comment = await this.repo.findById(id)
    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`)
    }
    return CommentMapper.toDto(comment)
  }
}
