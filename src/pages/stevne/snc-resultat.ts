// The consolidated SNC list. Placement and NC points come from
// complete_snc_hovudstevne; the total is recomputed with the same formula as the
// local standing (Kongelag + carried-over X-kast) so the order is readable.

import { throwerName, buildThrowerSlug } from "@/utils/kaster";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createEmptyState } from "@/components/EmptyState";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { xkastCarryOverFactor, xkastCarryOverPercent } from "@/utils/kongelagStilling";
import { sncLocalLabel } from "@/utils/sncLabel";
import { getSncParentTournament } from "@/services/stevneService";
import { getSncConsolidatedResults } from "@/services/resultatService";
import type { SncResultRow } from "@/services/resultatService";

interface ColFlags {
  showXkast: boolean;
  showKongelag: boolean;
  carryFactor: number | null;
}

function totalFor(row: SncResultRow, cols: ColFlags): number {
  if (cols.carryFactor != null) {
    return (row.poeng_kongelag ?? 0) + Math.round((row.poeng_xkast ?? 0) * cols.carryFactor);
  }
  return (cols.showKongelag ? row.poeng_kongelag : row.poeng_xkast) ?? 0;
}

function rowHtml(row: SncResultRow, cols: ColFlags): string {
  const kaster = row.kaster;
  const nameHtml = kaster
    ? `<a href="#/kastere/${buildThrowerSlug(kaster)}" class="res-kaster-lenke">${escHtml(throwerName(kaster))}</a>`
    : "–";
  return `
    <tr>
      <td class="res-td-pl">${row.snc_plassering ?? "–"}</td>
      <td class="res-td-navn">${nameHtml}</td>
      <td class="res-td-klubb">${escHtml(row.klubb?.navn ?? "–")}</td>
      <td class="res-td-klubb">${escHtml(sncLocalLabel(row.stevne))}</td>
      ${cols.showXkast ? `<td class="res-td-kp">${row.poeng_xkast ?? ""}</td>` : ""}
      ${cols.showKongelag ? `<td class="res-td-sp">${row.poeng_kongelag ?? ""}</td>` : ""}
      <td class="res-td-sp">${totalFor(row, cols)}</td>
      <td class="res-td-nc">${row.nc_poeng ?? ""}</td>
      <td class="res-td-pl">${row.plassering ?? "–"}</td>
    </tr>`;
}

function mobileRowHtml(row: SncResultRow, cols: ColFlags): string {
  const meta = [`TOT ${totalFor(row, cols)}`, `NC ${row.nc_poeng ?? "–"}`];
  if (cols.showXkast) meta.unshift(`X ${row.poeng_xkast ?? "–"}`);
  if (cols.showKongelag) meta.unshift(`K ${row.poeng_kongelag ?? "–"}`);
  return `
    <div class="res-row">
      <span class="res-pl">${row.snc_plassering ?? "–"}.</span>
      <div class="res-info">
        <span class="res-navn">${escHtml(throwerName(row.kaster) || "–")}</span>
        <span class="res-klubb">${escHtml(row.klubb?.navn ?? "–")} · ${escHtml(sncLocalLabel(row.stevne))}</span>
        <span class="res-meta">${meta.join("  ")}</span>
      </div>
    </div>`;
}

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
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
    const cols: ColFlags = {
      showXkast,
      showKongelag,
      carryFactor: showXkast && showKongelag && omganger ? xkastCarryOverFactor(omganger) : null,
    };

    const localCount = new Set(resultsResult.data.map((r) => r.stevne.id)).size;
    const carryNote =
      cols.carryFactor != null && omganger
        ? ` · overføring frå X-kast ${xkastCarryOverPercent(omganger)} %`
        : "";

    container.innerHTML = `
      <div class="res-side">
        <div class="res-felles">
          <p class="res-antall"><strong>${rows.length} deltakarar frå ${localCount} lokale stevne</strong>${escHtml(carryNote)}</p>
        </div>
        <div class="res-mobil-blokk">
          <div class="res-group">
            <div class="res-group-rows">${rows.map((r) => mobileRowHtml(r, cols)).join("")}</div>
          </div>
        </div>
        <div class="res-desktop-blokk">
          <div class="res-table-section">
            <table class="res-table">
              <thead>
                <tr class="res-thead-columns">
                  <th class="res-td-pl">Pl</th>
                  <th class="res-td-navn">NAVN</th>
                  <th class="res-td-klubb">KLUBB</th>
                  <th class="res-td-klubb">LOKALT STEVNE</th>
                  ${cols.showXkast ? '<th class="res-td-kp">X</th>' : ""}
                  ${cols.showKongelag ? '<th class="res-td-sp">K</th>' : ""}
                  <th class="res-td-sp">TOT</th>
                  <th class="res-td-nc">NC</th>
                  <th class="res-td-pl">LOKAL PL</th>
                </tr>
              </thead>
              <tbody>${rows.map((r) => rowHtml(r, cols)).join("")}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  } catch (err) {
    logError("snc-resultat.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste samla resultat."));
  }
}
