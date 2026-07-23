import { describe, it, expect } from 'vitest'
import { buildCupMatchRows, computeFormatLaneOffset } from '@/services/kampGenereringCupService'
import type { RoundSetup } from '@/types'

type CupPairing = { players: number[]; isWalkover: boolean; isThreePlayers: boolean }

/** Deterministic id generator so match_id is predictable in assertions. */
function seqIds(): () => string {
  let n = 0
  return () => `m${++n}`
}

const EMPTY_SIDES = { kasteridToSnr: {}, snrToMembers: {} }

describe('buildCupMatchRows', () => {
  it('assigns sequential lanes from laneStart for non-walkover matches', () => {
    const pairings: CupPairing[] = [
      { players: [1, 2], isWalkover: false, isThreePlayers: false },
      { players: [3, 4], isWalkover: false, isThreePlayers: false },
    ]
    const built = buildCupMatchRows(10, pairings, 1, 'A', EMPTY_SIDES, 3, null, seqIds())

    expect(built.map((b) => b.match.bane_nummer)).toEqual([4, 5])
    expect(built.map((b) => b.match.match_id)).toEqual(['m1', 'm2'])
    expect(built.every((b) => b.match.stevneid === 10 && b.match.fase === 'avsluttende' && b.match.runde_nummer === 1)).toBe(true)
  })

  it('gives walkover matches a null lane + confirmed flag, and does not consume a lane number', () => {
    const pairings: CupPairing[] = [
      { players: [1], isWalkover: true, isThreePlayers: false },
      { players: [2, 3], isWalkover: false, isThreePlayers: false },
    ]
    const built = buildCupMatchRows(10, pairings, 1, 'A', EMPTY_SIDES, 0, null, seqIds())

    expect(built[0]!.match.bane_nummer).toBeNull()
    expect(built[0]!.match.er_walkover).toBe(true)
    expect(built[0]!.match.er_bekreftet).toBe(true)
    // the walkover did not take lane 1 — the real match does
    expect(built[1]!.match.bane_nummer).toBe(1)
    expect(built[1]!.match.er_bekreftet).toBe(false)
  })

  it('expands a representative kasterid to all side members (pairs/mix)', () => {
    const sideInfo = {
      kasteridToSnr: { 1: 5, 2: 5, 3: 6, 4: 6 },
      snrToMembers: { 5: [1, 2], 6: [3, 4] },
    }
    const pairings: CupPairing[] = [
      { players: [1, 3], isWalkover: false, isThreePlayers: false },
    ]
    const built = buildCupMatchRows(10, pairings, 2, 'B', sideInfo, 0, 'Semifinale', seqIds())

    expect(built[0]!.playerKasterids).toEqual([1, 2, 3, 4])
    expect(built[0]!.match.runde_navn).toBe('Semifinale')
    expect(built[0]!.match.gruppe_navn).toBe('B')
  })

  it('falls back to the kasterid itself when it has no side mapping (singel)', () => {
    const pairings: CupPairing[] = [
      { players: [7, 8], isWalkover: false, isThreePlayers: false },
    ]
    const built = buildCupMatchRows(10, pairings, 1, null, EMPTY_SIDES, 0, null, seqIds())

    expect(built[0]!.playerKasterids).toEqual([7, 8])
    expect(built[0]!.match.gruppe_navn).toBeNull()
  })

  it('returns an empty array for no pairings', () => {
    expect(buildCupMatchRows(10, [], 1, 'A', EMPTY_SIDES, 0, null, seqIds())).toEqual([])
  })
})

describe('computeFormatLaneOffset', () => {
  const GROUP_ORDER = ['A', 'B', 'C']
  const format: Record<string, RoundSetup> = {
    A: { walkovers: 0, c3: 2, c2: 1 },
    B: { walkovers: 0, c3: 1, c2: 1 },
    C: { walkovers: 0, c3: 1, c2: 0 },
  }

  it('returns 0 when there is no format', () => {
    expect(computeFormatLaneOffset(null, 'B', GROUP_ORDER)).toBe(0)
  })

  it('returns 0 when the group name is null', () => {
    expect(computeFormatLaneOffset(format, null, GROUP_ORDER)).toBe(0)
  })

  it('returns 0 for the first group', () => {
    expect(computeFormatLaneOffset(format, 'A', GROUP_ORDER)).toBe(0)
  })

  it('sums lanes (c3 + c2) of all earlier groups', () => {
    expect(computeFormatLaneOffset(format, 'B', GROUP_ORDER)).toBe(3) // A: 2 + 1
    expect(computeFormatLaneOffset(format, 'C', GROUP_ORDER)).toBe(5) // A:3 + B:2
  })
})
