// ── View half of the innledende phase ─────────────────────────────────────────
//
// Pure view: every function here takes rows and maps and returns HTML (or adds a
// class to already-rendered HTML). No fetching, no closure state, no writes —
// createInnledendeRenderer owns all of that and calls in here to draw.
//
// A round is drawn twice over: a table for desktop and a list for mobile. The two
// share calcMatchRowState so the score, the status stripe and the live pill can
// never disagree between the layouts.
//
import { getMatchSides, sideScore, type MatchSide } from "@/utils/kamp";
import { sideNameHtml } from "../faseView";
import { scoreboardButtonHtml } from "@/components/scoreboard/ScoreboardButton";
import { livePillHtml } from "@/components/LivePill";
import type { InitialMatchRow, InitialMatchPlayerRow } from "@/services/kampService";

/** Any member of the side has omgang rows (pair members alternate omgangar). */
function sideHasRounds(side: MatchSide<InitialMatchPlayerRow> | null): boolean {
  return side?.members.some((m) => (m.omgangar?.length ?? 0) > 0) ?? false;
}

type MatchStatus = "done" | "in-progress" | "not-started";

function resolveMatchStatus(
  kamp: InitialMatchRow,
  hasPoints: boolean,
  hasRounds: boolean,
): MatchStatus {
  if (kamp.er_bekreftet) return "done";
  if (hasRounds || hasPoints) return "in-progress";
  return "not-started";
}

export function renderMatchLegend(): string {
  return `
    <div class="match-legend">
      <div class="match-legend__item"><div class="match-legend__stripe match-legend__stripe--not-started"></div> Ikke startet</div>
      <div class="match-legend__item"><div class="match-legend__stripe match-legend__stripe--in-progress"></div> Pågår</div>
      <div class="match-legend__item"><div class="match-legend__stripe match-legend__stripe--done"></div> Ferdig</div>
    </div>`;
}

export function renderRound(
  nr: number,
  matches: InitialMatchRow[],
  startNumberMap: Record<number, number>,
  admin: boolean,
  hcpMap: Record<number, number> = {},
  positionMap: Record<number, number> = {},
): string {
  const desktopRows = matches
    .map((k) => matchRow(k, startNumberMap, admin, hcpMap, positionMap))
    .join("");
  const mobileRows = matches
    .map((k) => matchRowMobile(k, startNumberMap, admin, hcpMap, positionMap))
    .join("");

  return `
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${nr}</h6>
      <table class="table table-sm match-table mb-0 match-table--desktop">
        <thead class="stevne-thead">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>P1</th>
            <th class="th-96 text-center initial-score-th">SCORE</th>
            <th>P2</th>
            ${admin ? '<th class="th-148"></th>' : '<th class="th-80"></th>'}
          </tr>
        </thead>
        <tbody>${desktopRows}</tbody>
      </table>
      <ul class="match-list-mobile list-unstyled mb-0">${mobileRows}</ul>
    </div>`;
}

/** Adds the one-shot flash class to rows whose match was just confirmed. */
export function applyFlashClasses(
  container: HTMLElement,
  idsToFlash: Set<number>,
  allMatches: InitialMatchRow[],
): void {
  for (const matchId of idsToFlash) {
    container
      .querySelectorAll(`[data-kamp-id="${matchId}"]`)
      .forEach((el) => el.classList.add("match-newly-confirmed"));
    const kamp = allMatches.find((k) => k.id === matchId);
    if (!kamp) continue;
    for (const sp of kamp.spelarar) {
      container
        .querySelectorAll(
          `#standing-initial tr.standing-player-row[data-kasterid="${sp.kasterid}"] td`,
        )
        .forEach((el) => el.classList.add("standing-new-confirmed"));
    }
  }
}

// ── Row state ─────────────────────────────────────────────────────────────────

/** A side's raw score: confirmed total, or live omgang sum plus handicap. */
function sideRawScore(
  side: MatchSide<InitialMatchPlayerRow> | null,
  isConfirmed: boolean,
  hasRounds: boolean,
  hcp: number,
): number {
  if (isConfirmed) return sideScore(side, true);
  return sideScore(side, false) + (hasRounds ? hcp : 0);
}

/** Displayed scores: an unconfirmed walkover shows 21–0; otherwise the raw side totals. */
export function calcRowScores(
  kamp: InitialMatchRow,
  side1: MatchSide<InitialMatchPlayerRow> | null,
  side2: MatchSide<InitialMatchPlayerRow> | null,
  hasRounds1: boolean,
  hasRounds2: boolean,
  hcp1: number,
  hcp2: number,
): { s1: number; s2: number; hasPoints: boolean } {
  const s1Raw = sideRawScore(side1, kamp.er_bekreftet, hasRounds1, hcp1);
  const s2Raw = sideRawScore(side2, kamp.er_bekreftet, hasRounds2, hcp2);
  const isUnconfirmedWalkover = kamp.er_walkover && !kamp.er_bekreftet;
  const hasPoints =
    kamp.er_bekreftet || kamp.er_walkover || hasRounds1 || hasRounds2 || s1Raw > 0 || s2Raw > 0;
  return {
    s1: isUnconfirmedWalkover ? 21 : s1Raw,
    s2: isUnconfirmedWalkover ? 0 : s2Raw,
    hasPoints,
  };
}

/** Per-match view state shared by the desktop and mobile row renderers. */
function calcMatchRowState(
  kamp: InitialMatchRow,
  startNumberMap: Record<number, number>,
  hcpMap: Record<number, number>,
  positionMap: Record<number, number>,
) {
  const [side1, side2] = getMatchSides(kamp.spelarar, startNumberMap, positionMap);
  const p1 = side1?.rep ?? null;
  const p2 = side2?.rep ?? null;
  const p2IsBye = kamp.er_walkover && !p2?.kaster;

  const hasRounds1 = sideHasRounds(side1);
  const hasRounds2 = sideHasRounds(side2);
  const hasRounds = hasRounds1 || hasRounds2;
  const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0;
  const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0;

  const { s1, s2, hasPoints } = calcRowScores(
    kamp,
    side1,
    side2,
    hasRounds1,
    hasRounds2,
    hcp1,
    hcp2,
  );

  return {
    side1,
    side2,
    p1,
    p2,
    p2IsBye,
    hasRounds,
    s1,
    s2,
    hasPoints,
    status: resolveMatchStatus(kamp, hasPoints, hasRounds),
    isLive: hasRounds && !kamp.er_bekreftet,
    // A finished match whose score was typed in has no omgangar to look at, so
    // its scoreboard would open empty.
    showScoreboard: !(kamp.er_bekreftet && !hasRounds),
  };
}

// ── Rows ──────────────────────────────────────────────────────────────────────

function scoreInnerHtml(s1: number | string, s2: number | string, sep = "–"): string {
  return `<span class="initial-score-inner"><span class="initial-s1">${s1}</span><span class="initial-sep">${sep}</span><span class="initial-s2">${s2}</span></span>`;
}

/** Prefixes the startnummer in parentheses when present. */
function withStartNumber(name: string, nr: number | string): string {
  return nr ? `${name} (${nr})` : name;
}

/** The right-hand action cell for a desktop match row. */
function matchRowButtonTd(kamp: InitialMatchRow, isLive: boolean, showScoreboard: boolean): string {
  return `<td class="pe-2">
        <span class="d-flex align-items-center justify-content-end gap-2">
          ${isLive ? livePillHtml() : ""}
          ${showScoreboard ? scoreboardButtonHtml(kamp.id) : ""}
        </span>
      </td>`;
}

function matchRow(
  kamp: InitialMatchRow,
  startNumberMap: Record<number, number>,
  admin = true,
  hcpMap: Record<number, number> = {},
  positionMap: Record<number, number> = {},
): string {
  const { side1, side2, p1, p2, p2IsBye, s1, s2, hasPoints, status, isLive, showScoreboard } =
    calcMatchRowState(kamp, startNumberMap, hcpMap, positionMap);

  const p1Nr = p1?.kasterid ? (startNumberMap[p1.kasterid] ?? "") : "";
  const p2Nr = p2?.kasterid ? (startNumberMap[p2.kasterid] ?? "") : "";
  const p1Display = withStartNumber(sideNameHtml(side1, false), p1Nr);
  const p2Display = withStartNumber(p2IsBye ? "Walkover" : sideNameHtml(side2, false), p2Nr);

  const canEditScore = admin && !kamp.er_walkover;
  const scoreCss = `text-center initial-score-cell${canEditScore ? " score-editable" : ""}`;
  const scoreAttr = canEditScore ? ` data-endre-score="${kamp.id}"` : "";

  return `
    <tr class="match-row-desktop" data-kamp-id="${kamp.id}" data-status="${status}">
      <td class="text-center">${kamp.bane_nummer ?? ""}</td>
      <td>${p1Display}</td>
      <td class="${scoreCss}"${scoreAttr}>${hasPoints ? scoreInnerHtml(s1, s2) : "—"}</td>
      <td>${p2Display}</td>
      ${matchRowButtonTd(kamp, isLive, showScoreboard)}
    </tr>`;
}

function matchRowMobile(
  kamp: InitialMatchRow,
  startNumberMap: Record<number, number>,
  admin: boolean,
  hcpMap: Record<number, number> = {},
  positionMap: Record<number, number> = {},
): string {
  const { side1, side2, p2IsBye, s1, s2, hasPoints, status, isLive, showScoreboard } =
    calcMatchRowState(kamp, startNumberMap, hcpMap, positionMap);

  const p1NameShort = sideNameHtml(side1, true);
  const p2NameShort = p2IsBye ? "Walkover" : sideNameHtml(side2, true);
  const resultText = hasPoints ? scoreInnerHtml(s1, s2) : scoreInnerHtml("", "", "—");

  const canEditScore = admin && !kamp.er_walkover;
  const resultAttr = canEditScore ? ` id="m-score-${kamp.id}"` : "";
  const resultCss = canEditScore ? " score-editable" : "";
  const roleCss = admin ? "" : " match-row-mobile--viewer";
  // No role/tabindex: Bootstrap gives [role=button] a pointer over the whole
  // row, and the expand panel has nothing in it yet. Both come back with the
  // per-match statistics, on a real toggle control.

  return `
    <li class="match-row-mobile${roleCss}" data-kamp-id="${kamp.id}" data-status="${status}">
      <div class="match-row-mobile__header">
        <span class="match-mobile-lane">${kamp.bane_nummer ?? ""}</span>
        <span class="match-mobile-name"><span class="match-mobile-name__p1">${p1NameShort}</span><span class="match-mobile-name__p2"><span class="match-mobile-vs">vs</span> ${p2NameShort}</span></span>
        <span class="match-mobile-pill-slot">${isLive ? livePillHtml() : ""}</span>
        <span class="match-mobile-result${resultCss}"${resultAttr}>${resultText}</span>
        <span class="match-mobile-sb-slot">${showScoreboard ? scoreboardButtonHtml(kamp.id) : ""}</span>
      </div>
      ${admin ? '<div class="match-mobile-detail"></div>' : ""}
    </li>`;
}
