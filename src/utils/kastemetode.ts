/**
 * Innledende kastemetoder scored as individually-thrown X-kast courts
 * (xkast_kongelag tables) rather than head-to-head kamper.
 */
export function isXkastMethodName(navn: string): boolean {
  const n = navn.toLowerCase()
  return n.includes('x-kast') || n.includes('minimatch') || n.includes('halvmatch') || n.includes('heilmatch')
}

/**
 * Innledende kastemetoder whose kamp generation is driven by
 * stevne.antall_runder_innl (Gloppen/NHM). X-kast methods get their omgang
 * count from kastemetode.antall_omganger instead.
 */
export function usesInitialRoundCount(navn: string): boolean {
  const n = navn.toLowerCase()
  return n.includes('gloppen') || n.includes('nordhordland')
}
