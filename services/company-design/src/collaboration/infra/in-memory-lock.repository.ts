import { Injectable } from '@nestjs/common'
import type { LockRepository } from '../domain/collaboration-repository'
import type { EntityLock } from '../domain/entity-lock'

@Injectable()
export class InMemoryLockRepository implements LockRepository {
  private readonly store = new Map<string, EntityLock>()

  async findByEntity(projectId: string, entityId: string): Promise<EntityLock | null> {
    for (const lock of this.store.values()) {
      if (lock.projectId === projectId && lock.entityId === entityId) {
        return lock
      }
    }
    return null
  }

  async listByProject(projectId: string): Promise<EntityLock[]> {
    return [...this.store.values()].filter((l) => l.projectId === projectId)
  }

  async save(lock: EntityLock): Promise<void> {
    this.store.set(lock.id, lock)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
