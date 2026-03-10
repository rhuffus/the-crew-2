import { Injectable } from '@nestjs/common'
import type {
  ReleaseSnapshotDto,
  EntityChange,
  DiffEntityType,
  DiffSummary,
} from '@the-crew/shared-types'

interface DiffResult {
  changes: EntityChange[]
  summary: DiffSummary
}

function toRecord(obj: object): Record<string, unknown> {
  return obj as Record<string, unknown>
}

@Injectable()
export class SnapshotDiffer {
  diff(base: ReleaseSnapshotDto, compare: ReleaseSnapshotDto): DiffResult {
    const changes: EntityChange[] = []

    this.diffCompanyModel(base, compare, changes)
    this.diffCollection(base.departments, compare.departments, 'department', changes)
    this.diffCollection(base.capabilities, compare.capabilities, 'capability', changes)
    this.diffCollection(base.roles, compare.roles, 'role', changes)
    this.diffCollection(base.agentArchetypes, compare.agentArchetypes, 'agentArchetype', changes)
    this.diffCollection(base.agentAssignments, compare.agentAssignments, 'agentAssignment', changes)
    this.diffCollection(base.skills, compare.skills, 'skill', changes)
    this.diffCollection(base.contracts, compare.contracts, 'contract', changes)
    this.diffCollection(base.workflows, compare.workflows, 'workflow', changes)
    this.diffCollection(base.policies, compare.policies, 'policy', changes)

    const summary: DiffSummary = {
      added: changes.filter((c) => c.changeType === 'added').length,
      removed: changes.filter((c) => c.changeType === 'removed').length,
      modified: changes.filter((c) => c.changeType === 'modified').length,
    }

    return { changes, summary }
  }

  private diffCompanyModel(
    base: ReleaseSnapshotDto,
    compare: ReleaseSnapshotDto,
    changes: EntityChange[],
  ): void {
    const b = base.companyModel
    const c = compare.companyModel

    if (!b && !c) return

    if (!b && c) {
      changes.push({
        changeType: 'added',
        entityType: 'companyModel',
        entityId: null,
        entityName: 'Company Model',
        before: null,
        after: toRecord(c),
      })
      return
    }

    if (b && !c) {
      changes.push({
        changeType: 'removed',
        entityType: 'companyModel',
        entityId: null,
        entityName: 'Company Model',
        before: toRecord(b),
        after: null,
      })
      return
    }

    if (b && c && !this.shallowEqual(toRecord(b), toRecord(c))) {
      changes.push({
        changeType: 'modified',
        entityType: 'companyModel',
        entityId: null,
        entityName: 'Company Model',
        before: toRecord(b),
        after: toRecord(c),
      })
    }
  }

  private diffCollection(
    baseItems: Array<{ id: string; name: string }>,
    compareItems: Array<{ id: string; name: string }>,
    entityType: DiffEntityType,
    changes: EntityChange[],
  ): void {
    const baseMap = new Map(baseItems.map((item) => [item.id, item]))
    const compareMap = new Map(compareItems.map((item) => [item.id, item]))

    for (const [id, item] of compareMap) {
      if (!baseMap.has(id)) {
        changes.push({
          changeType: 'added',
          entityType,
          entityId: id,
          entityName: item.name,
          before: null,
          after: toRecord(item),
        })
      }
    }

    for (const [id, item] of baseMap) {
      if (!compareMap.has(id)) {
        changes.push({
          changeType: 'removed',
          entityType,
          entityId: id,
          entityName: item.name,
          before: toRecord(item),
          after: null,
        })
      }
    }

    for (const [id, baseItem] of baseMap) {
      const compareItem = compareMap.get(id)
      if (compareItem && !this.shallowEqual(toRecord(baseItem), toRecord(compareItem))) {
        changes.push({
          changeType: 'modified',
          entityType,
          entityId: id,
          entityName: compareItem.name,
          before: toRecord(baseItem),
          after: toRecord(compareItem),
        })
      }
    }
  }

  private shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
    const keysToSkip = new Set(['createdAt', 'updatedAt'])
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])

    for (const key of allKeys) {
      if (keysToSkip.has(key)) continue
      if (!this.deepEqual(a[key], b[key])) return false
    }
    return true
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a == null || b == null) return a === b
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((val, i) => this.deepEqual(val, b[i]))
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const aObj = a as Record<string, unknown>
      const bObj = b as Record<string, unknown>
      const keys = new Set([...Object.keys(aObj), ...Object.keys(bObj)])
      for (const key of keys) {
        if (!this.deepEqual(aObj[key], bObj[key])) return false
      }
      return true
    }
    return false
  }
}
