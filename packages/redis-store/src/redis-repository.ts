import { Inject, Logger } from '@nestjs/common'
import type Redis from 'ioredis'
import type { Repository } from '@the-crew/domain-core'
import { REDIS_STORE_CLIENT, REDIS_STORE_OPTIONS } from './redis-store.constants'
import type { RedisStoreModuleOptions } from './redis-store.module'

export interface RedisEntityMapper<T> {
  toHash(entity: T): Record<string, string>
  fromHash(id: string, fields: Record<string, string>): T
}

export abstract class RedisRepository<T, TId extends string = string>
  implements Repository<T, TId>
{
  protected readonly logger: Logger

  constructor(
    @Inject(REDIS_STORE_CLIENT) protected readonly redis: Redis,
    @Inject(REDIS_STORE_OPTIONS) protected readonly storeOptions: RedisStoreModuleOptions,
    protected readonly aggregateName: string,
    protected readonly mapper: RedisEntityMapper<T>,
  ) {
    this.logger = new Logger(`RedisRepo:${aggregateName}`)
  }

  protected keyFor(id: TId): string {
    return `${this.storeOptions.serviceName}:${this.aggregateName}:${id}`
  }

  protected indexKey(name: string): string {
    return `${this.storeOptions.serviceName}:${this.aggregateName}:idx:${name}`
  }

  async findById(id: TId): Promise<T | null> {
    const key = this.keyFor(id)
    const fields = await this.redis.hgetall(key)

    if (!fields || Object.keys(fields).length === 0) {
      return null
    }

    return this.mapper.fromHash(id, fields)
  }

  async save(entity: T): Promise<void> {
    const id = this.getId(entity)
    const key = this.keyFor(id)
    const hash = this.mapper.toHash(entity)

    const pipeline = this.redis.pipeline()
    pipeline.del(key)
    pipeline.hset(key, hash)

    await pipeline.exec()
  }

  async delete(id: TId): Promise<void> {
    const key = this.keyFor(id)
    await this.redis.del(key)
  }

  async findAll(): Promise<T[]> {
    const pattern = `${this.storeOptions.serviceName}:${this.aggregateName}:*`
    const indexPattern = `${this.storeOptions.serviceName}:${this.aggregateName}:idx:*`
    const keys: string[] = []
    let cursor = '0'

    do {
      const [nextCursor, batch] = await this.redis.scan(
        cursor, 'MATCH', pattern, 'COUNT', '100',
      )
      cursor = nextCursor
      for (const k of batch) {
        if (!k.startsWith(indexPattern.replace('*', ''))) {
          keys.push(k)
        }
      }
    } while (cursor !== '0')

    if (keys.length === 0) return []

    const pipeline = this.redis.pipeline()
    for (const key of keys) {
      pipeline.hgetall(key)
    }

    const results = await pipeline.exec()
    const entities: T[] = []

    if (results) {
      for (let i = 0; i < results.length; i++) {
        const [err, fields] = results[i]!
        if (err || !fields || typeof fields !== 'object') continue
        const record = fields as Record<string, string>
        if (Object.keys(record).length === 0) continue
        const key = keys[i]!
        const id = key.split(':').pop()!
        entities.push(this.mapper.fromHash(id, record))
      }
    }

    return entities
  }

  async addToIndex(indexName: string, id: TId): Promise<void> {
    await this.redis.sadd(this.indexKey(indexName), id)
  }

  async removeFromIndex(indexName: string, id: TId): Promise<void> {
    await this.redis.srem(this.indexKey(indexName), id)
  }

  async findByIndex(indexName: string): Promise<T[]> {
    const ids = await this.redis.smembers(this.indexKey(indexName))
    if (ids.length === 0) return []

    const entities: T[] = []
    for (const id of ids) {
      const entity = await this.findById(id as TId)
      if (entity) entities.push(entity)
    }
    return entities
  }

  protected abstract getId(entity: T): TId
}
