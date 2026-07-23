import { describe, expect, it } from 'vitest'
import { isValidOmgangEntry, ringOptions, validRingerRange } from '@/utils/omgangValidation'

describe('validRingerRange', () => {
  it('20 poeng requires exactly 4 ringere', () => {
    expect(validRingerRange(20)).toEqual({ min: 4, max: 4 })
  })

  it('0 poeng means 0 ringere', () => {
    expect(validRingerRange(0)).toEqual({ min: 0, max: 0 })
  })

  it('12 poeng can be thrown with 0-2 ringere (4x3, or with ringers)', () => {
    expect(validRingerRange(12)).toEqual({ min: 0, max: 2 })
  })

  it('13 poeng needs at least one ringer (max without is 12)', () => {
    expect(validRingerRange(13)).toEqual({ min: 1, max: 2 })
  })
})

describe('ringOptions', () => {
  it('auto-selects when only one ring count is possible', () => {
    expect(ringOptions(3)).toEqual({ allowed: [0], autoSelected: 0 })
    expect(ringOptions(18)).toEqual({ allowed: [3], autoSelected: 3 })
    expect(ringOptions(20)).toEqual({ allowed: [4], autoSelected: 4 })
  })

  it('offers all valid counts without auto-selection when ambiguous', () => {
    expect(ringOptions(8)).toEqual({ allowed: [0, 1], autoSelected: null })
    expect(ringOptions(12)).toEqual({ allowed: [0, 1, 2], autoSelected: null })
    expect(ringOptions(15)).toEqual({ allowed: [2, 3], autoSelected: null })
  })

  it('returns no options for an impossible poengsum (19)', () => {
    // 5+5+5+3 = 18 is the max below a clean 4-ringer 20
    expect(ringOptions(19)).toEqual({ allowed: [], autoSelected: null })
  })
})

describe('isValidOmgangEntry', () => {
  it('accepts typical entries', () => {
    expect(isValidOmgangEntry(0, 0)).toBe(true)
    expect(isValidOmgangEntry(12, 2)).toBe(true)   // 2 ringere + 2 enkle à 1
    expect(isValidOmgangEntry(20, 4)).toBe(true)   // full house
    expect(isValidOmgangEntry(5, 1)).toBe(true)    // one ringer, rest zero
    expect(isValidOmgangEntry(12, 0)).toBe(true)   // 4 shoes à 3
  })

  it('rejects impossible poeng/ringer combinations', () => {
    expect(isValidOmgangEntry(20, 0)).toBe(false)  // max without ringere is 12
    expect(isValidOmgangEntry(13, 0)).toBe(false)
    expect(isValidOmgangEntry(4, 1)).toBe(false)   // one ringer alone is already 5
    expect(isValidOmgangEntry(0, 1)).toBe(false)
  })

  it('rejects out-of-range and non-integer values', () => {
    expect(isValidOmgangEntry(21, 4)).toBe(false)
    expect(isValidOmgangEntry(-1, 0)).toBe(false)
    expect(isValidOmgangEntry(10, 5)).toBe(false)
    expect(isValidOmgangEntry(10, -1)).toBe(false)
    expect(isValidOmgangEntry(10.5, 2)).toBe(false)
    expect(isValidOmgangEntry(10, 1.5)).toBe(false)
  })

  it('agrees with the shoe model across the full range', () => {
    // Brute-force all shoe combinations: each shoe is 5 (ringer) or 0-3.
    const possible = new Set<string>()
    for (let a = 0; a <= 5; a++) for (let b = 0; b <= 5; b++)
      for (let c = 0; c <= 5; c++) for (let d = 0; d <= 5; d++) {
        const shoes = [a, b, c, d]
        if (shoes.some(s => s === 4)) continue // 4 is not a possible shoe value
        const poeng = shoes.reduce((x, y) => x + y, 0)
        const ringere = shoes.filter(s => s === 5).length
        possible.add(`${poeng}:${ringere}`)
      }
    for (let poeng = 0; poeng <= 20; poeng++) {
      for (let ringere = 0; ringere <= 4; ringere++) {
        expect(isValidOmgangEntry(poeng, ringere)).toBe(possible.has(`${poeng}:${ringere}`))
      }
    }
  })
})
