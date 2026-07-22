import { createEl } from '@/utils/createEl'
import { throwerName } from '@/utils/kaster'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import { updateTournamentPhase } from '@/services/stevneService'
import {
  getKongelagConfig,
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
 * Kongelag entry order: court-by-court within an omgang — the admin enters
 * omgang N for bane 1, the pad switches to bane 2, and so on through the
 * pulje, then omgang N+1 starts over at bane 1.
 */
function entryOrder(courts: CourtRow[], antallOmganger: number): EntrySlot[] {
  const orderedCourts = [...courts].sort((a, b) => (a.bane_nummer ?? 0) - (b.bane_nummer ?? 0))
  const slots: EntrySlot[] = []
  for (let omgang = 1; omgang <= antallOmganger; omgang++) {
    for (const court of orderedCourts) {
      for (const participant of sortedParticipants(court)) {
        slots.push({
          participant,
          omgang,
          label: `Bane ${court.bane_nummer ?? '?'} · ${throwerName(participant.kaster)}`,
        })
      }
    }
  }
  return slots
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

  void isInnledendeComplete(ctx.stevneid).then(({ data: complete }) => {
    if (complete) {
      startBtn.disabled = false
      status.textContent = 'Innleiande fase er ferdig — banar blir seeda frå innleiande resultat.'
    } else {
      status.textContent = 'Alle innleiande kampar/banar må vere bekrefta før Kongelag kan starte.'
    }
  })

  startBtn.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Start Kongelag',
      message: 'Generere Kongelag-banar frå innleiande resultat? Dei beste spelarane hamnar i pulje 1.',
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
  emptyHint: () => 'Kongelag er ikkje starta enno.',
  renderNoCourts: renderStartPanel,
}

export const render = createCourtPhaseRenderer(kongelagVariant)
