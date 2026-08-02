import { throwerName } from "@/utils/kaster";
import { escHtml } from "@/utils/escHtml";
import { createTabs } from "@/components/Tabs";
import { getMyMatches, getStartNumbersForTournaments } from "@/services/kampService";
import { newTabAnchorAttrs } from "@/services/navigationService";
import { renderSectionCard } from "./_sectionCard";
import type { MinSideContext } from "./_linkState";
import type { MatchPlayerRow } from "@/services/kampService";

function makePanel(html: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
}

type MatchPlayerInMatch = NonNullable<MatchPlayerRow["kamp"]>["spelarar"][number];

const PHASES = [
  { key: "innledende", label: "Innleiande" },
  { key: "avsluttende", label: "Avsluttande" },
] as const;

function phaseRank(ks: MatchPlayerRow): number {
  const idx = PHASES.findIndex((p) => p.key === ks.kamp?.fase);
  return idx === -1 ? PHASES.length : idx;
}

/** Players in a match other than the given thrower, excluding anyone sharing the same start number (teammates). */
function findOpponents(
  players: MatchPlayerInMatch[],
  throwerId: number,
  tournamentId: number | null | undefined,
  startNrMap: Record<string, number>,
): MatchPlayerInMatch[] {
  const myStartNr = tournamentId != null ? startNrMap[`${tournamentId}:${throwerId}`] : undefined;
  return players.filter((s) => {
    if (s.kasterid == null || s.kasterid === throwerId) return false;
    const opponentStartNr =
      tournamentId != null ? startNrMap[`${tournamentId}:${s.kasterid}`] : undefined;
    return myStartNr == null || opponentStartNr == null || opponentStartNr !== myStartNr;
  });
}

async function buildMatchesContent(throwerId: number): Promise<HTMLElement> {
  const { data, error } = await getMyMatches(throwerId);
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

  const tableHeader = `<thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead>`;

  const makeMatchRow = (ks: MatchPlayerRow, button: string): string => {
    const match = ks.kamp;
    const tournamentId = match?.stevneid;
    const opponents = findOpponents(match?.spelarar ?? [], throwerId, tournamentId, startNrMap);
    const opponentNames = opponents.length
      ? opponents.map((m) => escHtml(throwerName(m.kaster))).join(" / ")
      : "–";
    return `<tr>
      <td>R${match?.runde_nummer ?? ""} / B${match?.bane_nummer ?? ""}</td>
      <td>${opponentNames}</td>
      <td>${button}</td>
    </tr>`;
  };

  const matchTableHtml = (
    group: MatchPlayerRow[],
    makeButton: (ks: MatchPlayerRow) => string,
  ): string => `
      <table class="table table-sm mb-3">${tableHeader}<tbody>
        ${group.map((ks) => makeMatchRow(ks, makeButton(ks))).join("")}
      </tbody></table>`;

  /** One table per phase with a small heading — only when the tournament actually spans both phases. */
  const phaseSectionsHtml = (
    group: MatchPlayerRow[],
    makeButton: (ks: MatchPlayerRow) => string,
  ): string => {
    const byPhase = PHASES.map(({ key, label }) => ({
      label,
      matches: group.filter((ks) => ks.kamp?.fase === key),
    })).filter((p) => p.matches.length);
    const allPhasesKnown = byPhase.reduce((n, p) => n + p.matches.length, 0) === group.length;
    if (byPhase.length < 2 || !allPhasesKnown) return matchTableHtml(group, makeButton);
    return byPhase
      .map(
        ({ label, matches: phaseMatches }) => `
      <p class="text-muted small mb-1">${label}</p>
      ${matchTableHtml(phaseMatches, makeButton)}`,
      )
      .join("");
  };

  const groupMatchesByTournament = (
    matches: MatchPlayerRow[],
    makeButton: (ks: MatchPlayerRow) => string,
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
      <p class="fw-semibold mb-1 mt-2">${escHtml(name)}</p>
      ${groupByPhase ? phaseSectionsHtml(group, makeButton) : matchTableHtml(group, makeButton)}`,
      )
      .join("");
  };

  const activeContent = groupMatchesByTournament(active, (ks) => {
    if (!ks.kamp?.er_bekreftet) {
      return `<a href="#/kamp/${ks.kamp?.id ?? ""}" class="btn btn-sm btn-primary"${newTabAnchorAttrs()}>Scoreboard</a>`;
    }
    const tournamentId = ks.kamp.stevneid;
    const myScore = ks.kamp.spelarar?.find((s) => s.kasterid === throwerId)?.score_poeng;
    const oppScore = findOpponents(ks.kamp.spelarar ?? [], throwerId, tournamentId, startNrMap)[0]
      ?.score_poeng;
    if (myScore == null || oppScore == null) return "–";
    return `<span class="fw-semibold">${myScore} – ${oppScore}</span>`;
  });
  const completedContent = groupMatchesByTournament(
    completed,
    (ks) =>
      `<a href="#/kamp/${ks.kamp?.id ?? ""}" class="btn btn-sm btn-outline-secondary"${newTabAnchorAttrs()}>Vis</a>`,
    true,
  );

  return createTabs({
    tabs: [
      {
        id: "active",
        label: `Aktive (${active.length})`,
        panel: makePanel(activeContent ?? '<p class="text-muted">Ingen aktive kampar.</p>'),
      },
      {
        id: "completed",
        label: `Ferdige (${completed.length})`,
        panel: makePanel(
          completedContent ?? '<p class="text-muted">Ingen ferdige kampar enno.</p>',
        ),
      },
    ],
  });
}

export async function render(container: HTMLElement, ctx: MinSideContext): Promise<void> {
  const shell = renderSectionCard(container, ctx, "Mine kampar");
  if (!shell) return;

  const content = await buildMatchesContent(shell.throwerId);
  shell.slot.replaceChildren(content);
}
