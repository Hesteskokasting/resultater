import { describe, expect, it } from 'vitest'
import { calcXkastCourtSizes } from '@/utils/calcXkastCourtSizes'

describe('calcXkastCourtSizes', () => {
  it('splits even counts into pairs regardless of lane cap', () => {
    expect(calcXkastCourtSizes(2, false)).toEqual([2])
    expect(calcXkastCourtSizes(8, false)).toEqual([2, 2, 2, 2])
    expect(calcXkastCourtSizes(8, true)).toEqual([2, 2, 2, 2])
  })

  it('puts the odd player alone on the last court when lanes are unlimited', () => {
    expect(calcXkastCourtSizes(3, false)).toEqual([2, 1])
    expect(calcXkastCourtSizes(5, false)).toEqual([2, 2, 1])
    expect(calcXkastCourtSizes(9, false)).toEqual([2, 2, 2, 2, 1])
  })

  it('puts the odd remainder on the last court as a three when a lane cap is set', () => {
    expect(calcXkastCourtSizes(3, true)).toEqual([3])
    expect(calcXkastCourtSizes(5, true)).toEqual([2, 3])
    expect(calcXkastCourtSizes(9, true)).toEqual([2, 2, 2, 3])
  })

  it('handles the single-participant edge case', () => {
    expect(calcXkastCourtSizes(1, false)).toEqual([1])
    expect(calcXkastCourtSizes(1, true)).toEqual([1])
  })

  it('returns empty for zero participants', () => {
    expect(calcXkastCourtSizes(0, false)).toEqual([])
  })

  it('always sums to the participant count with pairs everywhere except the last court', () => {
    for (const hasLaneCap of [false, true]) {
      for (let count = 2; count <= 40; count++) {
        const sizes = calcXkastCourtSizes(count, hasLaneCap)
        expect(sizes.reduce((a, b) => a + b, 0)).toBe(count)
        expect(sizes.slice(0, -1).every(s => s === 2)).toBe(true)
        expect(hasLaneCap ? [2, 3] : [1, 2]).toContain(sizes[sizes.length - 1])
      }
    }
  })

  it('rejects invalid input', () => {
    expect(() => calcXkastCourtSizes(-1, false)).toThrow()
    expect(() => calcXkastCourtSizes(4.5, true)).toThrow()
  })
})
