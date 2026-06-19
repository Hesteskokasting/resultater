// Minimal ESC/POS encoder for 55mm thermal receipt printers.
// All byte sequences follow the ESC/POS standard command set.

export const RECEIPT_COLS = 32

const NUL = 0x00
const LF  = 0x0A
const ESC = 0x1B
const GS  = 0x1D

function bytes(...vals: number[]): Uint8Array {
  return new Uint8Array(vals)
}

/** ESC @ — initialize printer (reset all modes) */
export function init(): Uint8Array {
  return bytes(ESC, 0x40)
}

/** ESC a n — select justification: 0=left, 1=center, 2=right */
export function align(dir: 'left' | 'center' | 'right'): Uint8Array {
  const n = dir === 'center' ? 1 : dir === 'right' ? 2 : 0
  return bytes(ESC, 0x61, n)
}

/** ESC ! n — select print mode (bit 3 = emphasized/bold, bit 4 = double-height, bit 5 = double-width) */
export function bold(on: boolean): Uint8Array {
  return bytes(ESC, 0x21, on ? 0x08 : 0x00)
}

/**
 * GS ! n — select character size, independent of bold (ESC !).
 * widthMul/heightMul: 1 = normal, 2 = double.
 * Double-height only (1, 2) keeps the 32-column line limit intact.
 */
export function charSize(widthMul: 1 | 2, heightMul: 1 | 2): Uint8Array {
  const n = ((widthMul - 1) << 4) | (heightMul - 1)
  return bytes(GS, 0x21, n)
}

/**
 * Encode a text string as Latin-1 bytes.
 * Norwegian special chars are transliterated so they print correctly
 * regardless of which code page the printer is configured to use.
 * The line is truncated to RECEIPT_COLS and a LF is appended.
 */
export function textLine(s: string): Uint8Array {
  const normalized = s
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/Æ/g, 'Ae').replace(/Ø/g, 'Oe').replace(/Å/g, 'Aa')
    .slice(0, RECEIPT_COLS)

  const out = new Uint8Array(normalized.length + 1)
  for (let i = 0; i < normalized.length; i++) {
    out[i] = normalized.charCodeAt(i) & 0xFF
  }
  out[normalized.length] = LF
  return out
}

/** A full-width separator line followed by LF */
export function separator(): Uint8Array {
  return textLine('-'.repeat(RECEIPT_COLS))
}

/** ESC d n — feed n lines */
export function feed(lines = 3): Uint8Array {
  return bytes(ESC, 0x64, lines)
}

/** GS V A (0x41) — full paper cut */
export function cut(): Uint8Array {
  return bytes(GS, 0x56, 0x41, NUL)
}

/** Concatenate multiple Uint8Arrays into one */
export function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) {
    out.set(a, offset)
    offset += a.length
  }
  return out
}
