// X-kast standings: rank by total poeng, then total ringere, then the
// omgang arrays compared best-first (level 3+ tiebreak from
// plans/x-kast_kongelag-schema.md 3.1). Pure — the view maps service rows
// into XkastStandingParticipant.

export interface XkastStandingParticipant {
  kasterid: number
  navn: string
  omganger: { poeng: number; antall_ringer: number | null }[]
  /**
   * Set when the participant has a directly-entered total (no omganger).
   * The standing then uses these figures; `antallOmganger` is the configured
   * count so the O column reads as complete. No per-omgang tiebreaker array,
   * so manual totals rank on poeng → ringere only.
   */
  manualTotal?: { poeng: number; antallRinger: number; antallOmganger: number } | null
}

export interface XkastStandingRow {
  kasterid: number
  navn: string
  poeng: number
  antallRinger: number
  antallOmganger: number
  omgangPoengDesc: number[]
  plassering: number
}

/**
 * Compares two best-first omgang arrays: highest first entry wins, then the
 * second, and so on. A missing entry counts as -1 so a recorded 0 still beats
 * an unthrown omgang. Returns negative when `a` ranks first.
 */
export function compareOmgangArrays(a: number[], b: number[]): number {
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const diff = (b[i] ?? -1) - (a[i] ?? -1)
    if (diff !== 0) return diff
  }
  return 0
}

/**
 * The shared X-kast/Kongelag ranking order: total poeng, then total ringere,
 * then best-first omgang arrays. Kongelag layers displayTotal on top of this
 * (see buildKongelagStanding). Keeping it in one place means a tiebreaker rule
 * change (see issue #12) touches only here.
 */
export function compareXkastRows(a: XkastStandingRow, b: XkastStandingRow): number {
  if (b.poeng !== a.poeng) return b.poeng - a.poeng
  if (b.antallRinger !== a.antallRinger) return b.antallRinger - a.antallRinger
  return compareOmgangArrays(a.omgangPoengDesc, b.omgangPoengDesc)
}

/** Sorts rows with `compare` and stamps 1-based `plassering`, ties sharing a placement (1, 1, 3). */
export function assignPlacements<T extends { plassering: number }>(
  rows: T[],
  compare: (a: T, b: T) => number,
): T[] {
  rows.sort(compare)
  let placement = 1
  rows.forEach((row, i) => {
    const previous = rows[i - 1]
    if (previous && compare(previous, row) !== 0) placement = i + 1
    row.plassering = placement
  })
  return rows
}

export function buildXkastStanding(participants: XkastStandingParticipant[]): XkastStandingRow[] {
  const rows: XkastStandingRow[] = participants.map(p => {
    if (p.manualTotal) {
      return {
        kasterid: p.kasterid,
        navn: p.navn,
        poeng: p.manualTotal.poeng,
        antallRinger: p.manualTotal.antallRinger,
        antallOmganger: p.manualTotal.antallOmganger,
        omgangPoengDesc: [],
        plassering: 0,
      }
    }
    return {
      kasterid: p.kasterid,
      navn: p.navn,
      poeng: p.omganger.reduce((sum, o) => sum + o.poeng, 0),
      antallRinger: p.omganger.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0),
      antallOmganger: p.omganger.length,
      omgangPoengDesc: p.omganger.map(o => o.poeng).sort((a, b) => b - a),
      plassering: 0,
    }
  })

  return assignPlacements(rows, compareXkastRows)
}
