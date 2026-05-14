export interface SpelarScore {
  score_poeng?: number | null
  omgangar?: { score?: number | null }[] | null
}

export interface SpelarRinger {
  antall_ringer?: number | null
  omgangar?: { antall_ringer?: number | null }[] | null
}

export interface SpelarMedPosit {
  kasterid: number
  posisjon?: number | null
}

export function beregnKampPoeng(s1: number, s2: number): [number, number] {
  if (s1 === s2) return [1.5, 1.5]
  if (s1 > s2) return [2, s2 >= 11 ? 1 : 0]
  return [s1 >= 11 ? 1 : 0, 2]
}

export function hentP1P2<T extends SpelarMedPosit>(
  spelarar: T[] | null | undefined,
  startnrMap: Record<number, number>,
): [T | null, T | null] {
  const sp = spelarar ?? []
  if (sp.some(s => s.posisjon != null)) {
    return [sp.find(s => s.posisjon === 1) ?? null, sp.find(s => s.posisjon === 2) ?? null]
  }
  const sorted = [...sp].sort(
    (a, b) => (startnrMap[a.kasterid] ?? Infinity) - (startnrMap[b.kasterid] ?? Infinity),
  )
  return [sorted[0] ?? null, sorted[1] ?? null]
}

export function scoreForSp(sp: SpelarScore | null | undefined): number {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.score ?? 0), 0)
  return sp?.score_poeng ?? 0
}

export function ringerForSp(sp: SpelarRinger | null | undefined): number {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0)
  return sp?.antall_ringer ?? 0
}
