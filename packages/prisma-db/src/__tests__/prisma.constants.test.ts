import { describe, it, expect } from 'vitest'
import { PRISMA_CLIENT } from '../prisma.constants'

describe('PRISMA_CLIENT', () => {
  it('should be a symbol', () => {
    expect(typeof PRISMA_CLIENT).toBe('symbol')
  })

  it('should have descriptive name', () => {
    expect(PRISMA_CLIENT.toString()).toBe('Symbol(PRISMA_CLIENT)')
  })
})
