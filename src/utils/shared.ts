import { parseLocalDate } from './parseLocalDate'

// ── Dato-formatering ──────────────────────────────────────────────────────────

const datoFmtKort    = new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const datoFmtNumeric = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'numeric', year: 'numeric' })
const datoFmtLang    = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function formaterDato(datoStr: string | null | undefined): string {
  if (!datoStr) return ''
  return datoFmtKort.format(parseLocalDate(datoStr))
}

export function formaterDatoNumeric(datoStr: string | null | undefined): string {
  if (!datoStr) return ''
  return datoFmtNumeric.format(parseLocalDate(datoStr))
}

export function formaterDatoLang(datoStr: string | null | undefined): string {
  if (!datoStr) return ''
  return datoFmtLang.format(parseLocalDate(datoStr))
}

export function formaterTid(tidStr: string | null | undefined): string {
  if (!tidStr) return ''
  return tidStr.slice(0, 5)
}

// ── Tal-formatering ───────────────────────────────────────────────────────────

const prosentFmt = new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formaterProsent(p: number | null | undefined): string {
  if (p == null) return '–'
  return prosentFmt.format(p) + ' %'
}

// ── Excel-eksport ─────────────────────────────────────────────────────────────

export async function lastNedExcel(rader: Record<string, unknown>[], filnavn: string, arknavn = 'Data'): Promise<void> {
  const XLSX = await import('xlsx')
  const ark = XLSX.utils.json_to_sheet(rader)
  const bok = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(bok, ark, arknavn)
  XLSX.writeFile(bok, filnavn)
}

// ── År-dropdown ───────────────────────────────────────────────────────────────

export function arOptions(valgt: number, fra: number, til = new Date().getFullYear()): string {
  let html = ''
  for (let ar = til; ar >= fra; ar--) {
    html += `<option value="${ar}"${ar === valgt ? ' selected' : ''}>${ar}</option>`
  }
  return html
}
