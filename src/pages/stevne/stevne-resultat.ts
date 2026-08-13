// One stevne's own result, in the same table the consolidated SNC list uses. Which
// score columns appear follows from the kastemetodar thrown; see ResultatTabell.

import { throwerName, buildThrowerSlug } from "@/utils/kaster";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createEmptyState } from "@/components/EmptyState";
import { escHtml } from "@/utils/escHtml";
import { logError } from "@/utils/logError";
import {
  bindResultatDetaljar,
  resultatKolonnar,
  resultatListeHtml,
} from "@/components/ResultatTabell";
import type { ResultatKolonnar, ResultatRad } from "@/components/ResultatTabell";
import { printHeaderHtml, stevneInfoFacts } from "@/components/ResultatPrint";
import { renderBannerMenu, bindBannerMenu } from "@/components/BannerMenu";
import {
  isKongelagMethodName,
  isXkastMethodName,
  usesInitialRoundCount,
} from "@/utils/kastemetode";
import { xkastCarryOverFactor, xkastCarryOverPercent } from "@/utils/kongelagStilling";
import { getTournamentWithDetails, getResultsForTournament } from "@/services/resultatService";
import type { ResultRow, TournamentDetailsRow } from "@/services/resultatService";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupEntry {
  label: string;
  rows: ResultRow[];
}

const NC_STEVNETYPER = new Set(["NC", "SNC", "DNC"]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Club display for a pair — "Klubb A / Klubb B" if different, "Klubb A" if same. */
function pairClubDisplay(pair: ResultRow[]): string {
  const seen = new Set<string>();
  for (const r of pair) seen.add(r.klubb?.navn ?? "–");
  return [...seen].join(" / ");
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

/**
 * Which columns the thrown kastemetodar earn: X-kast innledende brings Poeng and
 * Ringar plus the share it carries, Gloppen/NHM bring KP and SP, Kongelag brings
 * its own pair and — with an innledende phase behind it — the total.
 */
function columnsFor(stevne: TournamentDetailsRow, results: ResultRow[]): ResultatKolonnar {
  const innl = stevne.innledende?.navn ?? null;
  const avsl = stevne.avsluttende?.navn ?? null;
  const isXkast = innl != null && isXkastMethodName(innl);
  const isKongelag = avsl != null && isKongelagMethodName(avsl);
  const omganger = stevne.innledende?.antall_omganger ?? null;
  // Only an X-kast innledende carries a normalized share; Gloppen/NHM carry their
  // kamppoeng as thrown, which the KP column already shows.
  const carryOmganger = isXkast && isKongelag ? omganger : null;

  return resultatKolonnar({
    visInnlPoeng: isXkast,
    visKpSp: innl != null && usesInitialRoundCount(innl),
    visAvslPoeng: isKongelag,
    visTotal: isKongelag && innl != null,
    visNc: NC_STEVNETYPER.has(stevne.stevnetype?.navn ?? ""),
    visSncPl: stevne.snc_hovudstevne_id != null && results.some((r) => r.snc_plassering != null),
    innlLabel: innl ?? "Innleiande",
    avslLabel: avsl ?? "Avsluttande",
    carryFactor: carryOmganger != null ? xkastCarryOverFactor(carryOmganger) : null,
    carryPercent: carryOmganger != null ? xkastCarryOverPercent(carryOmganger) : null,
  });
}

function throwerLinkHtml(r: ResultRow): string {
  const k = r.kaster;
  return k
    ? `<a href="#/kastere/${buildThrowerSlug(k)}" class="res-kaster-lenke">${escHtml(throwerName(k))}</a>`
    : "–";
}

/** One line of the list — a single thrower, or a Par/Mix pair read as one. */
function radFor(pair: ResultRow[]): ResultatRad {
  const rep = pair[0]!;
  return {
    pl: rep.plassering,
    namn: pair.map((r) => throwerName(r.kaster) || "–").join(" og "),
    namnHtml: pair.map(throwerLinkHtml).join(" og "),
    klubb: pairClubDisplay(pair),
    poengInnl: rep.poeng_xkast,
    ringInnl: rep.antall_ring_xkast,
    kampPoeng: rep.kamp_poeng_innl,
    scorePoeng: rep.score_poeng_innl,
    poengAvsl: rep.poeng_kongelag,
    ringAvsl: rep.antall_ring_kongelag,
    ncPoeng: rep.nc_poeng,
    sncPl: rep.snc_plassering,
    erpremie: rep.erpremie ?? false,
  };
}

function radarFor(group: GroupEntry, isParMix: boolean): ResultatRad[] {
  return isParMix ? groupPairsByStart(group.rows).map(radFor) : group.rows.map((r) => radFor([r]));
}

// ── Render ────────────────────────────────────────────────────────────────────

/** Print lives in the banner's overflow menu, the same place the SNC list has it. */
function bindPrint(bannerSlot: HTMLElement | null | undefined): void {
  if (!bannerSlot) return;
  bannerSlot.innerHTML = renderBannerMenu([
    { id: "res-print-btn", label: "Skriv ut / lagre som PDF" },
  ]);
  bindBannerMenu(bannerSlot);
  bannerSlot.querySelector("#res-print-btn")?.addEventListener("click", () => window.print());
}

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
  bannerSlot?: HTMLElement | null,
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
    const cols = columnsFor(stevne, results);
    const isParMix = stevne.kategori?.erlagbasert ?? false;

    const sncHtml =
      stevne.snc_hovudstevne_id != null
        ? `<p class="res-klassifisering">
             <a href="#/stevne/${stevne.snc_hovudstevne_id}/resultat">Samla SNC-resultat for alle lokale stevne →</a>
           </p>`
        : "";

    const pdfHtml = stevne.resultaturl?.startsWith("http")
      ? `<a class="res-pdf-lenke" href="${escHtml(stevne.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`
      : "";

    const juryHtml = stevne.juryleder
      ? `<p class="res-klassifisering">Juryleder: ${escHtml(stevne.juryleder)}</p>`
      : "";

    container.innerHTML = `
      <div class="res-side">
        ${printHeaderHtml(stevne.navn, stevneInfoFacts(stevne, results.length))}
        <div class="res-felles">
          ${pdfHtml}
          ${sncHtml}
          ${juryHtml}
          <p class="res-antall"><strong>Antall deltakarar: ${results.length}</strong></p>
        </div>
        ${resultatListeHtml(
          groups.map((g) => ({ tittel: g.label, rows: radarFor(g, isParMix) })),
          cols,
        )}
      </div>`;

    bindResultatDetaljar(container);
    bindPrint(bannerSlot);
  } catch (err) {
    logError("stevne-resultat.render", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste resultat."));
  }
}
