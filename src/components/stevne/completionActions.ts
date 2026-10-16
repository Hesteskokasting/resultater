import { confirmDialog } from "@/components/dialog/ConfirmDialog";
import {
  completeSncParent,
  reopenSncParent,
  reopenTournament,
  setTournamentCompleted,
} from "@/services/stevneService";

export interface CompletionTarget {
  id: number;
  navn: string;
  erfullfort: boolean;
  /** An umbrella "completes" by consolidating its locals. */
  isSncParent: boolean;
}

export function completionLabel({
  erfullfort,
  isSncParent,
}: Pick<CompletionTarget, "erfullfort" | "isSncParent">): string {
  if (erfullfort) return isSncParent ? "Gjenopne SNC-runden" : "Gjenåpne turnering";
  return isSncParent ? "Konsolider SNC-runden" : "Fullfør turnering";
}

/**
 * Asks, then completes or reopens the stevne. Resolves to null when the user
 * backs out, else to the RPC's outcome.
 */
export async function toggleCompletion(t: CompletionTarget): Promise<{ error: unknown } | null> {
  const ok = await confirmDialog(
    t.erfullfort
      ? {
          title: completionLabel(t),
          message: t.isSncParent
            ? `Gjenopne «${t.navn}»? Den samla lista og NC-poenga blir nullstilte.`
            : `Gjenåpne «${t.navn}»? Kampar og resultat kan då endres igjen.`,
          danger: t.isSncParent,
        }
      : {
          title: completionLabel(t),
          message: t.isSncParent
            ? `Slå saman lokalresultata i «${t.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`
            : `Fullfør «${t.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,
          danger: true,
        },
  );
  if (!ok) return null;
  if (t.erfullfort) return t.isSncParent ? reopenSncParent(t.id) : reopenTournament(t.id);
  return t.isSncParent ? completeSncParent(t.id) : setTournamentCompleted(t.id);
}
