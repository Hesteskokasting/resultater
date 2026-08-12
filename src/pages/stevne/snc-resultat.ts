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
import { showToast } from "@/components/Toast";
import { xkastCarryOverFactor, xkastCarryOverPercent } from "@/utils/kongelagStilling";
import { getSncParentTournament, getSncLocalTournaments } from "@/services/stevneService";
import { getSncConsolidatedResults } from "@/services/resultatService";
import type { SncResultRow } from "@/services/resultatService";
import type { SncParentTournamentRow } from "@/services/stevneService";
import { downloadExcelRows } from "@/utils/shared";
import { buildSncExportSheet, sncExportFileName, sncTotal } from "@/utils/sncExcelExport";
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

function rowHtml(row: SncResultRow, cols: ColFlags): string {
  const kaster = row.kaster;
  const nameHtml = kaster
    ? `<a href="#/kastere/${buildThrowerSlug(kaster)}" class="res-kaster-lenke">${escHtml(throwerName(kaster))}</a>`
    : "–";
  const carry = carryFor(row, cols);
  return `
    <tr>
      <td class="res-td-pl">${row.snc_plassering ?? "–"}.</td>
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
      <td class="res-tal res-tal--dempa">${row.plassering ?? "–"}</td>
    </tr>`;
}

/** Two header rows: the method groups on top, the repeated Poeng/Ringar below. */
function headHtml(cols: ColFlags): string {
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
      <th class="res-tal">LOKAL PL</th>
    </tr>`;
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

function mobileRowHtml(row: SncResultRow, cols: ColFlags, idx: number): string {
  const panelId = `res-detalj-${idx}`;
  return `
    <div class="res-row res-row--snc">
      <span class="res-pl">${row.snc_plassering ?? "–"}.</span>
      <div class="res-info">
        <span class="res-navn">${escHtml(throwerName(row.kaster) || "–")}</span>
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
 * Excel lives in the banner's overflow menu. Both the local stevne facts and the
 * xlsx package are fetched on click, so neither costs anything on page load.
 */
function bindExcelExport(
  bannerSlot: HTMLElement | null | undefined,
  parent: SncParentTournamentRow,
  rows: SncResultRow[],
  cols: ColFlags,
): void {
  if (!bannerSlot) return;
  bannerSlot.innerHTML = renderBannerMenu([{ id: "snc-excel-btn", label: "Last ned som Excel" }]);
  bindBannerMenu(bannerSlot);

  const button = bannerSlot.querySelector<HTMLButtonElement>("#snc-excel-btn");
  button?.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const { data: locals } = await getSncLocalTournaments(parent.id);
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
  { id }: { id: number; isAdmin?: boolean },
  bannerSlot?: HTMLElement | null,
): Promise<void> {
  container.replaceChildren(createLoadingState("Laster samla resultat…"));

  try {
    const [parentResult, resultsResult] = await Promise.all([
      getSncParentTournament(id),
      getSncConsolidatedResults(id),
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

    container.innerHTML = `
      <div class="res-side">
        <section class="res-seksjon">
          <h6 class="res-seksjon-tittel">${escHtml(sectionTitle(cols, rows.length))}</h6>
          <div class="res-mobil-blokk">
            <div class="res-group">
              <div class="res-group-rows">${rows.map((r, i) => mobileRowHtml(r, cols, i)).join("")}</div>
            </div>
          </div>
          <div class="res-desktop-blokk">
            <div class="res-tabell-boks">
              <table class="res-table res-table--snc">
                <thead>${headHtml(cols)}</thead>
                <tbody>${rows.map((r) => rowHtml(r, cols)).join("")}</tbody>
              </table>
            </div>
          </div>
        </section>
      </div>`;

    bindDetailToggles(container);
    bindExcelExport(bannerSlot, parent, rows, cols);
  } catch (err) {
    logError("snc-resultat.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste samla resultat."));
  }
}
