import { throwerName, buildThrowerSlug } from "@/utils/kaster";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createEmptyState } from "@/components/EmptyState";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import { getTournamentWithDetails, getResultsForTournament } from "@/services/resultatService";
import type { ResultRow } from "@/services/resultatService";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupEntry {
  label: string;
  rows: ResultRow[];
}

interface ColFlags {
  isParMix: boolean;
  showKpSp: boolean;
  showNc: boolean;
}

const NC_STEVNETYPER = new Set(["NC", "SNC", "DNC"]);
const KP_SP_INNLEDENDE = new Set(["Gloppen", "Nordhordlandsmetoden"]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Club display for a pair — "Klubb A / Klubb B" if different, "Klubb A" if same. */
function pairClubDisplay(pair: ResultRow[]): string {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const r of pair) {
    const name = r.klubb?.navn ?? "–";
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names.map(escHtml).join(" / ");
}

/** Groups rows within a group by startnummer for Par/Mix display. */
function groupPairsByStart(rows: ResultRow[]): ResultRow[][] {
  const map = new Map<number | string, ResultRow[]>();
  let fallbackIdx = 0;
  for (const r of rows) {
    const key = r.startnummer != null ? r.startnummer : `_${fallbackIdx++}`;
    const group = map.get(key) ?? [];
    group.push(r);
    map.set(key, group);
  }
  return [...map.values()];
}

function groupResults(results: ResultRow[], isBefore2026: boolean): GroupEntry[] {
  const groups = new Map<string, GroupEntry>();

  for (const r of results) {
    const groupName = r.gruppe?.navn ?? "–";
    const className = r.klasse?.navn ?? null;
    const key = isBefore2026 ? `${className ?? ""}|${groupName}` : groupName;
    const label = isBefore2026 ? `${className ? className + " " : ""}${groupName}` : groupName;

    if (!groups.has(key)) groups.set(key, { label, rows: [] });
    groups.get(key)!.rows.push(r);
  }

  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label, "nb"));
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function mobileMetaHtml(rep: ResultRow, cols: ColFlags): string {
  const parts: string[] = [];
  if (cols.showKpSp)
    parts.push(`KP ${rep.kamp_poeng_innl ?? "–"}`, `SP ${rep.score_poeng_innl ?? "–"}`);
  if (cols.showNc) parts.push(`NC ${rep.nc_poeng ?? "–"}`);
  return parts.length ? `<span class="res-meta">${parts.join("  ")}</span>` : "";
}

function mobileGroupHtml(group: GroupEntry, cols: ColFlags): string {
  const rows = rowsForGroup(
    group,
    cols,
    (pair, rep) => {
      const namesHtml = pair.map((r) => escHtml(throwerName(r.kaster) || "–")).join(" og ");
      return `
        <div class="res-row">
          <span class="res-pl">${rep.plassering ?? "–"}.</span>
          <div class="res-info">
            <span class="res-navn">${namesHtml}</span>
            <span class="res-klubb">${pairClubDisplay(pair)}</span>
            ${mobileMetaHtml(rep, cols)}
          </div>
        </div>`;
    },
    (r) => `
      <div class="res-row">
        <span class="res-pl">${r.plassering ?? "–"}.</span>
        <div class="res-info">
          <span class="res-navn">${escHtml(throwerName(r.kaster) || "–")}</span>
          <span class="res-klubb">${escHtml(r.klubb?.navn ?? "–")}</span>
          ${mobileMetaHtml(r, cols)}
        </div>
      </div>`,
  ).join("");

  return `
    <div class="res-group">
      <h2 class="res-group-title">${escHtml(group.label)}</h2>
      <div class="res-group-rows">${rows}</div>
    </div>`;
}

/** Maps a group's rows to `T`, grouping into pairs first when the category is Par/Mix. */
function rowsForGroup<T>(
  group: GroupEntry,
  cols: ColFlags,
  renderPair: (pair: ResultRow[], rep: ResultRow) => T,
  renderSingle: (r: ResultRow) => T,
): T[] {
  return cols.isParMix
    ? groupPairsByStart(group.rows).map((pair) => renderPair(pair, pair[0]!))
    : group.rows.map(renderSingle);
}

function desktopRowHtml(
  plassering: number | null,
  namesHtml: string,
  clubHtml: string,
  rep: ResultRow,
  cols: ColFlags,
): string {
  return `
    <tr>
      <td class="res-td-pl">${plassering ?? "–"}</td>
      <td class="res-td-navn">${namesHtml}</td>
      <td class="res-td-klubb">${clubHtml}</td>
      ${cols.showKpSp ? `<td class="res-td-kp">${rep.kamp_poeng_innl ?? ""}</td><td class="res-td-sp">${rep.score_poeng_innl ?? ""}</td>` : ""}
      ${cols.showNc ? `<td class="res-td-nc">${rep.nc_poeng ?? ""}</td>` : ""}
    </tr>`;
}

function desktopGroupHtml(group: GroupEntry, cols: ColFlags): string {
  const throwerLinkHtml = (r: ResultRow): string => {
    const k = r.kaster;
    return k
      ? `<a href="#/kastere/${buildThrowerSlug(k)}" class="res-kaster-lenke">${escHtml(throwerName(k))}</a>`
      : "–";
  };

  const rows = rowsForGroup(
    group,
    cols,
    (pair, rep) =>
      desktopRowHtml(
        rep.plassering,
        pair.map(throwerLinkHtml).join(" og "),
        pairClubDisplay(pair),
        rep,
        cols,
      ),
    (r) => desktopRowHtml(r.plassering, throwerLinkHtml(r), escHtml(r.klubb?.navn ?? "–"), r, cols),
  ).join("");

  const colspan = 3 + (cols.showKpSp ? 2 : 0) + (cols.showNc ? 1 : 0);

  return `
    <div class="res-table-section">
      <table class="res-table">
        <thead>
          <tr class="res-thead-group">
            <td colspan="${colspan}" class="res-td-group-header">${escHtml(group.label)}</td>
          </tr>
          <tr class="res-thead-columns">
            <th class="res-td-pl">Pl</th>
            <th class="res-td-navn">NAVN</th>
            <th class="res-td-klubb">KLUBB</th>
            ${cols.showKpSp ? '<th class="res-td-kp">KP</th><th class="res-td-sp">SP</th>' : ""}
            ${cols.showNc ? '<th class="res-td-nc">NC</th>' : ""}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
): Promise<void> {
  container.replaceChildren(createLoadingState("Laster resultat…"));

  try {
    const [stevneRes, resultatRes] = await Promise.all([
      getTournamentWithDetails(id),
      getResultsForTournament(id),
    ]);

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste stevnet."));
      return;
    }
    if (resultatRes.error) {
      container.replaceChildren(createErrorBanner("Kunne ikkje laste resultat."));
      return;
    }

    const stevne = stevneRes.data;
    const results = resultatRes.data;

    if (!results.length) {
      container.replaceChildren(
        createEmptyState(
          stevne.erfullfort ? "Ingen resultat registrert." : "Turneringa er ikkje avslutta enno.",
        ),
      );
      return;
    }

    const year = stevne.dato ? new Date(stevne.dato + "T12:00:00").getFullYear() : 9999;
    const groups = groupResults(results, year < 2026);
    const count = results.length;
    const cols: ColFlags = {
      isParMix: stevne.kategori?.erlagbasert ?? false,
      showNc: NC_STEVNETYPER.has(stevne.stevnetype?.navn ?? ""),
      showKpSp: KP_SP_INNLEDENDE.has(stevne.innledende?.navn ?? ""),
    };

    const pdfHtml = stevne.resultaturl?.startsWith("http")
      ? `<a class="res-pdf-lenke" href="${escHtml(stevne.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`
      : "";

    const juryHtml = stevne.juryleder
      ? `<p class="res-klassifisering">Juryleder: ${escHtml(stevne.juryleder)}</p>`
      : "";

    container.innerHTML = `
      <div class="res-side">
        <div class="res-felles">
          ${pdfHtml}
          ${juryHtml}
          <p class="res-antall"><strong>Antall deltakarar: ${count}</strong></p>
        </div>
        <div class="res-mobil-blokk">
          ${groups.map((g) => mobileGroupHtml(g, cols)).join("")}
        </div>
        <div class="res-desktop-blokk">
          ${groups.map((g) => desktopGroupHtml(g, cols)).join("")}
        </div>
      </div>`;
  } catch (err) {
    logError("stevne-resultat.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste resultat."));
  }
}
