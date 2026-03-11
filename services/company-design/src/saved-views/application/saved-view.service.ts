import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { CreateSavedViewDto, UpdateSavedViewDto, SavedViewDto } from '@the-crew/shared-types'
import { SavedView } from '../domain/saved-view'
import { SAVED_VIEW_REPOSITORY, type SavedViewRepository } from '../domain/saved-view-repository'
import { SavedViewMapper } from './saved-view.mapper'

@Injectable()
export class SavedViewService {
  constructor(
    @Inject(SAVED_VIEW_REPOSITORY) private readonly repo: SavedViewRepository,
  ) {}

  async list(projectId: string): Promise<SavedViewDto[]> {
    const views = await this.repo.findByProjectId(projectId)
    return views.map(SavedViewMapper.toDto)
  }

  async get(id: string): Promise<SavedViewDto> {
    const view = await this.repo.findById(id)
    if (!view) throw new NotFoundException(`Saved view ${id} not found`)
    return SavedViewMapper.toDto(view)
  }

  async create(projectId: string, dto: CreateSavedViewDto): Promise<SavedViewDto> {
    const id = crypto.randomUUID()
    const view = SavedView.create({
      id,
      projectId,
      name: dto.name,
      state: dto.state,
    })
    await this.repo.save(view)
    return SavedViewMapper.toDto(view)
  }

  async update(id: string, dto: UpdateSavedViewDto): Promise<SavedViewDto> {
    const view = await this.repo.findById(id)
    if (!view) throw new NotFoundException(`Saved view ${id} not found`)
    view.update(dto)
    await this.repo.save(view)
    return SavedViewMapper.toDto(view)
  }

  async remove(id: string): Promise<void> {
    const view = await this.repo.findById(id)
    if (!view) throw new NotFoundException(`Saved view ${id} not found`)
    await this.repo.delete(id)
  }
}
