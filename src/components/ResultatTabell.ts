// One result table for every stevne — the consolidated SNC list and an ordinary
// stevne's own result render the same columns. Which columns appear follows from
// the kastemetodar thrown: X-kast innledende gets Poeng/Ringar plus the share it
// carries into the total, Gloppen/NHM get KP/SP, Kongelag gets Poeng/Ringar. The
// column specs below drive the header rows, the body cells and the mobile cards
// from one list, so the three cannot drift apart.

import { escHtml } from "@/utils/escHtml";

export interface ResultatKolonnar {
  /** X-kast innledende: Poeng + Ringar, scored per court. */
  visInnlPoeng: boolean;
  /** Kamp-based innledende (Gloppen/NHM): kamp- and scorepoeng. */
  visKpSp: boolean;
  /** Kongelag avsluttande: Poeng + Ringar. */
  visAvslPoeng: boolean;
  /** Kongelag plus what innledende carried over — only with both phases. */
  visTotal: boolean;
  visNc: boolean;
  visPremie: boolean;
  /** Local stevne in a consolidated SNC round: the merged placement too. */
  visSncPl: boolean;
  innlLabel: string;
  avslLabel: string;
  /** X-kast poeng → total factor, null when nothing is carried over. */
  carryFactor: number | null;
  /** The same factor as a percentage, which heads the carried column. */
  carryPercent: number | null;
}

/** One line of a result list, whichever page loaded it. */
export interface ResultatRad {
  pl: number | null;
  /** Plain name(s), for the mobile card. */
  namn: string;
  /** Linked name(s) for the table; falls back to the plain one. */
  namnHtml?: string;
  klubb: string;
  poengInnl: number | null;
  ringInnl: number | null;
  kampPoeng: number | null;
  scorePoeng: number | null;
  poengAvsl: number | null;
  ringAvsl: number | null;
  ncPoeng: number | null;
  sncPl: number | null;
  erpremie: boolean;
}

/** One klasse or gruppe of a result list — or the whole list, when it has no groups. */
export interface ResultatSeksjon {
  /** Group name, shown above the mobile cards and above the section's columns. */
  tittel?: string | null;
  rows: ResultatRad[];
}

const EMPTY_KOLONNAR: ResultatKolonnar = {
  visInnlPoeng: false,
  visKpSp: false,
  visAvslPoeng: false,
  visTotal: false,
  visNc: false,
  visPremie: true,
  visSncPl: false,
  innlLabel: "",
  avslLabel: "",
  carryFactor: null,
  carryPercent: null,
};

/** Every flag off but the always-on columns — spread it and set what applies. */
export function resultatKolonnar(over: Partial<ResultatKolonnar> = {}): ResultatKolonnar {
  return { ...EMPTY_KOLONNAR, ...over };
}

function tekst(verdi: number | null | undefined): string {
  return verdi == null ? "–" : String(verdi);
}

/** "20 %" / "33,33 %" — the carried share, and the header of the column it fills. */
export function carryLabel(prosent: number): string {
  return `${String(prosent).replace(".", ",")} %`;
}

/**
 * What innledende hands the total: a normalized share of the X-kast poeng, or the
 * kamppoeng as thrown (Gloppen/NHM carry theirs unrounded). Null when innledende
 * carries nothing.
 */
export function carryVerdi(row: ResultatRad, cols: ResultatKolonnar): number | null {
  if (cols.carryFactor != null) return Math.round((row.poengInnl ?? 0) * cols.carryFactor);
  if (cols.visKpSp && cols.visAvslPoeng) return row.kampPoeng ?? 0;
  return null;
}

export function radTotal(row: ResultatRad, cols: ResultatKolonnar): number {
  return (row.poengAvsl ?? 0) + (carryVerdi(row, cols) ?? 0);
}

/**
 * Drawn a prize. The table has a column of its own to head the mark, so an X
 * carries it there; the mobile card has no header and spells it out instead.
 */
export function premieHtml(row: ResultatRad, merke: "X" | "PREMIE"): string {
  return row.erpremie ? `<span class="res-premie" title="Trekt premie">${merke}</span>` : "";
}

// ── Column specs ──────────────────────────────────────────────────────────────

interface Kol {
  label: string;
  klasse: string;
  title?: string;
  /** Cell contents as HTML — anything from the row is escaped here. */
  verdi: (row: ResultatRad) => string;
}

/** A block of columns under one method name, or the unlabelled blocks at either end. */
interface Gruppe {
  label: string | null;
  kolonnar: Kol[];
}

function byggGrupper(cols: ResultatKolonnar): Gruppe[] {
  const spec: Gruppe[] = [
    {
      label: null,
      kolonnar: [
        { label: "PL", klasse: "res-td-pl", verdi: (r) => `${r.pl ?? "–"}.` },
        { label: "NAMN", klasse: "res-td-navn", verdi: (r) => r.namnHtml ?? escHtml(r.namn) },
        { label: "KLUBB", klasse: "res-td-klubb", verdi: (r) => escHtml(r.klubb) },
      ],
    },
  ];

  if (cols.visInnlPoeng) {
    const kolonnar: Kol[] = [
      { label: "POENG", klasse: "res-tal", verdi: (r) => tekst(r.poengInnl) },
      { label: "RINGAR", klasse: "res-tal res-tal--dempa", verdi: (r) => tekst(r.ringInnl) },
    ];
    if (cols.carryPercent != null) {
      const andel = carryLabel(cols.carryPercent);
      kolonnar.push({
        label: andel,
        klasse: "res-tal res-tal--dempa",
        title: `Overført til totalen: ${andel} av poenga frå ${cols.innlLabel}`,
        verdi: (r) => tekst(carryVerdi(r, cols)),
      });
    }
    spec.push({ label: cols.innlLabel, kolonnar });
  }

  if (cols.visKpSp) {
    spec.push({
      label: cols.innlLabel,
      kolonnar: [
        {
          label: "KP",
          klasse: "res-tal",
          title: "Kamppoeng",
          verdi: (r) => tekst(r.kampPoeng),
        },
        {
          label: "SP",
          klasse: "res-tal res-tal--dempa",
          title: "Scorepoeng",
          verdi: (r) => tekst(r.scorePoeng),
        },
      ],
    });
  }

  if (cols.visAvslPoeng) {
    spec.push({
      label: cols.avslLabel,
      kolonnar: [
        { label: "POENG", klasse: "res-tal", verdi: (r) => tekst(r.poengAvsl) },
        { label: "RINGAR", klasse: "res-tal res-tal--dempa", verdi: (r) => tekst(r.ringAvsl) },
      ],
    });
  }

  const slutt: Kol[] = [];
  if (cols.visTotal) {
    slutt.push({
      label: "TOTAL",
      klasse: "res-tal res-td-tot",
      verdi: (r) => String(radTotal(r, cols)),
    });
  }
  if (cols.visNc) {
    slutt.push({
      label: "NC",
      klasse: "res-tal res-tal--dempa",
      title: "Noregscup-poeng",
      verdi: (r) => tekst(r.ncPoeng),
    });
  }
  if (cols.visSncPl) {
    slutt.push({
      label: "SNC PL",
      klasse: "res-tal res-tal--dempa",
      title: "Plassering i den samla SNC-lista",
      verdi: (r) => tekst(r.sncPl),
    });
  }
  if (cols.visPremie) {
    slutt.push({
      label: "PREMIE",
      klasse: "res-tal res-td-premie",
      verdi: (r) => premieHtml(r, "X"),
    });
  }
  if (slutt.length) spec.push({ label: null, kolonnar: slutt });

  return spec;
}

/** The vertical rule closing a method block belongs on its last column. */
function klasseFor(gruppe: Gruppe, index: number, kol: Kol): string {
  const slutt = gruppe.label != null && index === gruppe.kolonnar.length - 1;
  return slutt ? `${kol.klasse} res-kol-slutt` : kol.klasse;
}

function attr(title: string | undefined): string {
  return title ? ` title="${escHtml(title)}"` : "";
}

function headHtml(spec: Gruppe[], tittel: string | null | undefined): string {
  const antalKolonnar = spec.reduce((n, g) => n + g.kolonnar.length, 0);
  const tittelRad = tittel
    ? `<tr class="res-thead-group"><td colspan="${antalKolonnar}" class="res-td-group-header">${escHtml(tittel)}</td></tr>`
    : "";

  // The group row is worth its height only when some block is actually named.
  const gruppeRad = spec.some((g) => g.label)
    ? `<tr class="res-thead-grupper">${spec
        .map((g) =>
          g.label
            ? `<th colspan="${g.kolonnar.length}" class="res-gruppe res-kol-slutt">${escHtml(g.label)}</th>`
            : `<th colspan="${g.kolonnar.length}"></th>`,
        )
        .join("")}</tr>`
    : "";

  const labelRad = spec
    .flatMap((g) =>
      g.kolonnar.map(
        (k, i) => `<th class="${klasseFor(g, i, k)}"${attr(k.title)}>${escHtml(k.label)}</th>`,
      ),
    )
    .join("");

  return `${tittelRad}${gruppeRad}<tr class="res-thead-columns">${labelRad}</tr>`;
}

function radHtml(row: ResultatRad, spec: Gruppe[]): string {
  const cells = spec
    .flatMap((g) =>
      g.kolonnar.map((k, i) => `<td class="${klasseFor(g, i, k)}">${k.verdi(row)}</td>`),
    )
    .join("");
  return `<tr>${cells}</tr>`;
}

/**
 * Every section in one table, never one table each: column widths are settled per
 * table, so separate tables per klasse or gruppe would leave the columns ragged
 * from block to block. A single section keeps its header rows in `thead`, which
 * print then repeats on every page; sections that carry a name of their own get a
 * header block per section instead, so the name sits above the columns it heads.
 */
export function resultatTabellHtml(seksjonar: ResultatSeksjon[], cols: ResultatKolonnar): string {
  const spec = byggGrupper(cols);
  const body =
    seksjonar.length === 1 && !seksjonar[0]!.tittel
      ? `<thead>${headHtml(spec, null)}</thead>
         <tbody>${seksjonar[0]!.rows.map((r) => radHtml(r, spec)).join("")}</tbody>`
      : seksjonar
          .map(
            (s) => `
              <tbody class="res-tbody-hovud">${headHtml(spec, s.tittel)}</tbody>
              <tbody>${s.rows.map((r) => radHtml(r, spec)).join("")}</tbody>`,
          )
          .join("");
  return `
    <div class="res-tabell-boks">
      <table class="res-table res-table--gruppert">${body}</table>
    </div>`;
}

// ── Mobile cards ──────────────────────────────────────────────────────────────

function statBoxHtml(label: string, verdi: string, ekstra: string, under: string): string {
  return `
    <div class="res-stat">
      <span class="res-stat-label">${escHtml(label)}</span>
      <span class="res-stat-verdi">${escHtml(verdi)}${ekstra ? ` <span class="res-stat-carry">${escHtml(ekstra)}</span>` : ""}</span>
      ${under ? `<span class="res-stat-sub">${escHtml(under)}</span>` : ""}
    </div>`;
}

function detailHtml(row: ResultatRad, cols: ResultatKolonnar): string {
  const boxes: string[] = [];
  if (cols.visInnlPoeng) {
    const carried = carryVerdi(row, cols);
    const label =
      cols.carryPercent != null
        ? `${cols.innlLabel} (${carryLabel(cols.carryPercent)})`
        : cols.innlLabel;
    boxes.push(
      statBoxHtml(
        label,
        tekst(row.poengInnl),
        carried != null ? `(${carried})` : "",
        row.ringInnl != null ? `${row.ringInnl} ringer` : "",
      ),
    );
  }
  if (cols.visKpSp) {
    boxes.push(
      statBoxHtml(
        `${cols.innlLabel} (KP)`,
        tekst(row.kampPoeng),
        "",
        row.scorePoeng != null ? `SP ${row.scorePoeng}` : "",
      ),
    );
  }
  if (cols.visAvslPoeng) {
    boxes.push(
      statBoxHtml(
        cols.avslLabel,
        tekst(row.poengAvsl),
        "",
        row.ringAvsl != null ? `${row.ringAvsl} ringer` : "",
      ),
    );
  }
  if (cols.visNc) boxes.push(statBoxHtml("NC", tekst(row.ncPoeng), "", ""));
  if (cols.visSncPl) boxes.push(statBoxHtml("SNC", `${tekst(row.sncPl)}.`, "", ""));
  return boxes.join("");
}

/**
 * The one figure the card leads with: the total where there is one, otherwise the
 * best stand-in the columns offer.
 */
function hovudTal(
  row: ResultatRad,
  cols: ResultatKolonnar,
): { label: string; verdi: string } | null {
  if (cols.visTotal) return { label: "TOT", verdi: String(radTotal(row, cols)) };
  if (cols.visAvslPoeng) return { label: "POENG", verdi: tekst(row.poengAvsl) };
  if (cols.visInnlPoeng) return { label: "POENG", verdi: tekst(row.poengInnl) };
  if (cols.visKpSp) return { label: "KP", verdi: tekst(row.kampPoeng) };
  return null;
}

function mobilRadHtml(row: ResultatRad, cols: ResultatKolonnar, panelId: string): string {
  const detaljar = detailHtml(row, cols);
  const hovud = hovudTal(row, cols);
  const premie = cols.visPremie ? premieHtml(row, "PREMIE") : "";
  return `
    <div class="res-row res-row--detalj">
      <span class="res-pl">${row.pl ?? "–"}.</span>
      <div class="res-info">
        <span class="res-navn">${escHtml(row.namn)}</span>
        <span class="res-klubb">${escHtml(row.klubb)}</span>
        ${
          detaljar
            ? `<button type="button" class="res-detalj-btn" aria-expanded="false" aria-controls="${panelId}">
                 <span class="res-detalj-tekst">Vis detaljar</span><span class="res-detalj-pil" aria-hidden="true">▾</span>
               </button>`
            : ""
        }
      </div>
      ${
        hovud || premie
          ? `<div class="res-tot">
               ${hovud ? `<span class="res-tot-label">${hovud.label}</span><span class="res-tot-verdi">${escHtml(hovud.verdi)}</span>` : ""}
               ${premie}
             </div>`
          : ""
      }
      ${detaljar ? `<div class="res-detalj" id="${panelId}" hidden>${detaljar}</div>` : ""}
    </div>`;
}

/**
 * The whole list: one card group per section on mobile, and the one shared table
 * on desktop.
 */
export function resultatListeHtml(seksjonar: ResultatSeksjon[], cols: ResultatKolonnar): string {
  const kort = seksjonar
    .map(
      (s, si) => `
      <div class="res-group">
        ${s.tittel ? `<h2 class="res-group-title">${escHtml(s.tittel)}</h2>` : ""}
        <div class="res-group-rows">
          ${s.rows.map((r, i) => mobilRadHtml(r, cols, `res-detalj-${si}-${i}`)).join("")}
        </div>
      </div>`,
    )
    .join("");
  return `
    <div class="res-mobil-blokk">${kort}</div>
    <div class="res-desktop-blokk">${resultatTabellHtml(seksjonar, cols)}</div>`;
}

/** One delegated listener toggles whichever detail panel was asked for. */
export function bindResultatDetaljar(container: HTMLElement): void {
  container.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>(".res-detalj-btn");
    if (!btn) return;
    const row = btn.closest(".res-row");
    const panel = row?.querySelector<HTMLElement>(".res-detalj");
    if (!panel) return;
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    const text = btn.querySelector(".res-detalj-tekst");
    const arrow = btn.querySelector(".res-detalj-pil");
    if (text) text.textContent = open ? "Skjul detaljar" : "Vis detaljar";
    if (arrow) arrow.textContent = open ? "▴" : "▾";
  });
}
