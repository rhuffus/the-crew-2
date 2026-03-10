import { describe, it, expect } from 'vitest'
import { ValueObject } from '../value-object.js'

interface MoneyProps {
  amount: number
  currency: string
}

class Money extends ValueObject<MoneyProps> {
  get amount() {
    return this.props.amount
  }
  get currency() {
    return this.props.currency
  }
}

describe('ValueObject', () => {
  it('should create a value object with props', () => {
    const money = new Money({ amount: 100, currency: 'EUR' })
    expect(money.amount).toBe(100)
    expect(money.currency).toBe('EUR')
  })

  it('should be equal to another value object with the same props', () => {
    const money1 = new Money({ amount: 100, currency: 'EUR' })
    const money2 = new Money({ amount: 100, currency: 'EUR' })
    expect(money1.equals(money2)).toBe(true)
  })

  it('should not be equal to a value object with different props', () => {
    const money1 = new Money({ amount: 100, currency: 'EUR' })
    const money2 = new Money({ amount: 200, currency: 'EUR' })
    expect(money1.equals(money2)).toBe(false)
  })

  it('should not be equal to null or undefined', () => {
    const money = new Money({ amount: 100, currency: 'EUR' })
    expect(money.equals(null as unknown as Money)).toBe(false)
    expect(money.equals(undefined as unknown as Money)).toBe(false)
  })

  it('should have frozen props', () => {
    const money = new Money({ amount: 100, currency: 'EUR' })
    expect(() => {
      ;(money as unknown as { props: MoneyProps }).props.amount = 200
    }).toThrow()
  })
})
