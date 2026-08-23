// ── Start rules for a stevne ──────────────────────────────────────────────────
//
// Pure precondition check — no DOM, no fetching. The Start stevne button asks
// this before anything is written. generateInitialRoundMatches keeps its own
// cascade throw as a last line of defence for callers that skip this.
//
import { cascadeRoundLimitMessage, maxCascadeRounds } from "@/utils/kastemetode";

export interface StartTournamentInput {
  hasInitialMethod: boolean;
  /** No innleiande metode + Kongelag avsluttande — starts straight in avsluttende. */
  isStandaloneKongelag: boolean;
  isTeam: boolean;
  /** Registered players; both members of a pair count. */
  playerCount: number;
  pairCount: number;
  /** Gloppen/NHM generate against stevne.antall_runder_innl. */
  isRoundBased: boolean;
  isCascade: boolean;
  roundCount: number | null;
}

/** Returns why the stevne cannot start, or null when it can. */
export function canStartTournament(input: StartTournamentInput): string | null {
  if (!input.hasInitialMethod && !input.isStandaloneKongelag) {
    return "Du må velje kastemetode for innleiande fase. Gå til Innstillingar for å endre.";
  }
  if (input.isTeam ? input.playerCount < 4 : input.playerCount < 2) {
    return input.isTeam
      ? "Stevnet treng minst 2 par (4 spelarar) for å startast."
      : "Stevnet må ha minst 2 spelarar for å startast.";
  }
  if (input.isRoundBased && !input.roundCount) {
    return "Du må setje antal rundar for innleiande fase. Gå til Innstillingar for å endre.";
  }
  const entryCount = input.isTeam ? input.pairCount : input.playerCount;
  const rounds = input.roundCount ?? 0;
  if (input.isCascade && rounds > maxCascadeRounds(entryCount)) {
    return cascadeRoundLimitMessage(entryCount, rounds, input.isTeam);
  }
  return null;
}
