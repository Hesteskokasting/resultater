import { throwerName } from "@/utils/kaster";
import { escHtml } from "@/utils/escHtml";
import { createTabs } from "@/components/Tabs";
import { getMyMatches, getStartNumbersForTournaments } from "@/services/kampService";
import { getMyCourts } from "@/services/xkastKongelagService";
import { newTabAnchorAttrs } from "@/services/navigationService";
import { scoreboardLinkHtml } from "@/components/scoreboard/ScoreboardButton";
import { groupBy } from "@/utils/groupBy";
import { isByeSide, matchOutcome, matchSides } from "@/utils/kamp/myMatches";
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

/**
 * The fase heading: the kastemetode the stevne runs that fase with ("Gloppen",
 * "Cup"), which says more than the fase itself. Falls back to the fase name for
 * a stevne whose metode is not set.
 */
function phaseLabel(ks: MatchPlayerRow, fallback: string): string {
  const stevne = ks.kamp?.stevne;
  const metode =
    ks.kamp?.fase === "innledende" ? stevne?.metodeInnl?.navn : stevne?.metodeAvsl?.navn;
  return metode ?? fallback;
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

/**
 * headers[3] labels the trailing column; empty means the column carries icons
 * rather than values, so the label is there for screen readers only.
 */
function gridHtml(headers: [string, string, string, string], rows: GridRow[]): string {
  const trailing = headers[3] ? headers[3] : '<span class="visually-hidden">Statistikk</span>';
  const head = `<div class="match-grid__head" role="row">
      <span role="columnheader">${headers[0]}</span>
      <span role="columnheader">${headers[1]}</span>
      <span role="columnheader" class="match-grid__result">${headers[2]}</span>
      <span role="columnheader" class="match-grid__stats">${trailing}</span>
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

/**
 * One name per line — a slash-joined run wraps mid-name on a phone. Each side
 * keeps its own group, so a pair reads as a pair and a rule separates it from
 * the next side.
 */
function namesHtml(sides: IdentifiedPlayer[][]): string {
  const groups = sides
    .map((side) =>
      side
        .map((m) => escHtml(throwerName(m.kaster)))
        .filter(Boolean)
        .map((n) => `<span class="match-grid__name-line">${n}</span>`)
        .join(""),
    )
    .filter(Boolean);
  if (!groups.length) return "–";
  return groups.map((g) => `<span class="match-grid__side">${g}</span>`).join("");
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

  const allMatches = data;

  const tournamentIds = [
    ...new Set(allMatches.map((ks) => ks.kamp?.stevneid).filter((s): s is number => s != null)),
  ];
  const startNrMap = await getStartNumbersForTournaments(tournamentIds);

  const active = allMatches
    .filter((ks) => ks.kamp?.stevne?.erfullfort === false)
    .sort(
      (a, b) =>
        phaseRank(a) - phaseRank(b) || (a.kamp?.runde_nummer ?? 0) - (b.kamp?.runde_nummer ?? 0),
    );

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
   * The result cell: the score as a win/loss/draw pill, or the placement for a
   * 3-side match. An unconfirmed match shows its running score (0 – 0 before the
   * first omgang) in the neutral tint.
   */
  const matchResultHtml = (ks: MatchPlayerRow): string => {
    const outcome = matchOutcome(ks.kamp, throwerId, startNrMap);
    switch (outcome.kind) {
      case "walkover":
        return resultBadge("21 – 0", "win", "Vunne på walkover");
      case "placement":
        return resultBadge(
          `${outcome.placement}. plass`,
          outcome.placement >= 3 ? "loss" : "win",
          `Plassering i kampen: ${outcome.placement}`,
        );
      case "score": {
        const { me, them } = outcome;
        if (!outcome.confirmed) return resultBadge(`${me} – ${them}`, "neutral", "Ikkje stadfesta");
        return resultBadge(`${me} – ${them}`, me > them ? "win" : me < them ? "loss" : "draw");
      }
      default:
        return resultBadge("–", "neutral");
    }
  };

  /**
   * Trailing cell: the stats icon once the match has omgang rows. An unconfirmed
   * match always gets it — the same link is the player's way into the scoreboard.
   * A walkover is never thrown, so it gets neither.
   */
  const matchStatsHtml = (ks: MatchPlayerRow): string => {
    const match = ks.kamp;
    if (match?.er_walkover) return "";
    if (!(match?.er_bekreftet ?? false)) {
      return scoreboardLinkHtml(match?.id ?? "", newTabAnchorAttrs(), "scoreboard-btn--touch");
    }
    if (!hasStats(ks)) return "";
    return scoreboardLinkHtml(match?.id ?? "", newTabAnchorAttrs(), "scoreboard-btn--stats");
  };

  const matchRow = (ks: MatchPlayerRow): GridRow => {
    const match = ks.kamp;
    const { others } = matchSides(match, throwerId, startNrMap);
    const isBye = match?.er_walkover && isByeSide(others[0]);
    return {
      // Bane carries the weight — the round is context, so it stays muted.
      slot:
        `<span class="match-grid__round">R${match?.runde_nummer ?? ""} /</span> ` +
        `B${match?.bane_nummer ?? ""}`,
      name: isBye ? '<span class="match-grid__bye">Walkover</span>' : namesHtml(others),
      result: matchResultHtml(ks),
      stats: matchStatsHtml(ks),
    };
  };

  // "R / B" reads as nothing on its own, so the label is for screen readers only.
  const matchGridHtml = (group: MatchPlayerRow[]): string =>
    gridHtml(
      ['<span class="visually-hidden">Runde og bane</span>', "Motstandar", "Resultat", ""],
      group.map((ks) => matchRow(ks)),
    );

  /**
   * One labelled grid per fase, whether or not the stevne spans both — a stevne
   * still in innleiande gets its heading too. Matches whose fase is unknown fall
   * into a trailing unlabelled grid.
   */
  const phaseSectionsHtml = (group: MatchPlayerRow[]): string => {
    const sections = PHASES.map(({ key, label }) => ({
      label,
      matches: group.filter((ks) => ks.kamp?.fase === key),
    })).filter((p) => p.matches.length);
    const unknown = group.filter((ks) => !PHASES.some((p) => p.key === ks.kamp?.fase));
    return [
      ...sections.map(
        ({ label, matches }) => `
      <p class="match-grid__phase">${escHtml(phaseLabel(matches[0]!, label))}</p>
      ${matchGridHtml(matches)}`,
      ),
      ...(unknown.length ? [matchGridHtml(unknown)] : []),
    ].join("");
  };

  const groupMatchesByTournament = (matches: MatchPlayerRow[]): string | null => {
    if (!matches.length) return null;
    return [...groupBy(matches, (ks) => ks.kamp?.stevneid ?? "unknown").values()]
      .map(
        (group) => `
      <p class="match-grid__stevne">${escHtml(group[0]?.kamp?.stevne?.navn ?? "")}</p>
      ${phaseSectionsHtml(group)}`,
      )
      .join("");
  };

  const activeContent = groupMatchesByTournament(active);
  const completedContent = groupMatchesByTournament(completed);

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
    return [...groupBy(courts, (court) => court.stevneid ?? "unknown").values()]
      .map(
        (group) => `
      <p class="match-grid__stevne">${escHtml(`${group[0]?.stevne?.navn ?? ""} – X-kast`)}</p>
      ${gridHtml(
        [
          '<span class="visually-hidden">Bane</span>',
          "Medspelarar",
          "Poeng",
          '<span class="visually-hidden">Ringar</span>',
        ],
        group.map((c) => courtRow(c)),
      )}`,
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
  const shell = renderSectionCard(container, ctx, "Kampar / X-kast");
  if (!shell) return;

  const content = await buildMatchesContent(shell.throwerId);
  shell.slot.replaceChildren(content);
}
