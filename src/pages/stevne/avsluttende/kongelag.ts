import { createEl } from '@/utils/createEl'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import { updateTournamentPhase } from '@/services/stevneService'
import { getRegistrationCount } from '@/services/pameldingService'
import {
  getKongelagConfig,
  getKongelagCarryOver,
  isInnledendeComplete,
  generateKongelagCourts,
  type CourtRow,
} from '@/services/xkastKongelagService'
import {
  createCourtPhaseRenderer,
  sortedParticipants,
  type CourtPhaseContext,
  type CourtPhaseVariant,
  type EntrySlot,
} from '@/organizer/xkastKongelagView'

/**
 * Kongelag entry order: one omgang at a time, court by court — the admin
 * enters omgang N for bane 1, the pad switches to bane 2, and so on through
 * the pulje. When every court has omgang N, the pad closes so the omgang's
 * results can be reviewed; the next Registrer starts omgang N+1.
 */
function entryOrder(courts: CourtRow[], antallOmganger: number): EntrySlot[] {
  const orderedCourts = [...courts].sort((a, b) => (a.bane_nummer ?? 0) - (b.bane_nummer ?? 0))
  for (let omgang = 1; omgang <= antallOmganger; omgang++) {
    const slots: EntrySlot[] = []
    for (const court of orderedCourts) {
      for (const participant of sortedParticipants(court)) {
        if (participant.omgangar.some(o => o.omgang === omgang)) continue
        slots.push({
          participant,
          omgang,
          contextLabel: `Bane ${court.bane_nummer ?? '?'} · Omgang ${omgang}`,
        })
      }
    }
    if (slots.length) return slots
  }
  return []
}

// ── Start panel (admin, before courts exist) ──────────────────────────────────

function renderStartPanel(ctx: CourtPhaseContext): HTMLElement | null {
  if (!ctx.isAdmin) return null

  const panel = createEl('div', null, 'text-center py-4')
  panel.appendChild(createEl('p', 'Kongelag er ikkje starta enno.', 'text-muted'))
  const status = createEl('p', 'Sjekkar innleiande fase…', 'text-muted fst-italic')
  panel.appendChild(status)
  const startBtn = createEl('button', 'Start Kongelag', 'btn btn-success') as HTMLButtonElement
  startBtn.disabled = true
  panel.appendChild(startBtn)

  // Standalone Kongelag (no innledende metode) draws randomly from enrollment
  // instead of waiting for innledende results.
  if (ctx.config.hasInitialPhase) {
    void isInnledendeComplete(ctx.stevneid).then(({ data: complete }) => {
      if (complete) {
        startBtn.disabled = false
        status.textContent = 'Innleiande fase er ferdig — banar blir seeda frå innleiande resultat.'
      } else {
        status.textContent = 'Alle innleiande kampar/banar må vere bekrefta før Kongelag kan starte.'
      }
    })
  } else {
    void getRegistrationCount(ctx.stevneid).then(count => {
      if (count > 0) {
        startBtn.disabled = false
        status.textContent = `${count} spelarar påmelde — startrekkjefølgja blir trekt tilfeldig.`
      } else {
        status.textContent = 'Ingen spelarar er påmelde enno.'
      }
    })
  }

  startBtn.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Start Kongelag',
      message: ctx.config.hasInitialPhase
        ? 'Generere Kongelag-banar frå innleiande resultat? Dei beste spelarane hamnar i pulje 1.'
        : 'Generere Kongelag-banar med tilfeldig trekt startrekkjefølgje?',
    })
    if (!ok) return
    startBtn.disabled = true
    startBtn.textContent = 'Genererer…'

    if (ctx.config.stevneFase !== 'avsluttende') {
      const { error: phaseError } = await updateTournamentPhase(ctx.stevneid, 'avsluttende')
      if (phaseError) {
        showToast('Feil ved oppstart av avsluttande fase.', 'error')
        startBtn.disabled = false
        startBtn.textContent = 'Start Kongelag'
        return
      }
    }

    const { error } = await generateKongelagCourts(ctx.stevneid)
    if (error) {
      showToast('Feil ved generering av Kongelag-banar.', 'error')
      startBtn.disabled = false
      startBtn.textContent = 'Start Kongelag'
      return
    }
    showToast('Kongelag-banar genererte.', 'success')
    await ctx.reload()
  })

  return panel
}

// ── Variant ───────────────────────────────────────────────────────────────────

const kongelagVariant: CourtPhaseVariant = {
  fase: 'avsluttende',
  channelName: (stevneid) => `kongelag-avsluttende-${stevneid}`,
  loadConfig: getKongelagConfig,
  scoreColumnHeaders: (antallOmganger) =>
    Array.from({ length: antallOmganger }, (_, i) => String(i + 1)),
  scoreCellValues: (participant, antallOmganger) =>
    Array.from({ length: antallOmganger }, (_, i) =>
      participant.omgangar.find(o => o.omgang === i + 1)?.poeng ?? null),
  registerScope: 'pulje',
  entryOrder,
  omgangerForScoreCell: (cellIndex) => [cellIndex + 1],
  emptyHint: () => 'Kongelag er ikkje starta enno.',
  renderNoCourts: renderStartPanel,
  loadCarryOver: getKongelagCarryOver,
}

export const render = createCourtPhaseRenderer(kongelagVariant)
