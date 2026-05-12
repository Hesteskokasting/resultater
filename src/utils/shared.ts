import * as XLSX from 'xlsx'

// ── Dato-formatering ──────────────────────────────────────────────────────────

const datoFmtKort    = new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const datoFmtNumeric = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'numeric', year: 'numeric' })
const datoFmtLang    = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// Bare date strings (YYYY-MM-DD) are parsed as UTC midnight by JS, which shifts
// the display date by one day for Norwegian users (UTC+1/+2). Use local noon instead.
function _parseDate(datoStr: string): Date {
  return datoStr.length === 10 ? new Date(datoStr + 'T12:00:00') : new Date(datoStr)
}

export function formaterDato(datoStr: string | null | undefined): string {
  if (!datoStr) return ''
  return datoFmtKort.format(_parseDate(datoStr))
}

export function formaterDatoNumeric(datoStr: string | null | undefined): string {
  if (!datoStr) return ''
  return datoFmtNumeric.format(_parseDate(datoStr))
}

export function formaterDatoLang(datoStr: string | null | undefined): string {
  if (!datoStr) return ''
  return datoFmtLang.format(_parseDate(datoStr))
}

export function formaterTid(tidStr: string | null | undefined): string {
  if (!tidStr) return ''
  return tidStr.slice(0, 5)
}

// ── Excel-eksport ─────────────────────────────────────────────────────────────

export function lastNedExcel(rader: Record<string, unknown>[], filnamn: string, arknamn = 'Data'): void {
  const ark = XLSX.utils.json_to_sheet(rader)
  const bok = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(bok, ark, arknamn)
  XLSX.writeFile(bok, filnamn)
}

// ── År-dropdown ───────────────────────────────────────────────────────────────

export function arOptions(valgt: number, fra: number, til = new Date().getFullYear()): string {
  let html = ''
  for (let ar = til; ar >= fra; ar--) {
    html += `<option value="${ar}"${ar === valgt ? ' selected' : ''}>${ar}</option>`
  }
  return html
}
