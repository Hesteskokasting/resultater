import { validRound1Setups } from '@/utils/kastemetoder-logikk'
import {
  renderGruppefordeling,
  renderGruppePreview,
  renderGruppePanelInnhald,
  renderStrukturListeHtml,
} from '@/organizer/gruppefordelingUi'
import { generateFinaleAndBronzeFinal } from '@/services/kampGenereringCupService'
import { opnGenererRundeDialog } from './_avslCupGenererRundeDialog'
import { opnTreSpelarBekreftDialog } from './_avslCupTreSpelarDialog'
import { showNumberpad } from '@/components/ScoreNumberpad'
import { scoreForPlayer, getAllMatchSides, type MatchSide } from '@/utils/kamp'
import { livePillHtml } from '@/components/LivePill'
import { canConfirmMatch, sideNameHtml, type StandingRow } from '@/organizer/org-shared'
import { showScoreEditor } from '@/organizer/scoreEditor'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import type { RoundSetup } from '@/types'
import {
  areAllSemifinalsConfirmed,
  confirmCupMatch,
  updateWinnerLoser,
  updateMatchPlayerScoreFast,
  deleteMatchRounds,
  getMatchPlayers,
  setMatchPlayerPlacements,
  type FinalMatchRow,
  type FinalMatchPlayerRow,
} from '@/services/kampService'
import {
  updateTournamentPhase,
  setRound1Format,
} from '@/services/stevneService'
import {
  setGroupAssignment,
  clearGroupAssignment,
} from '@/services/resultatService'
import {
  createFinalPhaseRenderer,
  toOrgPlayer,
  type FinalPhaseVariant,
} from './avsluttendeBase'

// ── Side helpers (Par/Mix: one side = a pair, grouped by startnummer) ─────────

type AvslSpelarKjent = FinalMatchPlayerRow & { kasterid: number }

function kampSider(
  kamp: FinalMatchRow,
  startnrMap: Record<number, number>,
  posisjonMap: Record<number, number>,
): MatchSide<AvslSpelarKjent>[] {
  const rows = kamp.spelarar.filter((s): s is AvslSpelarKjent => s.kasterid != null)
  return getAllMatchSides(rows, startnrMap, posisjonMap)
}

function sideSum(side: MatchSide<AvslSpelarKjent> | null): number {
  return side?.members.reduce((sum, m) => sum + scoreForPlayer(m), 0) ?? 0
}

// ── Cup variant ───────────────────────────────────────────────────────────────

const cupVariant: FinalPhaseVariant = {
  channelName: (stevneid) => `stevne-avsl-cup-${stevneid}`,

  renderMatchesHtml: (ctx) => {
    const { finalMatches, standings, startNumberMap, positionMap, isTeam, isAdmin } = ctx
    const gruppeNamn = [...new Set(
      standings.map(r => r.gruppe?.navn).filter((n): n is string => n != null),
    )].sort()
    const gruppeKolonnar = gruppeNamn.map(g => {
      const kampar = finalMatches.filter(k => k.gruppe_navn === g)
      const stillingG = standings.filter(r => r.gruppe?.navn === g)
      const aktiveCount = stillingG.filter(r => r.runde_eliminert == null).length
      const totalCount = stillingG.length
      const sisteRundeNr = kampar.length ? Math.max(...kampar.map(k => k.runde_nummer)) : 0
      const sisteRunde = kampar.filter(k => k.runde_nummer === sisteRundeNr)
      const sisteRundeFullfort = sisteRunde.length > 0 && sisteRunde.every(k => k.er_bekreftet || k.er_walkover)
      const harSemifinaleIGruppe = kampar.some(k => k.runde_navn === 'Semifinale')
      const visGenerer = isAdmin && (kampar.length === 0 || sisteRundeFullfort) && aktiveCount > 1 && !harSemifinaleIGruppe
      return renderGruppeKolonne(g, kampar, aktiveCount, totalCount, sisteRundeNr, visGenerer, startNumberMap, positionMap, isTeam ? 'par' : 'spelarar', isAdmin)
    }).join('')

    return `<div class="d-flex gap-3 flex-wrap">${gruppeKolonnar}</div>`
  },

  bindMatchEvents: (container, ctx) => {
    if (!ctx.isAdmin && ctx.finalMatches.length === 0) return
    bindKampEvents(container, ctx.stevneid, ctx.finalMatches, ctx.isAdmin, ctx.reload, ctx.startNumberMap, ctx.positionMap)
  },

  renderSetupHtml: (ctx) => {
    const { stevne, isAdmin, round1Format, unitCount, standings } = ctx
    const initNa = round1Format?.nA ?? null

    if (stevne.stevne_fase === 'avsluttende') {
      if (!isAdmin) return '<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>'
      return renderGruppefordeling(standings, { showPlayerList: true, initNa, initFormat: round1Format })
    }

    if (!isAdmin) return ''

    if (unitCount < 2) {
      const melding = stevne.kategori?.erlagbasert
        ? 'Minst 2 par må vere oppretta før gruppefordelinga kan setjast.'
        : 'Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.'
      return `<p class="text-muted fst-italic">${melding}</p>`
    }

    const hasPlayers = standings.length > 0
    return renderGruppefordeling(
      hasPlayers ? standings : unitCount,
      { showPlayerList: hasPlayers, initNa, initFormat: round1Format },
    )
  },

  bindHeaderEvents: (bannerSlot, ctx) => {
    const { container, stevneid, stevne, standings, results, round1Format, allInitialConfirmed, hasGroupAssignment, groupNameMap, reload } = ctx

    bannerSlot?.querySelector('#start-avsl-btn')?.addEventListener('click', async () => {
      if (!allInitialConfirmed) return
      const { error } = await updateTournamentPhase(stevneid, 'avsluttende')
      if (error) { showToast('Feil ved oppstart av avsluttande fase', 'error'); return }

      if (round1Format?.nA != null) {
        const nA = round1Format.nA
        const gruppeAId = groupNameMap['A'] ?? null
        const gruppeBId = groupNameMap['B'] ?? null
        const updates = buildGruppeUpdates(standings, results, nA, gruppeAId, gruppeBId)
        const { error: grErr } = await setGroupAssignment(stevneid, updates)
        if (grErr) { showToast('Feil ved lagring av gruppefordeling', 'error'); return }
      }

      await reload()
    })

    if (!hasGroupAssignment) {
      const n = parseInt(container.querySelector<HTMLElement>('#gruppe-val-wrapper')?.dataset.n ?? '0') || standings.length

      function lesValtOppsett(radioName: string, nGruppe: number): RoundSetup | null {
        const valtRadio = container.querySelector<HTMLInputElement>(`input[name="${radioName}"]:checked`)
        if (valtRadio?.dataset.oppsett) {
          try { return JSON.parse(valtRadio.dataset.oppsett) as RoundSetup } catch { /* fall through */ }
        }
        return validRound1Setups(nGruppe)[0] ?? null
      }

      function oppdaterGruppePreview(nA: number, oppsettA: RoundSetup | null, oppsettB: RoundSetup | null): void {
        const prevEl = container.querySelector('#gruppe-preview')
        if (!prevEl) return
        prevEl.innerHTML = renderGruppePreview(
          standings.map((r, i) => ({ ...r, cupPlassering: i + 1 })),
          nA, oppsettA?.walkovers ?? 0, oppsettB?.walkovers ?? 0,
        )
      }

      const panelerEl = container.querySelector<HTMLElement>('#gruppe-paneler')
      if (panelerEl) {
        panelerEl.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement
          if (!target.matches('input[name^="runde1-format"]')) return
          const nA = parseInt(container.querySelector<HTMLInputElement>('input[name="gruppe-split"]:checked')?.value ?? String(n))
          const nB = n - nA
          const oppsettA = lesValtOppsett('runde1-format-a', nA)
          const oppsettB = lesValtOppsett('runde1-format-b', nB)
          if (target.name === 'runde1-format-a') {
            const strEl = container.querySelector('#struktur-a')
            if (strEl) strEl.outerHTML = renderStrukturListeHtml(nA, oppsettA, 'a')
          } else {
            const strEl = container.querySelector('#struktur-b')
            if (strEl) strEl.outerHTML = renderStrukturListeHtml(nB, oppsettB, 'b')
          }
          oppdaterGruppePreview(nA, oppsettA, oppsettB)
        })
      }

      container.querySelectorAll<HTMLInputElement>('input[name="gruppe-split"]').forEach(radio => {
        radio.addEventListener('change', () => {
          const nA = parseInt(radio.value)
          const nB = n - nA
          const oppsettA = validRound1Setups(nA)[0] ?? null
          const oppsettB = nB >= 2 ? (validRound1Setups(nB)[0] ?? null) : null
          if (panelerEl) {
            panelerEl.innerHTML =
              `<div id="gruppe-panel-a" class="avsl-gruppe-kol">
                ${renderGruppePanelInnhald('Gruppe A', nA, 'runde1-format-a', oppsettA)}
              </div>` +
              (nB >= 2 ? `<div id="gruppe-panel-b" class="avsl-gruppe-kol">
                ${renderGruppePanelInnhald('Gruppe B', nB, 'runde1-format-b', oppsettB)}
              </div>` : '')
          }
          oppdaterGruppePreview(nA, oppsettA, oppsettB)
        })
      })

      container.querySelector('#bekreft-gruppe-btn')?.addEventListener('click', async () => {
        const valt = container.querySelector<HTMLInputElement>('input[name="gruppe-split"]:checked')
        if (!valt) return
        const nA = parseInt(valt.value)
        const nB = n - nA
        const oppsettA = lesValtOppsett('runde1-format-a', nA)
        const oppsettB = nB >= 2 ? lesValtOppsett('runde1-format-b', nB) : null
        const { error: fmtErr } = await setRound1Format(stevneid, { A: oppsettA, B: oppsettB, nA })
        if (fmtErr) { showToast('Feil ved lagring av format', 'error'); return }

        if (stevne.stevne_fase === 'avsluttende') {
          const gruppeAId = groupNameMap['A'] ?? null
          const gruppeBId = groupNameMap['B'] ?? null
          const updates = buildGruppeUpdates(standings, results, nA, gruppeAId, gruppeBId)
          const { error } = await setGroupAssignment(stevneid, updates)
          if (error) { showToast('Feil ved lagring av gruppefordeling', 'error'); return }
        }

        showToast('Gruppefordeling lagra', 'success')
        await reload()
      })
    }

    bannerSlot?.querySelector('#endre-gruppeinndeling-btn')?.addEventListener('click', async () => {
      if (!await confirmDialog({ title: 'Tilbakestill gruppeinndeling', message: 'Gruppefordeling og format vert fjerna.', danger: true })) return
      await Promise.all([
        clearGroupAssignment(stevneid),
        setRound1Format(stevneid, null),
      ])
      await reload()
    })

    if (hasGroupAssignment) {
      container.querySelectorAll<HTMLElement>('[data-generer-gruppe]').forEach(btn => {
        btn.addEventListener('click', () => {
          const gNavn = btn.dataset.genererGruppe ?? ''
          const runde = parseInt(btn.dataset.runde ?? '1')
          const stillingForGruppe = standings.filter(r => r.gruppe?.navn === gNavn)
          opnGenererRundeDialog(stevneid, gNavn, stillingForGruppe, runde, round1Format, reload)
        })
      })
    }
  },
}

export const render = createFinalPhaseRenderer(cupVariant)

// ── Gruppe assignment (Par/Mix: both members of a pair get the gruppe) ────────

function buildGruppeUpdates(
  standings: StandingRow[],
  results: { kasterid: number; startnummer: number | null }[],
  nA: number,
  gruppeAId: number | null,
  gruppeBId: number | null,
): { kasterid: number; gruppeid: number | null }[] {
  return standings.flatMap((r, i) => {
    const gruppeid = i < nA ? gruppeAId : (gruppeBId ?? gruppeAId)
    const members = r.startnummer != null
      ? results.filter(x => x.startnummer === r.startnummer).map(x => x.kasterid)
      : []
    const kasterids = members.length ? members : [r.kasterid]
    return kasterids.map(kasterid => ({ kasterid, gruppeid }))
  })
}

// ── Group column rendering ────────────────────────────────────────────────────

function renderGruppeKolonne(
  gruppeNavn: string,
  kampar: FinalMatchRow[],
  _aktiveCount: number,
  totalCount: number,
  sisteRundeNr: number,
  visGenerer: boolean,
  startnrMap: Record<number, number>,
  posisjonMap: Record<number, number>,
  unitLabel: string,
  isAdminLocal = true,
): string {
  const rundeMap = new Map<number, FinalMatchRow[]>()
  for (const k of kampar) {
    if (!rundeMap.has(k.runde_nummer)) rundeMap.set(k.runde_nummer, [])
    rundeMap.get(k.runde_nummer)!.push(k)
  }

  const rundarHtml = [...rundeMap.entries()].reverse().map(([nr, rKampar]) => {
    const tittel = rKampar[0]?.runde_navn ?? `Runde ${nr}`
    const synligeKampar = rKampar.filter(k => !k.er_walkover)
    if (!synligeKampar.length) return ''
    return `
      <h6 class="fw-bold text-center mb-1">${escHtml(tittel)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${synligeKampar.map(k => renderKampBlock(k, startnrMap, posisjonMap, isAdminLocal)).join('')}
      </div>`
  }).join('')

  const nasteRunde = sisteRundeNr + 1
  const genererKnapp = visGenerer
    ? `<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${escHtml(gruppeNavn)}" data-runde="${nasteRunde}">
         Generer runde ${nasteRunde}
       </button>`
    : ''

  return `
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${escHtml(gruppeNavn)} (${totalCount} ${escHtml(unitLabel)})</h6>
      ${genererKnapp}
      ${rundarHtml}
    </div>`
}

interface KampBlockFlags {
  bekrefta: boolean
  harOmgangar: boolean
  kanEndreScore: boolean
  erTreSpelarar: boolean
}

function sideRadHtml(
  kamp: FinalMatchRow,
  side: MatchSide<AvslSpelarKjent>,
  nSider: number,
  flags: KampBlockFlags,
): string {
  const tot = sideSum(side)
  const score = (tot > 0 || (flags.bekrefta && !flags.erTreSpelarar) || flags.harOmgangar) ? tot : '—'
  const kampPlassering = side.rep.kamp_plassering
  const erEliminert = kamp.er_bekreftet && kampPlassering != null && kampPlassering >= nSider
  const erVidare = kamp.er_bekreftet && kampPlassering != null && kampPlassering < nSider
  const radKlass = erEliminert ? 'kamp-eliminert' : (erVidare ? 'kamp-vidare' : '')
  const scoreCls = `text-center fw-semibold avsl-score-cel${flags.kanEndreScore ? ' score-redigerbar' : ''}`
  const scoreExtra = flags.kanEndreScore ? ` data-endre-score="${kamp.id}"` : ''
  return `<tr${radKlass ? ` class="${radKlass}"` : ''}>
    <td>${sideNameHtml(side, false)}</td>
    <td class="${scoreCls}"${scoreExtra}>${score}</td>
  </tr>`
}

function spelarRaderHtml(kamp: FinalMatchRow, sider: MatchSide<AvslSpelarKjent>[], flags: KampBlockFlags): string {
  if (kamp.er_walkover) {
    return `<tr>
        <td colspan="2">${sideNameHtml(sider[0] ?? null, false)} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`
  }
  return sider.map(side => sideRadHtml(kamp, side, sider.length, flags)).join('')
}

interface BekreftKnappState {
  klass: string
  tekst: string
  disabled: boolean
  ekstraKlass: string
}

function bekreftKnappState(
  kamp: FinalMatchRow,
  sider: MatchSide<AvslSpelarKjent>[],
  harOmgangar: boolean,
  bekrefta: boolean,
): BekreftKnappState {
  // 3-unit matches confirm via the placement dialog, which stays available after confirm
  if (kamp.er_tre_spelarar) {
    return {
      klass: bekrefta ? 'btn-secondary' : 'btn-outline-secondary',
      tekst: bekrefta ? 'Endre plassering' : 'Sett plassering',
      disabled: false,
      ekstraKlass: '',
    }
  }
  const kanBekrefte = canConfirmMatch(kamp, toOrgPlayer(sider.map(s => s.rep)), harOmgangar)
  return {
    klass: bekrefta ? 'btn-secondary' : (kanBekrefte ? 'btn-success' : 'btn-outline-secondary'),
    tekst: bekrefta ? 'Bekreftet' : 'Bekreft',
    disabled: bekrefta || !kanBekrefte,
    ekstraKlass: ' btn-bekreft',
  }
}

function adminRadHtml(kamp: FinalMatchRow, bekrefta: boolean, knapp: BekreftKnappState): string {
  return `<tr>
            <td colspan="2" class="text-end pe-1">
              ${!kamp.er_walkover && !kamp.er_tre_spelarar
                ? `<button class="btn btn-primary btn-sm" id="plus-${kamp.id}"${bekrefta ? ' disabled' : ''}>+</button> `
                : ''}
              ${!bekrefta ? `<button class="btn btn-secondary btn-sm" id="scoreboard-${kamp.id}">Scoreboard</button> ` : ''}
              <button class="btn ${knapp.klass} btn-sm${knapp.ekstraKlass}" id="bekrft-${kamp.id}"${knapp.disabled ? ' disabled' : ''}>${knapp.tekst}</button>
            </td>
          </tr>`
}

function renderKampBlock(
  kamp: FinalMatchRow,
  startnrMap: Record<number, number>,
  posisjonMap: Record<number, number>,
  isAdminLocal = true,
): string {
  const sider = kampSider(kamp, startnrMap, posisjonMap)

  const bekrefta = kamp.er_bekreftet || kamp.er_walkover
  const harOmgangar = kamp.spelarar.some(s => (s.omgangar?.length ?? 0) > 0)
  const flags: KampBlockFlags = {
    bekrefta,
    harOmgangar,
    kanEndreScore: isAdminLocal && kamp.er_bekreftet && !kamp.er_tre_spelarar && !harOmgangar,
    erTreSpelarar: kamp.er_tre_spelarar,
  }

  const adminRad = isAdminLocal
    ? adminRadHtml(kamp, bekrefta, bekreftKnappState(kamp, sider, harOmgangar, bekrefta))
    : ''

  return `
    <div class="avsl-kamp-block">
      <div class="avsl-kamp-header">
        <span class="avsl-kamp-bane">Bane ${kamp.bane_nummer}</span>
        ${harOmgangar && !bekrefta ? livePillHtml() : ''}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${spelarRaderHtml(kamp, sider, flags)}
          ${adminRad}
        </tbody>
      </table>
    </div>`
}

// ── Match event binding ───────────────────────────────────────────────────────

function bindKampEvents(
  container: HTMLElement,
  stevneid: number,
  avslKampar: FinalMatchRow[],
  isAdminLocal: boolean,
  reload: () => Promise<void>,
  startnrMap: Record<number, number>,
  posisjonMap: Record<number, number>,
): void {
  for (const kamp of avslKampar) {
    const sider = kampSider(kamp, startnrMap, posisjonMap)
    const side1 = sider[0] ?? null
    const side2 = sider[1] ?? null
    const p1 = side1?.rep ?? null
    const p2 = side2?.rep ?? null
    const p1Namn = sideNameHtml(side1, false)
    const p2Namn = sideNameHtml(side2, false)
    const spelarIds = sider.flatMap(s => s.members.map(m => m.id))

    // Quick-score writes the side total to the rep; partner rows are zeroed
    // so the side sum is not polluted by stale per-player values.
    const skrivSideScore = async (nyS1: number, nyS2: number): Promise<{ error: unknown } | null> => {
      const updates: Promise<{ error: unknown }>[] = []
      if (p1?.id) updates.push(updateMatchPlayerScoreFast(p1.id, nyS1))
      if (p2?.id) updates.push(updateMatchPlayerScoreFast(p2.id, nyS2))
      for (const side of [side1, side2]) {
        for (const member of side?.members.slice(1) ?? []) {
          updates.push(updateMatchPlayerScoreFast(member.id, 0))
        }
      }
      try {
        const results = await Promise.all(updates)
        return results.find(r => r.error) ?? null
      } catch (e) {
        logError('cup:skrivSideScore', e)
        return { error: e }
      }
    }

    container.querySelector(`#plus-${kamp.id}`)?.addEventListener('click', () => {
      void showScoreEditor({
        side1Name: p1Namn,
        side2Name: p2Namn,
        currentS1: sideSum(side1),
        currentS2: sideSum(side2),
        spelarIds,
        hasOmgangar: kamp.spelarar.some(s => (s.omgangar?.length ?? 0) > 0),
        logPrefix: 'cup',
        onSave: skrivSideScore,
        onSaved: reload,
      })
    })

    container.querySelector(`#scoreboard-${kamp.id}`)?.addEventListener('click', () => {
      window.open(`#/kamp/${kamp.id}`, '_blank')
    })

    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener('click', async (e) => {
      if (kamp.er_tre_spelarar) {
        opnTreSpelarBekreftDialog(kamp, sider, stevneid, async () => { await autoGenererFinaleViss(stevneid, kamp); await reload() })
      } else {
        const btn = e.currentTarget as HTMLButtonElement
        btn.disabled = true
        btn.textContent = 'Lagrer…'
        try {
          const ok = await confirmCupMatch2Sider(stevneid, kamp, sider, reload)
          if (!ok) { btn.disabled = false; btn.textContent = 'Bekreft' }
        } catch {
          btn.disabled = false
          btn.textContent = 'Bekreft'
        }
      }
    })

    if (isAdminLocal && kamp.er_bekreftet && !kamp.er_tre_spelarar) {
      const allKasterids = sider.flatMap(s => s.members.map(m => m.kasterid))
      const handler = (): void => {
        showNumberpad(p1Namn, p2Namn, sideSum(side1), sideSum(side2), async (nyS1, nyS2) => {
          if (spelarIds.length) {
            const { error } = await deleteMatchRounds(spelarIds)
            if (error) { showToast('DB-feil ved sletting av omgangar', 'error'); return }
          }
          const feil = await skrivSideScore(nyS1, nyS2)
          if (feil) { showToast('DB-feil ved oppdatering av score', 'error'); return }
          const nyVinnar = nyS1 >= nyS2 ? side1 : side2
          const nyTapar = nyS1 >= nyS2 ? side2 : side1
          const nyVinnarIds = nyVinnar?.members.map(m => m.kasterid) ?? []
          const nyTaparIds = nyTapar?.members.map(m => m.kasterid) ?? []
          const nyPlaseringar = [
            ...nyVinnarIds.map(kasterid => ({ kasterid, plassering: 1 })),
            ...nyTaparIds.map(kasterid => ({ kasterid, plassering: 2 })),
          ]
          const { error: plErr } = await setMatchPlayerPlacements(kamp.id, nyPlaseringar)
          if (plErr) { showToast('DB-feil ved oppdatering av plassering', 'error'); return }
          await updateWinnerLoser({
            stevneId: stevneid,
            roundNumber: kamp.runde_nummer,
            roundName: kamp.runde_navn,
            allThrowerIds: allKasterids,
            newWinnerIds: nyVinnarIds,
            newLoserIds: nyTaparIds,
          })
          await reload()
        })
      }
      container.querySelectorAll<HTMLElement>(`[data-endre-score="${kamp.id}"]`).forEach(celle => celle.addEventListener('click', handler))
    }
  }
}

// ── Confirm 2-side cup match (Singel: 2 players; Par/Mix: 2 pairs) ────────────

async function confirmCupMatch2Sider(
  stevneid: number,
  kamp: FinalMatchRow,
  sider: MatchSide<AvslSpelarKjent>[],
  reload: () => Promise<void>,
): Promise<boolean> {
  const side1 = sider[0] ?? null
  const side2 = sider[1] ?? null

  // Re-fetch fresh scores — the rendered rows may be stale
  const { data: aktuellSp } = await getMatchPlayers(kamp.id)
  const ferskSideSum = (side: MatchSide<AvslSpelarKjent> | null): number =>
    side?.members.reduce((sum, m) => {
      const fersk = aktuellSp.find(s => s.id === m.id)
      return sum + scoreForPlayer(fersk ?? m)
    }, 0) ?? 0

  const s1 = ferskSideSum(side1)
  const s2 = ferskSideSum(side2)

  if (s1 === 0 && s2 === 0 && !await confirmDialog({ title: 'Ingen score registrert', message: 'Vil du bekrefte kampen likevel?' })) return false

  const vinnar = s1 >= s2 ? side1 : side2
  const tapar = s1 >= s2 ? side2 : side1
  const allKasterids = sider.flatMap(s => s.members.map(m => m.kasterid))

  const { error } = await confirmCupMatch({
    kampId: kamp.id,
    stevneId: stevneid,
    roundNumber: kamp.runde_nummer,
    roundName: kamp.runde_navn,
    allThrowerIds: allKasterids,
    eliminatedIds: tapar?.members.map(m => m.kasterid) ?? [],
    advancingSides: vinnar ? [vinnar.members.map(m => m.kasterid)] : [],
  })
  if (error) { showToast('DB-feil ved bekreft', 'error'); return false }

  await autoGenererFinaleViss(stevneid, kamp)
  await reload()
  return true
}

// ── Auto-generate finale when all semis in group are confirmed ────────────────

async function autoGenererFinaleViss(stevneid: number, kamp: FinalMatchRow): Promise<void> {
  if (kamp.runde_navn !== 'Semifinale' || !kamp.gruppe_navn) return
  if (await areAllSemifinalsConfirmed(stevneid, kamp.gruppe_navn)) {
    await generateFinaleAndBronzeFinal(stevneid, kamp.gruppe_navn)
  }
}
