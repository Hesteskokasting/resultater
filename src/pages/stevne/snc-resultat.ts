// The consolidated SNC list. Placement and NC points come from
// complete_snc_hovudstevne; the total is recomputed with the same formula as the
// local standing (Kongelag + carried-over X-kast) so the order is readable.

import { throwerName, buildThrowerSlug } from "@/utils/kaster";
import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { renderStevneBannerMenu, bindStevneBannerMenu } from "@/components/stevne/StevneBannerMenu";
import { premieDialog } from "@/components/dialog/PremieDialog";
import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import {
  xkastCarryOverFactor,
  xkastCarryOverPercent,
} from "@/utils/xkastKongelag/kongelagStilling";
import { getSncParentTournament, getSncLocalTournaments } from "@/services/stevneService";
import {
  getSncConsolidatedResults,
  drawSncPremiar,
  clearSncPremiar,
} from "@/services/resultatService";
import { confirmDialog } from "@/components/dialog/ConfirmDialog";
import {
  bindResultatDetaljar,
  resultatKolonnar,
  resultatListeHtml,
  resultatTabellHtml,
} from "@/components/resultat/ResultatTabell";
import type { ResultatKolonnar, ResultatRad } from "@/components/resultat/ResultatTabell";
import { printHeaderHtml, printSeksjonHtml } from "@/components/resultat/ResultatPrint";
import type { SncResultRow } from "@/services/resultatService";
import type { SncLocalTournamentRow, SncParentTournamentRow } from "@/services/stevneService";
import { downloadExcelRows } from "@/utils/shared";
import {
  buildSncExportSheet,
  localsWithResults,
  sncExportFileName,
  sncInfoFacts,
  sncLocalFacts,
} from "@/utils/sncExcelExport";
import type { SncExportOptions } from "@/utils/sncExcelExport";

// The export sheet needs exactly the flags the table does, so the two share one
// shape: method labels, which blocks exist and how much carries over.
type ColFlags = SncExportOptions;

/**
 * The merged list leads with the SNC placement and trails with the prize mark; a
 * local stevne's own table leads with the local placement and keeps the merged
 * one in that last column instead.
 */
type TableVariant = "samla" | "lokal";

/** The export sheet's flags as the shared table's columns — one source, two uses. */
function tabellKolonnar(cols: ColFlags, variant: TableVariant): ResultatKolonnar {
  return resultatKolonnar({
    visInnlPoeng: cols.showXkast,
    visAvslPoeng: cols.showKongelag,
    visTotal: cols.showKongelag && cols.showXkast,
    visNc: true,
    visPremie: variant === "samla",
    visSncPl: variant === "lokal",
    innlLabel: cols.innlLabel,
    avslLabel: cols.avslLabel,
    carryFactor: cols.carryFactor,
    carryPercent: cols.carryPercent,
  });
}

function radFor(row: SncResultRow, variant: TableVariant): ResultatRad {
  const kaster = row.kaster;
  return {
    pl: variant === "samla" ? row.snc_plassering : row.plassering,
    namn: throwerName(kaster) || "–",
    namnHtml: kaster
      ? `<a href="#/kastere/${buildThrowerSlug(kaster)}" class="res-kaster-lenke">${escHtml(throwerName(kaster))}</a>`
      : "–",
    klubb: row.klubb?.navn ?? "–",
    poengInnl: row.poeng_xkast,
    ringInnl: row.antall_ring_xkast,
    kampPoeng: null,
    scorePoeng: null,
    poengAvsl: row.poeng_kongelag,
    ringAvsl: row.antall_ring_kongelag,
    ncPoeng: row.nc_poeng,
    sncPl: row.snc_plassering,
    erpremie: row.erpremie ?? false,
  };
}

function tableHtml(rows: SncResultRow[], cols: ColFlags, variant: TableVariant): string {
  return resultatTabellHtml(
    [{ rows: rows.map((r) => radFor(r, variant)) }],
    tabellKolonnar(cols, variant),
  );
}

/**
 * Print-only: every local stevne's own result below the merged list. Tid and stad
 * live here — the umbrella above has neither.
 */
function printLocalsHtml(
  locals: SncLocalTournamentRow[],
  rows: SncResultRow[],
  cols: ColFlags,
): string {
  return localsWithResults(locals, rows)
    .map(({ local, rows: localRows }) =>
      printSeksjonHtml(
        local.navn,
        sncLocalFacts(local, localRows.length),
        tableHtml(localRows, cols, "lokal"),
      ),
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

/** The mobile cards and the desktop table for one set of rows. */
function listHtml(rows: SncResultRow[], cols: ColFlags, variant: TableVariant): string {
  return resultatListeHtml(
    [{ rows: rows.map((r) => radFor(r, variant)) }],
    tabellKolonnar(cols, variant),
  );
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
    const mengd = await premieDialog({ deltakarar: rows.length });
    if (mengd == null) return;

    button.disabled = true;
    const { antal, error } = await drawSncPremiar(parent.id, mengd);
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
  bannerSlot.innerHTML = renderStevneBannerMenu([
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
  bindStevneBannerMenu(bannerSlot);

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
        ${printHeaderHtml(parent.navn, sncInfoFacts(parent, cols, localCount, rows.length))}
        <section class="res-seksjon">
          <div class="res-seksjon-topp">
            <h6 class="res-seksjon-tittel" id="snc-liste-tittel">${escHtml(sectionTitle(cols, rows.length))}</h6>
            ${filterHtml(locals, rows)}
          </div>
          <div id="snc-liste">${listHtml(rows, cols, "samla")}</div>
        </section>
        ${printLocalsHtml(locals, rows, cols)}
      </div>`;

    bindResultatDetaljar(container);
    bindLocalFilter(container, locals, rows, cols);
    bindBannerActions(bannerSlot, parent, locals, rows, cols, isAdmin, rerender);
  } catch (err) {
    logError("snc-resultat.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste samla resultat."));
  }
}
