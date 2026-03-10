import { Injectable } from '@nestjs/common'
import type { DepartmentRepository } from '../domain/department-repository'
import type { Department } from '../domain/department'

@Injectable()
export class InMemoryDepartmentRepository implements DepartmentRepository {
  private readonly store = new Map<string, Department>()

  async findById(id: string): Promise<Department | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<Department[]> {
    return [...this.store.values()].filter((d) => d.projectId === projectId)
  }

  async save(department: Department): Promise<void> {
    this.store.set(department.id, department)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
