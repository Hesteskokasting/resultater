/**
 * Innledende kastemetoder scored as individually-thrown X-kast courts
 * (xkast_kongelag tables) rather than head-to-head kamper.
 */
export function isXkastMethodName(navn: string): boolean {
  const n = navn.toLowerCase()
  return n.includes('x-kast') || n.includes('minimatch') || n.includes('halvmatch') || n.includes('heilmatch')
}
