import { describe, expect, it } from 'vitest'
import { calcPuljeSizes } from '@/utils/calcPuljeSizes'

describe('calcPuljeSizes', () => {
  it('fills courts fairly instead of greedily (45 players, cap 10)', () => {
    expect(calcPuljeSizes(45, 10)).toEqual([9, 9, 9, 9, 9])
  })

  it('spreads the remainder across the first puljer (45 players, cap 12)', () => {
    expect(calcPuljeSizes(45, 12)).toEqual([12, 11, 11, 11])
  })

  it('returns a single pulje when everyone fits', () => {
    expect(calcPuljeSizes(8, 10)).toEqual([8])
  })

  it('handles exact division', () => {
    expect(calcPuljeSizes(30, 10)).toEqual([10, 10, 10])
  })

  it('handles cap of 1 (one participant per pulje)', () => {
    expect(calcPuljeSizes(3, 1)).toEqual([1, 1, 1])
  })

  it('returns empty for zero participants', () => {
    expect(calcPuljeSizes(0, 10)).toEqual([])
  })

  it('never exceeds the cap and always sums to the participant count', () => {
    for (let count = 1; count <= 60; count++) {
      for (let cap = 1; cap <= 15; cap++) {
        const sizes = calcPuljeSizes(count, cap)
        expect(sizes.reduce((a, b) => a + b, 0)).toBe(count)
        expect(Math.max(...sizes)).toBeLessThanOrEqual(cap)
        expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1)
      }
    }
  })

  it('rejects invalid input', () => {
    expect(() => calcPuljeSizes(-1, 10)).toThrow()
    expect(() => calcPuljeSizes(4.5, 10)).toThrow()
    expect(() => calcPuljeSizes(10, 0)).toThrow()
    expect(() => calcPuljeSizes(10, -2)).toThrow()
    expect(() => calcPuljeSizes(10, 2.5)).toThrow()
  })
})
