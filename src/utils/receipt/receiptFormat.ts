import type { RoundInfo } from "@/utils/startcard/startcard-template";
import {
  RECEIPT_COLS,
  init,
  align,
  bold,
  charSize,
  textLine,
  separator,
  cut,
  concat,
} from "./escpos";

export interface ReceiptPlayerData {
  startnummer: number | string;
  namn: string | null;
  klubb: string;
  roundInfos: RoundInfo[];
  stevneNavn: string;
}

/** Left-pad a value to a fixed width, truncated if too long. */
function pad(val: string | number | null | undefined, width: number): string {
  const s = String(val ?? "").slice(0, width);
  return s.padStart(width);
}

/** Left-align a string in a field of given width, truncated if needed. */
function field(val: string | number | null | undefined, width: number): string {
  const s = String(val ?? "").slice(0, width);
  return s.padEnd(width);
}

/**
 * Build one receipt for a single player/pair.
 * Layout (32 chars max per line):
 *
 *   --------------------------------
 *   STARTKORT - GLOPPEN
 *   <stevneNavn>
 *   --------------------------------
 *   <namn>
 *   Nr:<startnr>  Klubb:<klubb>
 *   --------------------------------
 *   Rnd B Motstandar
 *   1   5 Per Olsen
 *   --------------------------------
 *   (feed + cut)
 */
export function formatStartkortReceipt(data: ReceiptPlayerData): Uint8Array {
  const parts: Uint8Array[] = [];

  const push = (...arrays: Uint8Array[]) => parts.push(...arrays);

  push(init());

  // ── Header ──────────────────────────────────────────────────────────────────
  push(separator());
  push(align("center"), bold(true));
  push(textLine("STARTKORT - GLOPPEN"));
  push(bold(false), align("left"));
  push(textLine(data.stevneNavn));
  push(separator());

  // ── Player info ─────────────────────────────────────────────────────────────
  push(charSize(1, 2));
  push(textLine(data.namn ?? ""));
  push(charSize(1, 1));

  const nrLabel = `Nr:${data.startnummer}`;
  const klubbStr = `Klubb:${data.klubb}`.slice(0, RECEIPT_COLS - nrLabel.length - 2);
  push(textLine(`${nrLabel}  ${klubbStr}`));
  push(separator());

  // ── Round table header ───────────────────────────────────────────────────────
  // Format: "Rnd Bane Mot#  Motstandar"
  // Columns: rnd(3) sp(1) bane(4) sp(1) mot#(4) sp(2) name(rest)
  const nameWidth = RECEIPT_COLS - 3 - 1 - 4 - 1 - 4 - 2;
  push(bold(true));
  push(
    textLine(
      `${field("Rnd", 3)} ${field("Bane", 4)} ${field("Mot#", 4)}  ${field("Motstandar", nameWidth)}`,
    ),
  );
  push(bold(false));

  // ── Round rows ──────────────────────────────────────────────────────────────
  data.roundInfos.forEach((info, i) => {
    const rnd = pad(i + 1, 3);
    const bane = pad(info.court ?? "", 4);
    const motNr = pad(info.opponentId ?? "", 4);
    const motNamn = field(info.opponentName ?? "", nameWidth);
    push(textLine(`${rnd} ${bane} ${motNr}  ${motNamn}`));
  });

  push(separator());
  push(align("center"));
  push(textLine(""));
  push(textLine("Lykke til!"));
  push(textLine(""));
  push(textLine(""));
  push(textLine(""));
  push(align("left"));
  push(cut());

  return concat(...parts);
}
