import { createEl } from "@/utils/createEl";

/**
 * One round of an X-kast/Kongelag match, drawn as a single row: the runde
 * number, a cell per omgang, then SUM and RINGER. Both the entry screens and
 * the between-players summary of XkastKongelagNumberpad draw the same row.
 */

export interface RoundRow {
  label: string;
  rundeKey: string;
  /** Cell headings, i.e. omgang numbers. */
  labels: string[];
  poeng: (number | null)[];
  ringer: (number | null)[];
}

function sumOf(values: (number | null)[]): number {
  return values.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

/** Key over value — the shape every cell in the row takes. */
function statEl(key: string, value: string, klasse: string): HTMLElement {
  const cell = createEl("div", null, klasse);
  cell.appendChild(createEl("span", key, "pad-summary-key"));
  cell.appendChild(createEl("span", value, "pad-summary-value"));
  return cell;
}

/** `currentIndex` marks the kast being entered; pass null in the summary. */
export function roundRowEl(row: RoundRow, currentIndex: number | null): HTMLElement {
  const el = createEl("div", null, "pad-summary-row");
  el.style.gridTemplateColumns = `28px repeat(${row.poeng.length}, minmax(0, 1fr)) auto auto`;
  el.appendChild(createEl("div", row.label, "pad-summary-runde"));
  row.poeng.forEach((poeng, i) => {
    const marks = `${poeng == null ? " empty" : ""}${i === currentIndex ? " current" : ""}`;
    const label = row.labels[i] ?? String(i + 1);
    el.appendChild(statEl(label, poeng != null ? String(poeng) : "–", `pad-summary-kast${marks}`));
  });
  el.appendChild(statEl("SUM", String(sumOf(row.poeng)), "pad-summary-stat pad-summary-sum"));
  el.appendChild(
    statEl("RINGER", String(sumOf(row.ringer)), "pad-summary-stat pad-summary-ringer"),
  );
  return el;
}
