import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RedisRepository, type RedisEntityMapper } from '../redis-repository'
import type { RedisStoreModuleOptions } from '../redis-store.module'

interface TestEntity {
  id: string
  name: string
  active: boolean
}

const testMapper: RedisEntityMapper<TestEntity> = {
  toHash(entity) {
    return {
      name: entity.name,
      active: String(entity.active),
    }
  },
  fromHash(id, fields) {
    return {
      id,
      name: fields['name']!,
      active: fields['active'] === 'true',
    }
  },
}

const storeOptions: RedisStoreModuleOptions = {
  url: 'redis://localhost:6379',
  dbIndex: 0,
  serviceName: 'test-svc',
}

function createMockRedis() {
  const store = new Map<string, Record<string, string>>()
  const sets = new Map<string, Set<string>>()

  return {
    hgetall: vi.fn(async (key: string) => store.get(key) ?? {}),
    hset: vi.fn(async (key: string, hash: Record<string, string>) => {
      store.set(key, { ...hash })
    }),
    del: vi.fn(async (key: string) => {
      store.delete(key)
    }),
    sadd: vi.fn(async (key: string, ...members: string[]) => {
      const s = sets.get(key) ?? new Set()
      for (const m of members) s.add(m)
      sets.set(key, s)
    }),
    srem: vi.fn(async (key: string, ...members: string[]) => {
      const s = sets.get(key)
      if (s) for (const m of members) s.delete(m)
    }),
    smembers: vi.fn(async (key: string) => [...(sets.get(key) ?? [])]),
    scan: vi.fn(async () => ['0', [...store.keys()]]),
    pipeline: vi.fn(() => {
      const ops: Array<() => Promise<[null, unknown]>> = []
      const pipe = {
        del: vi.fn((key: string) => {
          ops.push(async () => { store.delete(key); return [null, 1] as [null, unknown] })
          return pipe
        }),
        hset: vi.fn((key: string, hash: Record<string, string>) => {
          ops.push(async () => { store.set(key, { ...hash }); return [null, 'OK'] as [null, unknown] })
          return pipe
        }),
        hgetall: vi.fn((key: string) => {
          ops.push(async () => [null, store.get(key) ?? {}] as [null, unknown])
          return pipe
        }),
        exec: vi.fn(async () => {
          const results: Array<[null, unknown]> = []
          for (const op of ops) results.push(await op())
          return results
        }),
      }
      return pipe
    }),
    _store: store,
    _sets: sets,
  }
}

class TestRepository extends RedisRepository<TestEntity> {
  constructor(redis: unknown, options: RedisStoreModuleOptions) {
    super(redis as never, options, 'test-entity', testMapper)
  }

  protected getId(entity: TestEntity): string {
    return entity.id
  }
}

describe('RedisRepository', () => {
  let repo: TestRepository
  let mockRedis: ReturnType<typeof createMockRedis>

  beforeEach(() => {
    mockRedis = createMockRedis()
    repo = new TestRepository(mockRedis, storeOptions)
  })

  describe('save and findById', () => {
    it('should save entity as Redis hash and retrieve it', async () => {
      const entity: TestEntity = { id: 'e1', name: 'Entity One', active: true }
      await repo.save(entity)

      const found = await repo.findById('e1')
      expect(found).toEqual(entity)
    })

    it('should return null for non-existent entity', async () => {
      const found = await repo.findById('nonexistent')
      expect(found).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete entity key', async () => {
      await repo.save({ id: 'e1', name: 'test', active: true })
      await repo.delete('e1')

      const found = await repo.findById('e1')
      expect(found).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return all entities via SCAN', async () => {
      await repo.save({ id: 'e1', name: 'One', active: true })
      await repo.save({ id: 'e2', name: 'Two', active: false })

      const all = await repo.findAll()
      expect(all).toHaveLength(2)
      expect(all.map(e => e.id).sort()).toEqual(['e1', 'e2'])
    })

    it('should return empty array when no entities', async () => {
      mockRedis.scan.mockResolvedValue(['0', []])
      const all = await repo.findAll()
      expect(all).toEqual([])
    })
  })

  describe('index operations', () => {
    it('should add to and query by index', async () => {
      await repo.save({ id: 'e1', name: 'Active', active: true })
      await repo.addToIndex('active', 'e1')

      const results = await repo.findByIndex('active')
      expect(results).toHaveLength(1)
      expect(results[0]!.id).toBe('e1')
    })

    it('should remove from index', async () => {
      await repo.addToIndex('active', 'e1')
      await repo.removeFromIndex('active', 'e1')

      const results = await repo.findByIndex('active')
      expect(results).toHaveLength(0)
    })
  })

  describe('key generation', () => {
    it('should use correct key format: serviceName:aggregateName:id', async () => {
      await repo.save({ id: 'e1', name: 'test', active: true })

      // After save, the entity hash should exist at the correct key
      expect(mockRedis._store.has('test-svc:test-entity:e1')).toBe(true)
    })
  })
})
