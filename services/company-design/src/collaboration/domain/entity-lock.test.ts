import { describe, it, expect } from 'vitest'
import { EntityLock } from './entity-lock'
import type { AcquireLockDto } from '@the-crew/shared-types'

describe('EntityLock', () => {
  const baseDto: AcquireLockDto = {
    entityId: 'e1',
    nodeType: 'department',
    lockedBy: 'user-1',
    lockedByName: 'Alice',
  }

  it('creates a lock with default duration (5 min)', () => {
    const lock = EntityLock.create('p1', baseDto)
    expect(lock.id).toBeDefined()
    expect(lock.projectId).toBe('p1')
    expect(lock.entityId).toBe('e1')
    expect(lock.nodeType).toBe('department')
    expect(lock.lockedBy).toBe('user-1')
    expect(lock.lockedByName).toBe('Alice')
    expect(lock.lockedAt).toBeInstanceOf(Date)
    expect(lock.expiresAt).toBeInstanceOf(Date)
    // Default 5 min = 300000ms
    const diff = lock.expiresAt.getTime() - lock.lockedAt.getTime()
    expect(diff).toBe(300_000)
  })

  it('creates a lock with custom duration', () => {
    const dto: AcquireLockDto = { ...baseDto, durationMs: 60_000 }
    const lock = EntityLock.create('p1', dto)
    const diff = lock.expiresAt.getTime() - lock.lockedAt.getTime()
    expect(diff).toBe(60_000)
  })

  it('reconstitute restores a lock', () => {
    const original = EntityLock.create('p1', baseDto)
    const restored = EntityLock.reconstitute({
      id: original.id,
      projectId: original.projectId,
      entityId: original.entityId,
      nodeType: original.nodeType,
      lockedBy: original.lockedBy,
      lockedByName: original.lockedByName,
      lockedAt: original.lockedAt,
      expiresAt: original.expiresAt,
    })
    expect(restored.id).toBe(original.id)
    expect(restored.lockedBy).toBe('user-1')
  })

  it('isExpired returns false for active lock', () => {
    const lock = EntityLock.create('p1', baseDto)
    expect(lock.isExpired).toBe(false)
  })

  it('isExpired returns true for expired lock', () => {
    const past = new Date(Date.now() - 600_000)
    const lock = EntityLock.reconstitute({
      id: 'lock-1',
      projectId: 'p1',
      entityId: 'e1',
      nodeType: 'department',
      lockedBy: 'user-1',
      lockedByName: 'Alice',
      lockedAt: new Date(past.getTime() - 300_000),
      expiresAt: past,
    })
    expect(lock.isExpired).toBe(true)
  })

  it('extend updates expiresAt from now', () => {
    const lock = EntityLock.create('p1', baseDto)
    const beforeExtend = lock.expiresAt
    lock.extend(600_000) // 10 min
    expect(lock.expiresAt.getTime()).toBeGreaterThan(beforeExtend.getTime())
    // New expiry should be ~10 min from now
    const diff = lock.expiresAt.getTime() - Date.now()
    expect(diff).toBeGreaterThan(599_000)
    expect(diff).toBeLessThanOrEqual(600_000)
  })

  it('entity equality by id', () => {
    const lock = EntityLock.create('p1', baseDto)
    const same = EntityLock.reconstitute({
      id: lock.id,
      projectId: 'p1',
      entityId: 'e1',
      nodeType: 'department',
      lockedBy: 'user-2',
      lockedByName: 'Bob',
      lockedAt: new Date(),
      expiresAt: new Date(),
    })
    expect(lock.equals(same)).toBe(true)
  })
})
