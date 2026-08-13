// The consolidated SNC list. Placement and NC points come from
// complete_snc_hovudstevne; the total is recomputed with the same formula as the
// local standing (Kongelag + carried-over X-kast) so the order is readable.

import { throwerName, buildThrowerSlug } from "@/utils/kaster";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createEmptyState } from "@/components/EmptyState";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { renderBannerMenu, bindBannerMenu } from "@/components/BannerMenu";
import { promptDialog } from "@/components/PromptDialog";
import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import { xkastCarryOverFactor, xkastCarryOverPercent } from "@/utils/kongelagStilling";
import { getSncParentTournament, getSncLocalTournaments } from "@/services/stevneService";
import {
  getSncConsolidatedResults,
  drawSncPremiar,
  clearSncPremiar,
} from "@/services/resultatService";
import { confirmDialog } from "@/components/ConfirmDialog";
import type { SncResultRow } from "@/services/resultatService";
import type { SncLocalTournamentRow, SncParentTournamentRow } from "@/services/stevneService";
import { downloadExcelRows } from "@/utils/shared";
import {
  buildSncExportSheet,
  localsWithResults,
  sncExportFileName,
  sncInfoFacts,
  sncLocalFacts,
  sncTotal,
} from "@/utils/sncExcelExport";
import type { SncExportOptions } from "@/utils/sncExcelExport";

// The export sheet needs exactly the flags the table does, so the two share one
// shape: method labels, which blocks exist and how much carries over.
type ColFlags = SncExportOptions;

function totalFor(row: SncResultRow, cols: ColFlags): number {
  return sncTotal(row, cols);
}

function carryFor(row: SncResultRow, cols: ColFlags): number | null {
  return cols.carryFactor != null ? Math.round((row.poeng_xkast ?? 0) * cols.carryFactor) : null;
}

/**
 * The merged list leads with the SNC placement and trails with the local one; a
 * local stevne's own table is the same table with those two swapped.
 */
type TableVariant = "samla" | "lokal";

/** Drawn a prize — the marker sits beside the name in both layouts. */
function premieHtml(row: SncResultRow): string {
  return row.erpremie
    ? ' <span class="res-premie" title="Trekt premie" aria-label="Trekt premie">🎁</span>'
    : "";
}

function rowHtml(row: SncResultRow, cols: ColFlags, variant: TableVariant = "samla"): string {
  const kaster = row.kaster;
  const nameHtml =
    (kaster
      ? `<a href="#/kastere/${buildThrowerSlug(kaster)}" class="res-kaster-lenke">${escHtml(throwerName(kaster))}</a>`
      : "–") + premieHtml(row);
  const carry = carryFor(row, cols);
  const [lead, trail] =
    variant === "samla"
      ? [row.snc_plassering, row.plassering]
      : [row.plassering, row.snc_plassering];
  return `
    <tr>
      <td class="res-td-pl">${lead ?? "–"}.</td>
      <td class="res-td-navn">${nameHtml}</td>
      <td class="res-td-klubb">${escHtml(row.klubb?.navn ?? "–")}</td>
      ${
        cols.showXkast
          ? `<td class="res-tal">${row.poeng_xkast ?? "–"}</td>
             <td class="res-tal res-tal--dempa">${row.antall_ring_xkast ?? "–"}</td>
             ${carry != null ? `<td class="res-tal res-tal--dempa res-kol-slutt">${carry}</td>` : ""}`
          : ""
      }
      ${
        cols.showKongelag
          ? `<td class="res-tal">${row.poeng_kongelag ?? "–"}</td>
             <td class="res-tal res-tal--dempa res-kol-slutt">${row.antall_ring_kongelag ?? "–"}</td>`
          : ""
      }
      <td class="res-tal res-td-tot">${totalFor(row, cols)}</td>
      <td class="res-tal res-tal--dempa">${row.nc_poeng ?? "–"}</td>
      <td class="res-tal res-tal--dempa">${trail ?? "–"}</td>
    </tr>`;
}

/** Two header rows: the method groups on top, the repeated Poeng/Ringar below. */
function headHtml(cols: ColFlags, variant: TableVariant = "samla"): string {
  const xkastSpan = cols.carryFactor != null ? 3 : 2;
  return `
    <tr class="res-thead-grupper">
      <th colspan="3"></th>
      ${cols.showXkast ? `<th colspan="${xkastSpan}" class="res-gruppe res-kol-slutt">${escHtml(cols.innlLabel)}</th>` : ""}
      ${cols.showKongelag ? `<th colspan="2" class="res-gruppe res-kol-slutt">${escHtml(cols.avslLabel)}</th>` : ""}
      <th colspan="3"></th>
    </tr>
    <tr class="res-thead-columns">
      <th class="res-td-pl">PL</th>
      <th class="res-td-navn">NAMN</th>
      <th class="res-td-klubb">KLUBB</th>
      ${
        cols.showXkast
          ? `<th class="res-tal">POENG</th><th class="res-tal">RINGAR</th>
             ${
               cols.carryPercent != null
                 ? `<th class="res-tal res-kol-slutt" title="${cols.carryPercent} % av poenga frå ${escHtml(cols.innlLabel)}">OVERFØRT</th>`
                 : ""
             }`
          : ""
      }
      ${cols.showKongelag ? '<th class="res-tal">POENG</th><th class="res-tal res-kol-slutt">RINGAR</th>' : ""}
      <th class="res-tal res-td-tot">TOTAL</th>
      <th class="res-tal">NC</th>
      <th class="res-tal">${variant === "samla" ? "LOKAL PL" : "SNC PL"}</th>
    </tr>`;
}

function tableHtml(rows: SncResultRow[], cols: ColFlags, variant: TableVariant): string {
  return `
    <div class="res-tabell-boks">
      <table class="res-table res-table--snc">
        <thead>${headHtml(cols, variant)}</thead>
        <tbody>${rows.map((r) => rowHtml(r, cols, variant)).join("")}</tbody>
      </table>
    </div>`;
}

/**
 * Screen-hidden, print-only: the page's own title and the stevneinfo, so a
 * printed sheet or a PDF stands on its own without the app chrome around it.
 */
function printFactsHtml(facts: [label: string, value: string | number | null][]): string {
  const pairs = facts
    .map(
      ([label, value]) => `
        <div class="res-print-fakta__par">
          <dt>${escHtml(label)}</dt>
          <dd>${escHtml(String(value ?? "—") || "—")}</dd>
        </div>`,
    )
    .join("");
  return `<dl class="res-print-fakta">${pairs}</dl>`;
}

function printHeaderHtml(
  parent: SncParentTournamentRow,
  cols: ColFlags,
  localCount: number,
  deltakarar: number,
): string {
  return `
    <div class="res-print-blokk">
      <h1 class="res-print-tittel">${escHtml(parent.navn)}</h1>
      ${printFactsHtml(sncInfoFacts(parent, cols, localCount, deltakarar))}
    </div>`;
}

/**
 * Print-only: every local stevne's own result after the merged list, each on a
 * fresh page. Tid and stad live here — the umbrella above has neither.
 */
function printLocalsHtml(
  locals: SncLocalTournamentRow[],
  rows: SncResultRow[],
  cols: ColFlags,
): string {
  return localsWithResults(locals, rows)
    .map(
      ({ local, rows: localRows }) => `
        <div class="res-print-blokk res-print-lokal">
          <h2 class="res-print-undertittel">${escHtml(local.navn)}</h2>
          ${printFactsHtml(sncLocalFacts(local, localRows.length))}
          ${tableHtml(localRows, cols, "lokal")}
        </div>`,
    )
    .join("");
}

/** "Halvmatch / Kongelag – 67 deltakarar" — the methods thrown and how many threw. */
function sectionTitle(cols: ColFlags, deltakarar: number): string {
  const methods = [cols.showXkast ? cols.innlLabel : "", cols.showKongelag ? cols.avslLabel : ""]
    .filter(Boolean)
    .join(" / ");
  return `${methods ? `${methods} – ` : ""}${deltakarar} deltakarar`;
}

function statBoxHtml(label: string, value: string, extra: string, sub: string): string {
  return `
    <div class="res-stat">
      <span class="res-stat-label">${escHtml(label)}</span>
      <span class="res-stat-verdi">${escHtml(value)}${extra ? ` <span class="res-stat-carry">${escHtml(extra)}</span>` : ""}</span>
      ${sub ? `<span class="res-stat-sub">${escHtml(sub)}</span>` : ""}
    </div>`;
}

function detailHtml(row: SncResultRow, cols: ColFlags): string {
  const boxes: string[] = [];
  if (cols.showXkast) {
    const carried = carryFor(row, cols);
    const carry = carried != null ? `(${carried})` : "";
    const label =
      cols.carryPercent != null ? `${cols.innlLabel} (${cols.carryPercent} %)` : cols.innlLabel;
    boxes.push(
      statBoxHtml(
        label,
        String(row.poeng_xkast ?? "–"),
        carry,
        row.antall_ring_xkast != null ? `${row.antall_ring_xkast} ringer` : "",
      ),
    );
  }
  if (cols.showKongelag) {
    boxes.push(
      statBoxHtml(
        cols.avslLabel,
        String(row.poeng_kongelag ?? "–"),
        "",
        row.antall_ring_kongelag != null ? `${row.antall_ring_kongelag} ringer` : "",
      ),
    );
  }
  boxes.push(statBoxHtml("NC", String(row.nc_poeng ?? "–"), "", ""));
  return boxes.join("");
}

function mobileRowHtml(
  row: SncResultRow,
  cols: ColFlags,
  idx: number,
  variant: TableVariant = "samla",
): string {
  const panelId = `res-detalj-${idx}`;
  const lead = variant === "samla" ? row.snc_plassering : row.plassering;
  return `
    <div class="res-row res-row--snc">
      <span class="res-pl">${lead ?? "–"}.</span>
      <div class="res-info">
        <span class="res-navn">${escHtml(throwerName(row.kaster) || "–")}${premieHtml(row)}</span>
        <span class="res-klubb">${escHtml(row.klubb?.navn ?? "–")}</span>
        <button type="button" class="res-detalj-btn" aria-expanded="false" aria-controls="${panelId}">
          <span class="res-detalj-tekst">Vis detaljar</span><span class="res-detalj-pil" aria-hidden="true">▾</span>
        </button>
      </div>
      <div class="res-tot">
        <span class="res-tot-label">TOT</span>
        <span class="res-tot-verdi">${totalFor(row, cols)}</span>
      </div>
      <div class="res-detalj" id="${panelId}" hidden>${detailHtml(row, cols)}</div>
    </div>`;
}

/** The mobile cards and the desktop table for one set of rows. */
function listHtml(rows: SncResultRow[], cols: ColFlags, variant: TableVariant): string {
  return `
    <div class="res-mobil-blokk">
      <div class="res-group">
        <div class="res-group-rows">
          ${rows.map((r, i) => mobileRowHtml(r, cols, i, variant)).join("")}
        </div>
      </div>
    </div>
    <div class="res-desktop-blokk">${tableHtml(rows, cols, variant)}</div>`;
}

/** "Alle lokale stevne" plus the ones that actually have results. */
function filterHtml(locals: SncLocalTournamentRow[], rows: SncResultRow[]): string {
  const options = localsWithResults(locals, rows)
    .map(({ local }) => `<option value="${local.id}">${escHtml(local.navn)}</option>`)
    .join("");
  if (!options) return "";
  return `
    <label class="res-filter">
      <span class="res-filter__etikett">Lokalt stevne</span>
      <select id="snc-lokal-filter" class="form-select form-select-sm res-filter__vel">
        <option value="">Alle lokale stevne</option>
        ${options}
      </select>
    </label>`;
}

/**
 * Picking a local stevne swaps the merged list for that stevne's own — the same
 * table the printed per-stevne pages carry, led by the local placement.
 */
function bindLocalFilter(
  container: HTMLElement,
  locals: SncLocalTournamentRow[],
  rows: SncResultRow[],
  cols: ColFlags,
): void {
  const select = container.querySelector<HTMLSelectElement>("#snc-lokal-filter");
  const listSlot = container.querySelector<HTMLElement>("#snc-liste");
  const titleSlot = container.querySelector<HTMLElement>("#snc-liste-tittel");
  if (!select || !listSlot || !titleSlot) return;

  select.addEventListener("change", () => {
    const id = Number(select.value);
    const entry = localsWithResults(locals, rows).find(({ local }) => local.id === id);
    if (!entry) {
      titleSlot.textContent = sectionTitle(cols, rows.length);
      listSlot.innerHTML = listHtml(rows, cols, "samla");
      return;
    }
    titleSlot.textContent = `${entry.local.navn} – ${entry.rows.length} deltakarar`;
    listSlot.innerHTML = listHtml(entry.rows, cols, "lokal");
  });
}

/** One delegated listener toggles whichever detail panel was asked for. */
function bindDetailToggles(container: HTMLElement): void {
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

/**
 * Admins draw prizes for a share of the round: the admin gives a percentage and
 * the RPC picks that many at random, never the top three. A round is drawn once —
 * to draw again it has to be reset first, so nobody can pull until they like the
 * outcome.
 */
function bindPrizeDraw(
  bannerSlot: HTMLElement,
  parent: SncParentTournamentRow,
  rows: SncResultRow[],
  rerender: () => Promise<void>,
): void {
  const reset = bannerSlot.querySelector<HTMLButtonElement>("#snc-premie-nullstill-btn");
  reset?.addEventListener("click", async () => {
    if (
      !(await confirmDialog({
        title: "Nullstill premietrekning",
        message: "Alle trekte premiar i denne runden blir fjerna, og runden kan trekkjast på nytt.",
        danger: true,
      }))
    )
      return;
    reset.disabled = true;
    const { antal, error } = await clearSncPremiar(parent.id);
    reset.disabled = false;
    if (error) {
      showToast("Kunne ikkje nullstille: " + errorMessage(error), "error");
      return;
    }
    showToast(antal ? `${antal} premiar nullstilte.` : "Ingen premiar å nullstille.", "success");
    if (antal) await rerender();
  });

  const button = bannerSlot.querySelector<HTMLButtonElement>("#snc-premie-btn");
  button?.addEventListener("click", async () => {
    const answer = await promptDialog({
      title: "Trekk premiar",
      message: `Kor mange prosent av dei ${rows.length} deltakarane skal trekkjast? Talet blir runda opp. Dei tre fremste blir ikkje trekte, og runden kan berre trekkjast éin gong.`,
      defaultValue: "10",
      inputType: "number",
    });
    if (answer == null) return;

    const prosent = Number(answer.replace(",", "."));
    if (!Number.isFinite(prosent) || prosent <= 0 || prosent > 100) {
      showToast("Oppgi ein prosent mellom 0 og 100.", "error");
      return;
    }

    button.disabled = true;
    const { antal, error } = await drawSncPremiar(parent.id, prosent);
    button.disabled = false;
    if (error) {
      showToast("Kunne ikkje trekkje premiar: " + errorMessage(error), "error");
      return;
    }
    showToast(
      antal ? `${antal} premiar trekt.` : "Ingen nye premiar å trekkje.",
      antal ? "success" : "info",
    );
    if (antal) await rerender();
  });
}

/**
 * Print and Excel live in the banner's overflow menu. xlsx is imported on click,
 * so the package itself still costs nothing until someone exports.
 */
function bindBannerActions(
  bannerSlot: HTMLElement | null | undefined,
  parent: SncParentTournamentRow,
  locals: SncLocalTournamentRow[],
  rows: SncResultRow[],
  cols: ColFlags,
  isAdmin: boolean,
  rerender: () => Promise<void>,
): void {
  if (!bannerSlot) return;
  bannerSlot.innerHTML = renderBannerMenu([
    { id: "snc-print-btn", label: "Skriv ut / lagre som PDF" },
    { id: "snc-excel-btn", label: "Last ned som Excel" },
    ...(isAdmin
      ? [
          { id: "snc-premie-btn", label: "Trekk premiar" },
          ...(rows.some((r) => r.erpremie)
            ? [
                {
                  id: "snc-premie-nullstill-btn",
                  label: "Nullstill premietrekning",
                  tone: "warning" as const,
                },
              ]
            : []),
        ]
      : []),
  ]);
  bindBannerMenu(bannerSlot);

  bannerSlot.querySelector("#snc-print-btn")?.addEventListener("click", () => window.print());
  bindPrizeDraw(bannerSlot, parent, rows, rerender);

  const button = bannerSlot.querySelector<HTMLButtonElement>("#snc-excel-btn");
  button?.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const sheet = buildSncExportSheet(parent, locals, rows, cols);
      await downloadExcelRows(
        sheet.rows,
        sncExportFileName(parent.navn),
        "Samla resultat",
        sheet.merges,
      );
    } catch (err) {
      logError("snc-resultat.excel", err);
      showToast("Kunne ikkje lage Excel-fila.", "error");
    } finally {
      button.disabled = false;
    }
  });
}

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  bannerSlot?: HTMLElement | null,
): Promise<void> {
  const rerender = (): Promise<void> => render(container, { id, isAdmin }, bannerSlot);
  container.replaceChildren(createLoadingState("Laster samla resultat…"));

  try {
    // The locals ride along: their tid and stad are what the printed per-stevne
    // pages carry, and the Excel export then needs no fetch of its own.
    const [parentResult, resultsResult, localsResult] = await Promise.all([
      getSncParentTournament(id),
      getSncConsolidatedResults(id),
      getSncLocalTournaments(id),
    ]);

    if (parentResult.error || !parentResult.data) {
      container.replaceChildren(createErrorBanner("Fann ikkje SNC-hovudstevnet."));
      return;
    }
    if (resultsResult.error) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste samla resultat."));
      return;
    }

    const parent = parentResult.data;
    const rows = resultsResult.data.filter((r) => r.snc_plassering != null);

    if (!parent.erfullfort || !rows.length) {
      container.replaceChildren(
        createEmptyState(
          "Den samla lista blir klar når alle dei lokale stevna er fullførte og runden er konsolidert.",
        ),
      );
      return;
    }

    const omganger = parent.kastemetodeInnl?.antall_omganger ?? null;
    const showXkast = parent.innledendekastemetodeid != null;
    const showKongelag = parent.avsluttendekastemetodeid != null;
    const carryOmganger = showXkast && showKongelag ? omganger : null;
    const cols: ColFlags = {
      showXkast,
      showKongelag,
      carryFactor: carryOmganger != null ? xkastCarryOverFactor(carryOmganger) : null,
      innlLabel: parent.kastemetodeInnl?.navn ?? "X-kast",
      avslLabel: parent.kastemetodeAvsl?.navn ?? "Kongelag",
      carryPercent: carryOmganger != null ? xkastCarryOverPercent(carryOmganger) : null,
    };

    const locals = localsResult.data;
    const localCount = locals.length || new Set(rows.map((r) => r.stevne.id)).size;

    container.innerHTML = `
      <div class="res-side">
        ${printHeaderHtml(parent, cols, localCount, rows.length)}
        <section class="res-seksjon">
          <div class="res-seksjon-topp">
            <h6 class="res-seksjon-tittel" id="snc-liste-tittel">${escHtml(sectionTitle(cols, rows.length))}</h6>
            ${filterHtml(locals, rows)}
          </div>
          <div id="snc-liste">${listHtml(rows, cols, "samla")}</div>
        </section>
        ${printLocalsHtml(locals, rows, cols)}
      </div>`;

    bindDetailToggles(container);
    bindLocalFilter(container, locals, rows, cols);
    bindBannerActions(bannerSlot, parent, locals, rows, cols, isAdmin, rerender);
  } catch (err) {
    logError("snc-resultat.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste samla resultat."));
  }
}
