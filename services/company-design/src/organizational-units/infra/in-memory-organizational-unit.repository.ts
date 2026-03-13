import { Injectable } from '@nestjs/common'
import type { OrganizationalUnitRepository } from '../domain/organizational-unit-repository'
import type { OrganizationalUnit } from '../domain/organizational-unit'

@Injectable()
export class InMemoryOrganizationalUnitRepository implements OrganizationalUnitRepository {
  private readonly store = new Map<string, OrganizationalUnit>()

  async findById(id: string): Promise<OrganizationalUnit | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<OrganizationalUnit[]> {
    return [...this.store.values()].filter((u) => u.projectId === projectId)
  }

  async save(unit: OrganizationalUnit): Promise<void> {
    this.store.set(unit.id, unit)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
