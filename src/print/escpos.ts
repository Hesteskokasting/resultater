// Minimal ESC/POS encoder for 55mm thermal receipt printers.
// All byte sequences follow the ESC/POS standard command set.

export const RECEIPT_COLS = 32;

const NUL = 0x00;
const LF = 0x0a;
const ESC = 0x1b;
const GS = 0x1d;

function bytes(...vals: number[]): Uint8Array {
  return new Uint8Array(vals);
}

// ESC t n — character code page. 16 = WPC1252, which is Latin-1 compatible in
// the 0xA0-0xFF range, so æ/ø/å print from their plain char codes.
// If the printer shows garbage instead, it lacks page 16: switch to 5 (CP865)
// and add a Unicode → CP865 byte map in encodeChar().
const CODE_PAGE = 16;

/** ESC @ + ESC t — initialize printer (reset all modes) and select the code page */
export function init(): Uint8Array {
  return bytes(ESC, 0x40, ESC, 0x74, CODE_PAGE);
}

/** ESC a n — select justification: 0=left, 1=center, 2=right */
export function align(dir: "left" | "center" | "right"): Uint8Array {
  const n = dir === "center" ? 1 : dir === "right" ? 2 : 0;
  return bytes(ESC, 0x61, n);
}

/** ESC ! n — select print mode (bit 3 = emphasized/bold, bit 4 = double-height, bit 5 = double-width) */
export function bold(on: boolean): Uint8Array {
  return bytes(ESC, 0x21, on ? 0x08 : 0x00);
}

/** Character size multiplier: 1 = normal, up to 8× per ESC/POS GS ! */
export type SizeMul = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * GS ! n — select character size, independent of bold (ESC !).
 * Keeping widthMul at 1 preserves the 32-column line limit; a wider
 * setting scales the glyphs but halves (or worse) the columns that fit.
 */
export function charSize(widthMul: SizeMul, heightMul: SizeMul): Uint8Array {
  const n = ((widthMul - 1) << 4) | (heightMul - 1);
  return bytes(GS, 0x21, n);
}

/**
 * Encode a text string as Latin-1 bytes for the selected code page.
 * Control bytes (< 0x20) are stripped to spaces so user-sourced text
 * (player/club names) can't inject ESC/POS commands into the stream.
 * Anything outside Latin-1 has no byte on the printer and becomes "?".
 * The line is truncated to RECEIPT_COLS and a LF is appended.
 */
export function textLine(s: string): Uint8Array {
  const normalized = s
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .slice(0, RECEIPT_COLS);

  const out = new Uint8Array(normalized.length + 1);
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    out[i] = code <= 0xff ? code : 0x3f;
  }
  out[normalized.length] = LF;
  return out;
}

/** A full-width separator line followed by LF */
export function separator(): Uint8Array {
  return textLine("-".repeat(RECEIPT_COLS));
}

/** GS V A (0x41) — full paper cut */
export function cut(): Uint8Array {
  return bytes(GS, 0x56, 0x41, NUL);
}

/** Concatenate multiple Uint8Arrays into one */
export function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}
