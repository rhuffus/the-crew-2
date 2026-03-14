import { describe, it, expect, vi } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn()
    $disconnect = vi.fn()
  }
  return { PrismaClient: MockPrismaClient }
})

import { PRISMA_CLIENT, PrismaBaseService, PrismaModule } from '../index'

describe('package exports', () => {
  it('should export PRISMA_CLIENT symbol', () => {
    expect(PRISMA_CLIENT).toBeDefined()
    expect(typeof PRISMA_CLIENT).toBe('symbol')
  })

  it('should export PrismaBaseService class', () => {
    expect(PrismaBaseService).toBeDefined()
    expect(typeof PrismaBaseService).toBe('function')
  })

  it('should export PrismaModule class', () => {
    expect(PrismaModule).toBeDefined()
    expect(typeof PrismaModule).toBe('function')
    expect(typeof PrismaModule.forRoot).toBe('function')
  })
})
