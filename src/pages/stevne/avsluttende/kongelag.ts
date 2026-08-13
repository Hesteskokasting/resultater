import { createEl } from "@/utils/createEl";
import { showToast } from "@/components/Toast";
import type { OmgangPadHeader } from "@/components/OmgangNumberpad";
import { confirmDialog } from "@/components/ConfirmDialog";
import { updateTournamentPhase } from "@/services/stevneService";
import { getRegistrationCount } from "@/services/pameldingService";
import {
  getKongelagConfig,
  getKongelagCarryOver,
  isInnledendeComplete,
  generateKongelagCourts,
  type CourtRow,
} from "@/services/xkastKongelagService";
import {
  createCourtPhaseRenderer,
  sortedParticipants,
  type CourtPhaseContext,
  type CourtPhaseVariant,
  type EntrySlot,
} from "@/organizer/xkastKongelagView";

/** Omganger per line in the main-row grid and per row in the breakdown. */
const OMGANGER_PER_ROW = 5;

/**
 * Pad header for one Kongelag omgang. There are no runder here, so the strip
 * spans every omgang in the match and the line reads "Omgang x av y".
 */
function padHeader(
  court: CourtRow,
  participant: CourtRow["deltakarar"][number],
  omgang: number,
  antallOmganger: number,
): OmgangPadHeader {
  const omganger = Array.from({ length: antallOmganger }, (_, i) => i + 1);
  return {
    baneLabel: `Bane ${court.bane_nummer ?? "?"}`,
    rundeLabel: `Omgang ${omgang} av ${antallOmganger}`,
    cellLabels: omganger.map(String),
    cellPoeng: omganger.map((o) => participant.omgangar.find((r) => r.omgang === o)?.poeng ?? null),
    cellIndex: omgang - 1,
    totalPoeng: participant.omgangar.reduce((sum, o) => sum + o.poeng, 0),
    totalRinger: participant.omgangar.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0),
    playerKey: `p${participant.id}`,
    rundeKey: `p${participant.id}`,
  };
}

/**
 * Kongelag entry order: one omgang at a time, court by court — the admin
 * enters omgang N for bane 1, the pad switches to bane 2, and so on through
 * the pulje. When every court has omgang N, the pad closes so the omgang's
 * results can be reviewed; the next Registrer starts omgang N+1.
 */
function entryOrder(courts: CourtRow[], antallOmganger: number): EntrySlot[] {
  const orderedCourts = [...courts].sort((a, b) => (a.bane_nummer ?? 0) - (b.bane_nummer ?? 0));
  for (let omgang = 1; omgang <= antallOmganger; omgang++) {
    const slots: EntrySlot[] = [];
    for (const court of orderedCourts) {
      for (const participant of sortedParticipants(court)) {
        if (participant.omgangar.some((o) => o.omgang === omgang)) continue;
        slots.push({
          participant,
          omgang,
          header: padHeader(court, participant, omgang, antallOmganger),
        });
      }
    }
    if (slots.length) return slots;
  }
  return [];
}

// ── Start panel (admin, before courts exist) ──────────────────────────────────

function renderStartPanel(ctx: CourtPhaseContext): HTMLElement | null {
  if (!ctx.isAdmin) return null;

  const panel = createEl("div", null, "text-center py-4");
  panel.appendChild(createEl("p", "Kongelag er ikkje starta enno.", "text-muted"));
  const status = createEl("p", "Sjekkar innleiande fase…", "text-muted fst-italic");
  panel.appendChild(status);
  const startBtn = createEl("button", "Start Kongelag", "btn btn-success") as HTMLButtonElement;
  startBtn.disabled = true;
  panel.appendChild(startBtn);

  // Standalone Kongelag (no innledende metode) draws randomly from enrollment
  // instead of waiting for innledende results.
  if (ctx.config.hasInitialPhase) {
    void isInnledendeComplete(ctx.stevneid).then(({ data: complete }) => {
      if (complete) {
        startBtn.disabled = false;
        status.textContent =
          "Innleiande fase er ferdig — banar blir seeda frå innleiande resultat.";
      } else {
        status.textContent =
          "Alle innleiande kampar/banar må vere bekrefta før Kongelag kan starte.";
      }
    });
  } else {
    void getRegistrationCount(ctx.stevneid).then((count) => {
      if (count > 0) {
        startBtn.disabled = false;
        status.textContent = `${count} spelarar påmelde — startrekkjefølgja blir trekt tilfeldig.`;
      } else {
        status.textContent = "Ingen spelarar er påmelde enno.";
      }
    });
  }

  startBtn.addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: "Start Kongelag",
      message: ctx.config.hasInitialPhase
        ? "Generere Kongelag-banar frå innleiande resultat? Dei beste spelarane hamnar i siste pulje og kastar sist."
        : "Generere Kongelag-banar med tilfeldig trekt startrekkjefølgje?",
    });
    if (!ok) return;
    startBtn.disabled = true;
    startBtn.textContent = "Genererer…";

    if (ctx.config.stevneFase !== "avsluttende") {
      const { error: phaseError } = await updateTournamentPhase(ctx.stevneid, "avsluttende");
      if (phaseError) {
        showToast("Feil ved oppstart av avsluttande fase.", "error");
        startBtn.disabled = false;
        startBtn.textContent = "Start Kongelag";
        return;
      }
    }

    const { error } = await generateKongelagCourts(ctx.stevneid);
    if (error) {
      showToast("Feil ved generering av Kongelag-banar.", "error");
      startBtn.disabled = false;
      startBtn.textContent = "Start Kongelag";
      return;
    }
    showToast("Kongelag-banar genererte.", "success");
    await ctx.reload();
  });

  return panel;
}

// ── Variant ───────────────────────────────────────────────────────────────────

const kongelagVariant: CourtPhaseVariant = {
  fase: "avsluttende",
  channelName: (stevneid) => `kongelag-avsluttende-${stevneid}`,
  loadConfig: getKongelagConfig,
  // No runder in Kongelag — the flat omgang list is chunked five at a time so
  // the breakdown reads as rows of five, matching the grid in the main row.
  detailRows: (antallOmganger) =>
    Array.from({ length: Math.ceil(antallOmganger / OMGANGER_PER_ROW) }, (_, i) => {
      const from = i * OMGANGER_PER_ROW + 1;
      const to = Math.min((i + 1) * OMGANGER_PER_ROW, antallOmganger);
      return {
        label: from === to ? String(from) : `${from}–${to}`,
        omganger: Array.from({ length: to - from + 1 }, (_, j) => from + j),
      };
    }),
  mainScore: "omganger",
  registerScope: "pulje",
  entryOrder,
  padHeader,
  emptyHint: () => "Kongelag er ikkje starta enno.",
  renderNoCourts: renderStartPanel,
  loadCarryOver: getKongelagCarryOver,
};

export const render = createCourtPhaseRenderer(kongelagVariant);
