import { throwerName } from "@/utils/kaster";
import { escHtml } from "@/utils/escHtml";
import { createTabs } from "@/components/Tabs";
import { getMyMatches, getStartNumbersForTournaments } from "@/services/kampService";
import { getMyCourts } from "@/services/xkastKongelagService";
import { newTabAnchorAttrs } from "@/services/navigationService";
import { scoreboardLinkHtml } from "@/components/ScoreboardButton";
import { getAllMatchSides, sideScore } from "@/utils/kamp";
import { renderSectionCard } from "./_sectionCard";
import type { MinSideContext } from "./_linkState";
import type { MatchPlayerRow } from "@/services/kampService";
import type { MyCourtRow } from "@/services/xkastKongelagService";

function makePanel(html: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
}

type MatchPlayerInMatch = NonNullable<MatchPlayerRow["kamp"]>["spelarar"][number];
type IdentifiedPlayer = MatchPlayerInMatch & { kasterid: number };

const PHASES = [
  { key: "innledende", label: "Innleiande" },
  { key: "avsluttende", label: "Avsluttande" },
] as const;

function phaseRank(ks: MatchPlayerRow): number {
  const idx = PHASES.findIndex((p) => p.key === ks.kamp?.fase);
  return idx === -1 ? PHASES.length : idx;
}

// ── Shared 4-column grid ──────────────────────────────────────────────────────

/** One row of the listing: the same four columns for kampar and X-kast banar. */
interface GridRow {
  /** "R1 / B2" for a kamp, "B2" for an X-kast bane. */
  slot: string;
  /** Opponent(s) or team-mate(s), already escaped. */
  name: string;
  /** Result badge or the open-the-match control. */
  result: string;
  /** Stats icon, ring count, or empty — the cell always exists so columns align. */
  stats: string;
}

function gridHtml(headers: [string, string, string], rows: GridRow[]): string {
  const head = `<div class="match-grid__head" role="row">
      <span role="columnheader">${headers[0]}</span>
      <span role="columnheader">${headers[1]}</span>
      <span role="columnheader" class="match-grid__end">${headers[2]}</span>
      <span role="columnheader"><span class="visually-hidden">Statistikk</span></span>
    </div>`;
  const body = rows
    .map(
      (r) => `<div class="match-grid__row" role="row">
      <span class="match-grid__slot" role="cell">${r.slot}</span>
      <span class="match-grid__name" role="cell">${r.name}</span>
      <span class="match-grid__result" role="cell">${r.result}</span>
      <span class="match-grid__stats" role="cell">${r.stats}</span>
    </div>`,
    )
    .join("");
  return `<div class="match-grid" role="table">${head}${body}</div>`;
}

type Outcome = "win" | "loss" | "draw" | "neutral";

const OUTCOME_TITLE: Record<Outcome, string> = {
  win: "Vunne",
  loss: "Tapt",
  draw: "Uavgjort",
  neutral: "",
};

function resultBadge(text: string, outcome: Outcome, title = OUTCOME_TITLE[outcome]): string {
  const attr = title ? ` title="${escHtml(title)}"` : "";
  return `<span class="result-badge result-badge--${outcome}"${attr}>${text}</span>`;
}

function ringsHtml(rings: number | null | undefined): string {
  if (rings == null) return "";
  return `<span class="match-grid__rings" title="Ringar">${rings}</span>`;
}

// ── Sides ─────────────────────────────────────────────────────────────────────

/**
 * The match's players grouped into sides by startnummer, with my own side first.
 * startNrMap spans several stevner (see getStartNumbersForTournaments), so it is
 * narrowed to this match's stevne before grouping.
 */
function matchSides(
  ks: MatchPlayerRow,
  throwerId: number,
  startNrMap: Record<string, number>,
): { mine: IdentifiedPlayer[]; others: IdentifiedPlayer[][] } {
  const match = ks.kamp;
  const players = (match?.spelarar ?? []).filter((s): s is IdentifiedPlayer => s.kasterid != null);
  const localMap: Record<number, number> = {};
  for (const s of players) {
    const nr = match?.stevneid != null ? startNrMap[`${match.stevneid}:${s.kasterid}`] : undefined;
    if (nr != null) localMap[s.kasterid] = nr;
  }
  const sides = getAllMatchSides(players, localMap);
  const mineIdx = sides.findIndex((side) => side.members.some((m) => m.kasterid === throwerId));
  return {
    mine: mineIdx === -1 ? [] : (sides[mineIdx]?.members ?? []),
    others: sides.filter((_, i) => i !== mineIdx).map((side) => side.members),
  };
}

function namesHtml(sides: IdentifiedPlayer[][]): string {
  const names = sides.flat().map((m) => escHtml(throwerName(m.kaster)));
  return names.length ? names.join(" / ") : "–";
}

function sideTotal(members: IdentifiedPlayer[], isConfirmed: boolean): number {
  return sideScore({ rep: members[0]!, members }, isConfirmed);
}

// ── Matches ───────────────────────────────────────────────────────────────────

async function buildMatchesContent(throwerId: number): Promise<HTMLElement> {
  const [{ data, error }, courtsRes] = await Promise.all([
    getMyMatches(throwerId),
    getMyCourts(throwerId),
  ]);
  if (error) {
    const p = document.createElement("p");
    p.className = "text-muted";
    p.textContent = "Kunne ikkje laste kampar.";
    return p;
  }

  const allMatches = data.filter((ks) => !ks.kamp?.er_walkover);

  const tournamentIds = [
    ...new Set(allMatches.map((ks) => ks.kamp?.stevneid).filter((s): s is number => s != null)),
  ];
  const startNrMap = await getStartNumbersForTournaments(tournamentIds);

  const active = allMatches
    .filter((ks) => ks.kamp?.stevne?.erfullfort === false)
    .sort((a, b) => (a.kamp?.runde_nummer ?? 0) - (b.kamp?.runde_nummer ?? 0));

  const completed = allMatches
    .filter((ks) => ks.kamp?.stevne?.erfullfort === true)
    .sort(
      (a, b) =>
        (b.kamp?.stevne?.dato ?? "").localeCompare(a.kamp?.stevne?.dato ?? "") ||
        phaseRank(a) - phaseRank(b) ||
        (a.kamp?.runde_nummer ?? 0) - (b.kamp?.runde_nummer ?? 0),
    );

  /** True once any player in the match has kamp_omgang rows — the stats view needs them. */
  const hasStats = (ks: MatchPlayerRow): boolean =>
    (ks.kamp?.spelarar ?? []).some((s) => (s.omgangar?.length ?? 0) > 0);

  /**
   * The result cell of a played match: the score as a win/loss/draw pill, or the
   * placement for a 3-side match, where scores do not decide the outcome.
   */
  const matchResultHtml = (ks: MatchPlayerRow): string => {
    const match = ks.kamp;
    const isConfirmed = match?.er_bekreftet ?? false;
    const { mine, others } = matchSides(ks, throwerId, startNrMap);

    if (match?.er_tre_spelarar || others.length > 1) {
      const placement = mine.find((m) => m.kasterid === throwerId)?.kamp_plassering;
      if (placement == null) return resultBadge("–", "neutral");
      return resultBadge(
        `${placement}. plass`,
        placement >= 3 ? "loss" : "win",
        `Plassering i kampen: ${placement}`,
      );
    }

    const opponents = others[0];
    if (!mine.length || !opponents?.length) return resultBadge("–", "neutral");
    const me = sideTotal(mine, isConfirmed);
    const them = sideTotal(opponents, isConfirmed);
    const outcome: Outcome = me > them ? "win" : me < them ? "loss" : "draw";
    return resultBadge(`${me} – ${them}`, outcome);
  };

  const matchRow = (ks: MatchPlayerRow, showResult: boolean): GridRow => {
    const match = ks.kamp;
    const { others } = matchSides(ks, throwerId, startNrMap);
    const statsLink = hasStats(ks)
      ? scoreboardLinkHtml(match?.id ?? "", newTabAnchorAttrs(), "scoreboard-btn--stats")
      : "";
    return {
      slot: `R${match?.runde_nummer ?? ""} / B${match?.bane_nummer ?? ""}`,
      name: namesHtml(others),
      result: showResult
        ? matchResultHtml(ks)
        : scoreboardLinkHtml(match?.id ?? "", newTabAnchorAttrs(), "scoreboard-btn--touch"),
      stats: showResult ? statsLink : "",
    };
  };

  const matchGridHtml = (group: MatchPlayerRow[]): string =>
    gridHtml(
      ["Runde / Bane", "Motstandar", "Resultat"],
      group.map((ks) => matchRow(ks, ks.kamp?.er_bekreftet ?? false)),
    );

  /** One grid per phase with a small heading — only when the stevne spans both phases. */
  const phaseSectionsHtml = (group: MatchPlayerRow[]): string => {
    const byPhase = PHASES.map(({ key, label }) => ({
      label,
      matches: group.filter((ks) => ks.kamp?.fase === key),
    })).filter((p) => p.matches.length);
    const allPhasesKnown = byPhase.reduce((n, p) => n + p.matches.length, 0) === group.length;
    if (byPhase.length < 2 || !allPhasesKnown) return matchGridHtml(group);
    return byPhase
      .map(
        ({ label, matches: phaseMatches }) => `
      <p class="match-grid__phase">${label}</p>
      ${matchGridHtml(phaseMatches)}`,
      )
      .join("");
  };

  const groupMatchesByTournament = (
    matches: MatchPlayerRow[],
    groupByPhase = false,
  ): string | null => {
    if (!matches.length) return null;
    const groups = new Map<number | string, { name: string; matches: MatchPlayerRow[] }>();
    for (const ks of matches) {
      const tournamentId = ks.kamp?.stevneid ?? "unknown";
      const tournamentName = ks.kamp?.stevne?.navn ?? "";
      if (!groups.has(tournamentId))
        groups.set(tournamentId, { name: tournamentName, matches: [] });
      groups.get(tournamentId)!.matches.push(ks);
    }
    return [...groups.values()]
      .map(
        ({ name, matches: group }) => `
      <p class="match-grid__stevne">${escHtml(name)}</p>
      ${groupByPhase ? phaseSectionsHtml(group) : matchGridHtml(group)}`,
      )
      .join("");
  };

  const activeContent = groupMatchesByTournament(active);
  const completedContent = groupMatchesByTournament(completed, true);

  // ── X-kast banar ────────────────────────────────────────────────────────────
  // X-kast only — Kongelag is scored by the organizer, so it gets no player entry point.
  const myCourts = courtsRes.data.filter((c) => c.fase === "innledende");

  const activeCourts = myCourts
    .filter((c) => c.stevne?.erfullfort === false)
    .sort((a, b) => (a.bane_nummer ?? 0) - (b.bane_nummer ?? 0));
  const completedCourts = myCourts
    .filter((c) => c.stevne?.erfullfort === true)
    .sort(
      (a, b) =>
        (b.stevne?.dato ?? "").localeCompare(a.stevne?.dato ?? "") ||
        (a.bane_nummer ?? 0) - (b.bane_nummer ?? 0),
    );

  const courtHref = (court: MyCourtRow): string => `#/stevne/${court.stevneid}/innledende`;

  /** X-kast is not head-to-head: poeng in a neutral pill, ringar where a kamp shows its stats icon. */
  const courtRow = (court: MyCourtRow): GridRow => {
    const me = court.deltakarar.find((d) => d.kasterid === throwerId);
    const others = court.deltakarar
      .filter((d) => d.kasterid !== throwerId)
      .map((d) => escHtml(throwerName(d.kaster)));
    const confirmed = court.er_bekreftet ?? false;
    return {
      slot: `B${court.bane_nummer ?? ""}`,
      name: others.length ? others.join(" / ") : "–",
      result: confirmed
        ? resultBadge(me?.poeng == null ? "–" : String(me.poeng), "neutral")
        : `<a href="${courtHref(court)}" class="btn btn-sm btn-primary">Opne bane</a>`,
      stats: confirmed ? ringsHtml(me?.antall_ringer) : "",
    };
  };

  const groupCourtsByTournament = (courts: MyCourtRow[]): string | null => {
    if (!courts.length) return null;
    const groups = new Map<number | string, { name: string; courts: MyCourtRow[] }>();
    for (const court of courts) {
      const key = court.stevneid ?? "unknown";
      if (!groups.has(key))
        groups.set(key, { name: `${court.stevne?.navn ?? ""} – X-kast`, courts: [] });
      groups.get(key)!.courts.push(court);
    }
    return [...groups.values()]
      .map(
        ({ name, courts: group }) => `
      <p class="match-grid__stevne">${escHtml(name)}</p>
      ${gridHtml(["Bane", "Medspelarar", "Poeng"], group.map(courtRow))}`,
      )
      .join("");
  };

  const activeCourtsContent = groupCourtsByTournament(activeCourts);
  const completedCourtsContent = groupCourtsByTournament(completedCourts);

  const activeHtml = [activeContent, activeCourtsContent].filter(Boolean).join("");
  const completedHtml = [completedContent, completedCourtsContent].filter(Boolean).join("");

  return createTabs({
    tabs: [
      {
        id: "active",
        label: `Aktive (${active.length + activeCourts.length})`,
        panel: makePanel(activeHtml || '<p class="text-muted">Ingen aktive kampar.</p>'),
      },
      {
        id: "completed",
        label: `Ferdige (${completed.length + completedCourts.length})`,
        panel: makePanel(completedHtml || '<p class="text-muted">Ingen ferdige kampar enno.</p>'),
      },
    ],
  });
}

export async function render(container: HTMLElement, ctx: MinSideContext): Promise<void> {
  const shell = renderSectionCard(container, ctx, "Mine kampar og banar");
  if (!shell) return;

  const content = await buildMatchesContent(shell.throwerId);
  shell.slot.replaceChildren(content);
}
