import type { MatchPlayerInMatch, MatchRow } from "@/services/kampService";
import { playerName, sideIdsOf } from "@/components/scoreboard/scoreboardData";
import { renderTwoPlayerScoreboard } from "@/components/scoreboard/TwoPlayerScoreboard";
import { renderThreePlayerScoreboard } from "@/components/scoreboard/ThreePlayerScoreboard";

/**
 * Entry point for the live scoreboard: resolves the sides once — member ids,
 * label, handicap — and hands them to the board the kamp calls for. The two
 * boards are separate on purpose, see ThreePlayerScoreboard.
 */

export interface ScoreboardOptions {
  pointValues: number[];
  erArrangor?: boolean;
  erDeltakar?: boolean;
  onBekreft?: ((orderedKasterids?: number[] | null) => Promise<void>) | null;
  onKampBekreft?: () => Promise<void>;
  omgangEl?: HTMLElement | null;
  p3ks?: MatchPlayerInMatch | null;
  hcp1?: number;
  hcp2?: number;
  /** Label overrides — Par/Mix passes "Fornavn E. / Fornavn E." per side. */
  p1Navn?: string | null;
  p2Navn?: string | null;
  p3Navn?: string | null;
  /**
   * All kamp_spelar ids per side, ordered by posisjon (rep first). Par/Mix
   * members alternate omgangar: posisjon 1 throws odd, posisjon 2 even.
   * Defaults to the rep's id only (Singel).
   */
  p1Ids?: number[] | null;
  p2Ids?: number[] | null;
  p3Ids?: number[] | null;
}

/** One side of the kamp, already resolved — the boards never look at options. */
export interface ScoreboardSide {
  ks: MatchPlayerInMatch | null;
  /** kamp_spelar ids in posisjon order. */
  ids: number[];
  label: string;
  /** True when the label holds two names (Par/Mix). */
  isPairLabel: boolean;
  hcp: number;
}

/** What both boards need beyond the sides themselves. */
export interface BoardConfig {
  pointValues: number[];
  canEdit: boolean;
  onBekreft: ((orderedKasterids?: number[] | null) => Promise<void>) | null;
  onKampBekreft?: (() => Promise<void>) | undefined;
  omgangEl: HTMLElement | null;
}

function buildSide(
  ks: MatchPlayerInMatch | null,
  ids: number[] | null | undefined,
  label: string | null | undefined,
  fallback: string,
  hcp = 0,
): ScoreboardSide {
  return {
    ks,
    ids: sideIdsOf(ks, ids),
    label: label ?? playerName(ks, fallback),
    isPairLabel: label != null,
    hcp,
  };
}

export async function renderScoreboard(
  container: HTMLElement,
  kamp: MatchRow,
  p1ks: MatchPlayerInMatch | null,
  p2ks: MatchPlayerInMatch | null,
  options: ScoreboardOptions,
): Promise<() => void> {
  const { erArrangor = false, erDeltakar = false, p3ks = null } = options;

  const config: BoardConfig = {
    pointValues: options.pointValues,
    canEdit: erArrangor || (erDeltakar && !kamp.er_bekreftet),
    onBekreft: options.onBekreft ?? null,
    onKampBekreft: options.onKampBekreft,
    omgangEl: options.omgangEl ?? null,
  };

  const side1 = buildSide(p1ks, options.p1Ids, options.p1Navn, "Spelar 1", options.hcp1 ?? 0);
  const side2 = buildSide(p2ks, options.p2Ids, options.p2Navn, "Spelar 2", options.hcp2 ?? 0);

  if (p3ks && kamp.er_tre_spelarar) {
    const side3 = buildSide(p3ks, options.p3Ids, options.p3Navn, "Spelar 3");
    const sides = [side1, side2, side3].filter((side) => side.ks != null);
    return renderThreePlayerScoreboard(container, kamp, sides, config);
  }

  return renderTwoPlayerScoreboard(container, kamp, [side1, side2], config);
}
