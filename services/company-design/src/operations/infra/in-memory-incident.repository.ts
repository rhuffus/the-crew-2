import { Injectable } from '@nestjs/common'
import type { IncidentRepository } from '../domain/operations-repository'
import type { Incident } from '../domain/incident'

@Injectable()
export class InMemoryIncidentRepository implements IncidentRepository {
  private readonly store = new Map<string, Incident>()

  async findById(id: string): Promise<Incident | null> {
    return this.store.get(id) ?? null
  }

  async listByProject(projectId: string): Promise<Incident[]> {
    return [...this.store.values()].filter((i) => i.projectId === projectId)
  }

  async listByEntity(projectId: string, entityId: string): Promise<Incident[]> {
    return [...this.store.values()].filter(
      (i) => i.projectId === projectId && i.entityId === entityId,
    )
  }

  async save(incident: Incident): Promise<void> {
    this.store.set(incident.id, incident)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
