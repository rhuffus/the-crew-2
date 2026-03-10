import { Injectable } from '@nestjs/common'
import type { RoleRepository } from '../domain/role-repository'
import type { Role } from '../domain/role'

@Injectable()
export class InMemoryRoleRepository implements RoleRepository {
  private readonly store = new Map<string, Role>()

  async findById(id: string): Promise<Role | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<Role[]> {
    return [...this.store.values()].filter((r) => r.projectId === projectId)
  }

  async save(role: Role): Promise<void> {
    this.store.set(role.id, role)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
