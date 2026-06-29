// Shared helpers (spelarNamn, lagAsyncKnapp, lagBekreftKnapp, setupScoreboardRealtime)
// serve both renderScoreboard (2-player) and renderScoreboard3 (3-player) — fixes to
// realtime, button behaviour, or DOM utilities apply once. Genuine divergences:
// tegn/tegn3, bereknKnappStatus/bereknKnappStatus3, nesteOmgang/nesteOmgang3,
// and OmgangRad[] vs MatchRoundRow[] state structures.
import type { MatchRoundRow, MatchRow, MatchPlayerInMatch } from '@/services/kampService'
import { calcRingCount, getOmgangThrowerId, getOmgangStarterIndex } from '@/utils/kamp'
import { createEl } from '@/utils/createEl'
import {
  getMatchRounds,
  saveMatchRound,
  updateMatchRound,
  subscribeToScoreboardChanges,
} from '@/services/kampService'
import { avmeldKanal } from '@/utils/realtime'
import { showToast } from './Toast'

export interface ScoreboardOptions {
  pointValues: number[]
  erArrangor?: boolean
  erDeltakar?: boolean
  onBekreft?: ((orderedKasterids?: number[] | null) => Promise<void>) | null
  onKampBekreft?: () => Promise<void>
  omgangEl?: HTMLElement | null
  p3ks?: MatchPlayerInMatch | null
  hcp1?: number
  hcp2?: number
  /** Label overrides — Par/Mix passes "Fornavn E. / Fornavn E." per side. */
  p1Navn?: string | null
  p2Navn?: string | null
  p3Navn?: string | null
  /**
   * All kamp_spelar ids per side, ordered by posisjon (rep first). Par/Mix
   * members alternate omgangar: posisjon 1 throws odd, posisjon 2 even.
   * Defaults to the rep's id only (Singel).
   */
  p1Ids?: number[] | null
  p2Ids?: number[] | null
  p3Ids?: number[] | null
}

type OmgangRad = { omgang: number; s1: number; s2: number; r1: number; r2: number }

export async function renderScoreboard(
  container: HTMLElement,
  kamp: MatchRow,
  p1ks: MatchPlayerInMatch | null,
  p2ks: MatchPlayerInMatch | null,
  options: ScoreboardOptions,
): Promise<() => void> {
  const {
    pointValues,
    erArrangor = false,
    erDeltakar = false,
    onBekreft = null,
    onKampBekreft,
    omgangEl = null,
    p3ks = null,
    hcp1 = 0,
    hcp2 = 0,
    p1Navn = null,
    p2Navn = null,
    p3Navn = null,
  } = options

  if (p3ks && kamp.er_tre_spelarar) {
    return renderScoreboard3(container, kamp, p1ks, p2ks, p3ks, {
      pointValues, erArrangor, erDeltakar, onBekreft, onKampBekreft, omgangEl,
      p1Navn, p2Navn, p3Navn,
      p1Ids: options.p1Ids, p2Ids: options.p2Ids, p3Ids: options.p3Ids,
    })
  }

  // Side member ids ordered by posisjon (rep first); Singel = one id per side
  const side1Ids = options.p1Ids?.length ? options.p1Ids : (p1ks ? [p1ks.id] : [])
  const side2Ids = options.p2Ids?.length ? options.p2Ids : (p2ks ? [p2ks.id] : [])

  let omgangar: OmgangRad[] = []
  let val1: number | null = null
  let val2: number | null = null
  let kampFerdig = kamp.er_bekreftet || kamp.er_walkover
  let isEditMode = false
  let modifiedPlayers = new Set<number>()

  const kanRedigere = erArrangor || (erDeltakar && !kamp.er_bekreftet)

  await lastOmgangar()
  tegn()

  const cleanup = setupScoreboardRealtime(
    kamp,
    [...side1Ids, ...side2Ids],
    async () => { await lastOmgangar(); tegn() },
    onKampBekreft,
  )

  async function lastOmgangar(): Promise<void> {
    const ids = [...side1Ids, ...side2Ids]
    if (!ids.length) return

    const { data } = await getMatchRounds(ids)

    const omgMap: Record<number, OmgangRad> = {}
    for (const r of data) {
      if (r.kamp_spelar_id == null) continue
      const entry = (omgMap[r.omgang] ??= { omgang: r.omgang, s1: 0, s2: 0, r1: 0, r2: 0 })
      if (side1Ids.includes(r.kamp_spelar_id)) {
        entry.s1 = r.score ?? 0
        entry.r1 = r.antall_ringer ?? 0
      } else {
        entry.s2 = r.score ?? 0
        entry.r2 = r.antall_ringer ?? 0
      }
    }
    omgangar = Object.values(omgMap).sort((a, b) => a.omgang - b.omgang)

    const [t1, t2] = beregnEffektiveTotalar()
    kampFerdig = erVinnarKondisjon(t1, t2) || kamp.er_bekreftet || kamp.er_walkover
  }

  function beregnTotalar(): [number, number] {
    return [
      omgangar.reduce((s, o) => s + o.s1, 0),
      omgangar.reduce((s, o) => s + o.s2, 0),
    ]
  }

  function beregnEffektiveTotalar(): [number, number] {
    const [t1, t2] = beregnTotalar()
    return [t1 + hcp1, t2 + hcp2]
  }

  function beregnRingarTotalar(): [number, number] {
    return [
      omgangar.reduce((s, o) => s + o.r1, 0),
      omgangar.reduce((s, o) => s + o.r2, 0),
    ]
  }

  function erVinnarKondisjon(t1: number, t2: number): boolean {
    if (kamp.fase === 'innledende') return t1 >= 21 || t2 >= 21
    return (t1 >= 21 && t1 - t2 >= 2) || (t2 >= 21 && t2 - t1 >= 2)
  }

  function noverAndeOmgang(): number {
    const last = omgangar[omgangar.length - 1]
    return last ? last.omgang + 1 : 1
  }

  function bereknKnappStatus(v1: number | null, v2: number | null): { p1Dis: Set<number>; p2Dis: Set<number> } {
    const p1Dis = new Set<number>()
    const p2Dis = new Set<number>()

    if (v1 !== null) {
      pointValues.forEach(n => { if (n !== v1) p1Dis.add(n) })
      if ([1, 2, 4].includes(v1)) pointValues.forEach(n => p2Dis.add(n))
      else [1, 2, 4].forEach(n => p2Dis.add(n))
    }

    if (v2 !== null) {
      pointValues.forEach(n => { if (n !== v2) p2Dis.add(n) })
      if ([1, 2, 4].includes(v2)) pointValues.forEach(n => p1Dis.add(n))
      else [1, 2, 4].forEach(n => p1Dis.add(n))
    }

    // The selected value must always be clickable so the user can deselect it.
    if (v1 !== null) p1Dis.delete(v1)
    if (v2 !== null) p2Dis.delete(v2)

    return { p1Dis, p2Dis }
  }

  function beregnDisabledSets(): { p1Dis: Set<number>; p2Dis: Set<number> } {
    const { p1Dis, p2Dis } = bereknKnappStatus(val1, val2)
    // Edit mode: a player's saved value stays locked until they actively change it
    if (isEditMode) {
      if (val1 !== null && !modifiedPlayers.has(1)) pointValues.forEach(n => { if (n !== val1) p1Dis.add(n) })
      if (val2 !== null && !modifiedPlayers.has(2)) pointValues.forEach(n => { if (n !== val2) p2Dis.add(n) })
    }
    return { p1Dis, p2Dis }
  }

  function avbrytEditMode(): void {
    isEditMode = false
    modifiedPlayers = new Set()
    val1 = null
    val2 = null
    tegn()
  }

  function startEditMode(): void {
    const last = omgangar[omgangar.length - 1]
    if (!last) return
    val1 = last.s1 || null
    val2 = last.s2 || null
    isEditMode = true
    modifiedPlayers = new Set()
    tegn()
  }

  function lagAngreRad(): HTMLElement {
    const angreRad = createEl('div', null, 'sb-angre-rad')
    const angreBtn = createEl('button', '↩', 'sb-angre-btn')
    if (isEditMode) {
      angreBtn.title = 'Avbryt endring'
      angreBtn.addEventListener('click', avbrytEditMode)
      angreRad.appendChild(angreBtn)
      const avbrytBtn = createEl('button', 'Avbryt endring', 'sb-avbryt-btn')
      avbrytBtn.addEventListener('click', avbrytEditMode)
      angreRad.appendChild(avbrytBtn)
    } else {
      angreBtn.title = 'Endre siste omgang'
      angreBtn.disabled = omgangar.length === 0
      angreBtn.addEventListener('click', startEditMode)
      angreRad.appendChild(angreBtn)
    }
    return angreRad
  }

  function bindPoengKnappar(): void {
    container.querySelectorAll<HTMLButtonElement>('[data-spelar]').forEach(btn => {
      btn.addEventListener('click', () => {
        const spelar = parseInt(btn.dataset.spelar ?? '0')
        const v = parseInt(btn.dataset.val ?? '0')
        if (spelar === 1) {
          val1 = (val1 === v) ? null : v
          modifiedPlayers.add(1)
        } else {
          val2 = (val2 === v) ? null : v
          modifiedPlayers.add(2)
        }
        tegn()
      })
    })
  }

  function kanGaaVidare(): boolean {
    const harVal = val1 !== null || val2 !== null
    if (isEditMode) return modifiedPlayers.size > 0 && harVal
    return kanRedigere && harVal && !kampFerdig
  }

  function kanBekrefteKamp(): boolean {
    return kampFerdig && !isEditMode && !kamp.er_bekreftet && (erArrangor || erDeltakar) && !!onBekreft
  }

  function settOmgangTittel(nr: number, ferdig: boolean): void {
    if (!omgangEl) return
    omgangEl.textContent = kamp.er_bekreftet ? 'Fullført' : (ferdig ? 'Ferdig' : `Omgang ${nr}`)
  }

  function tegn(): void {
    container.innerHTML = ''

    const [t1, t2] = beregnEffektiveTotalar()
    const [r1, r2] = beregnRingarTotalar()
    const { p1Dis, p2Dis } = beregnDisabledSets()
    const kanNeste = kanGaaVidare()
    const kanBekrefte = kanBekrefteKamp()
    const maxRinger = omgangar.length * 2
    const starterIdx = (!kampFerdig && !isEditMode) ? getOmgangStarterIndex(noverAndeOmgang(), 2) : -1

    settOmgangTittel(noverAndeOmgang(), kampFerdig)

    const wrap = createEl('div', null, isEditMode ? 'sb-wrap sb-wrap--edit-mode' : 'sb-wrap')
    wrap.appendChild(lagSpelerPanel(p1Navn ?? spelarNamn(p1ks, 'Spelar 1'), t1, r1, maxRinger, val1, p1Dis, !kanRedigere, 1, p1Navn != null, starterIdx === 0))
    wrap.appendChild(lagSpelerPanel(p2Navn ?? spelarNamn(p2ks, 'Spelar 2'), t2, r2, maxRinger, val2, p2Dis, !kanRedigere, 2, p2Navn != null, starterIdx === 1))
    container.appendChild(wrap)

    if (kanRedigere && !kamp.er_bekreftet) container.appendChild(lagAngreRad())

    if (kanBekrefte) {
      container.appendChild(lagBekreftKnapp(() => onBekreft!()))
    } else if (kanRedigere) {
      const nesteBtn = lagAsyncKnapp(isEditMode ? 'Bekreft endring' : 'Neste omgang', 'sb-neste-btn', nesteOmgang)
      nesteBtn.disabled = !kanNeste
      container.appendChild(nesteBtn)
    }

    bindPoengKnappar()
  }

  function lagSpelerPanel(
    navn: string,
    total: number,
    ringer: number,
    maxRinger: number,
    val: number | null,
    disabledSet: Set<number>,
    lesvisning: boolean,
    spelarNr: number,
    erParNavn = false,
    isStarter = false,
  ): HTMLElement {
    const panel = createEl('div', null, 'sb-spelar-panel')
    let navnClass = erParNavn ? 'sb-spelar-navn sb-spelar-navn--par' : 'sb-spelar-navn'
    if (isStarter) navnClass += ' sb-spelar-navn--starter'
    panel.appendChild(createEl('div', navn, navnClass))
    panel.appendChild(createEl('div', String(total), 'sb-score'))

    const ringerPct = maxRinger > 0 ? Math.round(ringer / maxRinger * 100) : 0
    panel.appendChild(createEl('p', `Ring: ${ringer} av ${maxRinger} ( ${ringerPct}% )`, 'sb-ringer-info'))

    if (!lesvisning) {
      const knappar = createEl('div', null, 'sb-knappar')
      for (const n of pointValues) {
        const btn = createEl('button', String(n), 'sb-poeng-btn')
        btn.dataset.spelar = String(spelarNr)
        btn.dataset.val = String(n)
        if (disabledSet.has(n)) btn.disabled = true
        if (val === n) btn.classList.add('sb-valgt')
        knappar.appendChild(btn)
      }
      panel.appendChild(knappar)
    }
    return panel
  }

  function omgangRows(omgang: number, rad: OmgangRad): { kamp_spelar_id: number; omgang: number; score: number; antall_ringer: number }[] {
    const kaster1 = getOmgangThrowerId(side1Ids, omgang)
    const kaster2 = getOmgangThrowerId(side2Ids, omgang)
    const rows = []
    if (kaster1 != null) rows.push({ kamp_spelar_id: kaster1, omgang, score: rad.s1, antall_ringer: rad.r1 })
    if (kaster2 != null) rows.push({ kamp_spelar_id: kaster2, omgang, score: rad.s2, antall_ringer: rad.r2 })
    return rows
  }

  async function lagreEndraOmgang(rad: OmgangRad): Promise<boolean> {
    const lastOmgang = omgangar[omgangar.length - 1]
    if (!lastOmgang) return false
    const lastNr = lastOmgang.omgang
    const { error } = await updateMatchRound(omgangRows(lastNr, rad))
    if (error) { showToast('Feil ved lagring', 'error'); return false }
    omgangar[omgangar.length - 1] = { ...rad, omgang: lastNr }
    isEditMode = false
    modifiedPlayers = new Set()
    return true
  }

  async function lagreNyOmgang(rad: OmgangRad): Promise<boolean> {
    const nr = noverAndeOmgang()
    const { error } = await saveMatchRound(omgangRows(nr, rad))
    if (error) { showToast('Feil ved lagring', 'error'); return false }
    omgangar.push({ ...rad, omgang: nr })
    const [newT1, newT2] = beregnEffektiveTotalar()
    kampFerdig = erVinnarKondisjon(newT1, newT2)
    return true
  }

  async function nesteOmgang(): Promise<void> {
    const s1 = val1 ?? 0
    const s2 = val2 ?? 0
    const rad: OmgangRad = { omgang: 0, s1, s2, r1: calcRingCount(s1), r2: calcRingCount(s2) }

    const lagra = isEditMode ? await lagreEndraOmgang(rad) : await lagreNyOmgang(rad)
    if (!lagra) return

    val1 = null
    val2 = null
    tegn()
  }

  return cleanup
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function spelarNamn(ks: MatchPlayerInMatch | null, fallback = 'Spelar'): string {
  return ks?.kaster ? `${ks.kaster.fornavn} ${ks.kaster.etternavn}` : fallback
}


function lagAsyncKnapp(
  label: string,
  klasse: string,
  onClick: () => Promise<void>,
): HTMLButtonElement {
  const btn = createEl('button', label, klasse)
  btn.addEventListener('click', async () => {
    btn.disabled = true
    btn.textContent = 'Lagrer…'
    try {
      await onClick()
    } finally {
      btn.disabled = false
      btn.textContent = label
    }
  })
  return btn
}

function lagBekreftKnapp(onBekreft: () => Promise<void>): HTMLButtonElement {
  return lagAsyncKnapp('Bekreft kamp', 'sb-neste-btn sb-neste-btn--bekreft', onBekreft)
}

function setupScoreboardRealtime(
  kamp: MatchRow,
  spelarIds: number[],
  reloadAndDraw: () => Promise<void>,
  onKampBekreft?: () => Promise<void>,
): () => void {
  const kanal = subscribeToScoreboardChanges(
    kamp.id,
    spelarIds,
    reloadAndDraw,
    async () => { kamp.er_bekreftet = true; await reloadAndDraw(); await onKampBekreft?.() },
    reloadAndDraw,
  )
  const onVisible = async () => {
    if (document.visibilityState !== 'visible') return
    await reloadAndDraw()
  }
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    void avmeldKanal(kanal)
    document.removeEventListener('visibilitychange', onVisible)
  }
}

// ── 3-player scoreboard ───────────────────────────────────────────────────────

async function renderScoreboard3(
  container: HTMLElement,
  kamp: MatchRow,
  p1ks: MatchPlayerInMatch | null,
  p2ks: MatchPlayerInMatch | null,
  p3ks: MatchPlayerInMatch,
  options: Pick<ScoreboardOptions, 'pointValues' | 'erArrangor' | 'erDeltakar' | 'onBekreft' | 'onKampBekreft' | 'omgangEl' | 'p1Navn' | 'p2Navn' | 'p3Navn' | 'p1Ids' | 'p2Ids' | 'p3Ids'>,
): Promise<() => void> {
  const { pointValues, erArrangor = false, erDeltakar = false, onBekreft = null, onKampBekreft, omgangEl = null, p1Navn = null, p2Navn = null, p3Navn = null } = options
  const kanRedigere = erArrangor || (erDeltakar && !kamp.er_bekreftet)
  // Sides aligned with spelarar: member kamp_spelar ids in posisjon order (Singel = rep only)
  const labeled: [MatchPlayerInMatch | null, number[] | null | undefined][] = [
    [p1ks, options.p1Ids], [p2ks, options.p2Ids], [p3ks, options.p3Ids],
  ]
  const spelarar = labeled.filter((par): par is [MatchPlayerInMatch, number[] | null | undefined] => par[0] != null).map(par => par[0])
  const sideIds: number[][] = labeled
    .filter((par): par is [MatchPlayerInMatch, number[] | null | undefined] => par[0] != null)
    .map(([ks, ids]) => (ids?.length ? ids : [ks.id]))
  const spelarIds = sideIds.flat()

  function navnFor(ks: MatchPlayerInMatch): { label: string; erPar: boolean } {
    if (p1Navn && ks === p1ks) return { label: p1Navn, erPar: true }
    if (p2Navn && ks === p2ks) return { label: p2Navn, erPar: true }
    if (p3Navn && ks === p3ks) return { label: p3Navn, erPar: true }
    return { label: spelarNamn(ks), erPar: false }
  }

  let omgangData: MatchRoundRow[] = []
  let vinnRekkefolge: number[] = []
  let vals: (number | null)[] = [null, null, null]
  let isEditMode3 = false
  let modifiedPlayers3 = new Set<number>()
  let editModeIdxar: number[] = []

  function radForSide(idx: number, omgang: number): MatchRoundRow | undefined {
    return omgangData.find(o => o.kamp_spelar_id != null && sideIds[idx]?.includes(o.kamp_spelar_id) && o.omgang === omgang)
  }

  function beregnTotal(idx: number): number {
    return omgangData
      .filter(o => o.kamp_spelar_id != null && sideIds[idx]?.includes(o.kamp_spelar_id))
      .reduce((s, o) => s + (o.score ?? 0), 0)
  }

  /** Index of a still-active player who has won (≥21 and ≥2 ahead of the rest), or null. */
  function finnFerdigSpelar(aktive: Set<number>, totalar: number[]): number | null {
    for (const i of aktive) {
      const andreAktive = [...aktive].filter(j => j !== i)
      const minAndre = Math.min(...andreAktive.map(j => totalar[j] ?? 0))
      const total = totalar[i] ?? 0
      if (total >= 21 && total - minAndre >= 2) return i
    }
    return null
  }

  function beregnVinnRekkefolge(): number[] {
    if (!omgangData.length) return []
    const maxOmgang = Math.max(...omgangData.map(o => o.omgang))
    const aktive = new Set([0, 1, 2].filter(i => spelarar[i]))
    const rekkefolge: number[] = []
    const totalar = [0, 0, 0]

    for (let omg = 1; omg <= maxOmgang; omg++) {
      for (const i of aktive) {
        const rad = radForSide(i, omg)
        if (rad) totalar[i] = (totalar[i] ?? 0) + (rad.score ?? 0)
      }
      // Repeat: a finished player leaving can make the next one finished too
      let ferdig = finnFerdigSpelar(aktive, totalar)
      while (ferdig !== null && aktive.size > 1) {
        rekkefolge.push(ferdig)
        aktive.delete(ferdig)
        ferdig = finnFerdigSpelar(aktive, totalar)
      }
    }
    if (aktive.size === 1 && rekkefolge.length === 2) rekkefolge.push(...aktive)
    return rekkefolge
  }

  async function lastOmgangar3(): Promise<void> {
    if (!spelarIds.length) return
    const { data } = await getMatchRounds(spelarIds)
    omgangData = data
    vinnRekkefolge = beregnVinnRekkefolge()
  }

  await lastOmgangar3()

  const cleanup = setupScoreboardRealtime(
    kamp,
    spelarIds,
    async () => { await lastOmgangar3(); tegn3() },
    onKampBekreft,
  )

  function bereknKnappStatus3(aktiveIdxar: number[], effectiveVals: (number | null)[]): Set<number>[] {
    const disabledSets = spelarar.map(() => new Set<number>())
    const selectedIdxar = aktiveIdxar.filter(i => effectiveVals[i] !== null)
    if (!selectedIdxar.length) return disabledSets

    const harNonRing = selectedIdxar.some(i => [1, 2, 4].includes(effectiveVals[i] as number))
    const harRing = selectedIdxar.some(i => [3, 6].includes(effectiveVals[i] as number))

    for (const i of aktiveIdxar) {
      const disabled = disabledSets[i]
      if (!disabled) continue
      if (effectiveVals[i] !== null) {
        pointValues.forEach(n => { if (n !== effectiveVals[i]) disabled.add(n) })
      } else if (harNonRing) {
        pointValues.forEach(n => disabled.add(n))
      } else if (harRing) {
        ;[1, 2, 4].forEach(n => disabled.add(n))
      }
    }
    return disabledSets
  }

  function beregnDisabledSets3(editIdxar: number[]): Set<number>[] {
    const disabledSets = bereknKnappStatus3(editIdxar, vals)
    // Edit mode: a player's saved value stays locked until they actively change it
    if (isEditMode3) {
      editIdxar.forEach(i => {
        if (vals[i] !== null && !modifiedPlayers3.has(i)) pointValues.forEach(n => { if (n !== vals[i]) disabledSets[i]?.add(n) })
      })
    }
    return disabledSets
  }

  function avbrytEditMode3(): void {
    isEditMode3 = false
    modifiedPlayers3 = new Set()
    editModeIdxar = []
    vals = [null, null, null]
    tegn3()
  }

  function startEditMode3(): void {
    const lastNr = Math.max(...omgangData.map(o => o.omgang))
    editModeIdxar = []
    spelarar.forEach((_, i) => {
      const row = radForSide(i, lastNr)
      if (row !== undefined) {
        vals[i] = row.score || null
        editModeIdxar.push(i)
      }
    })
    isEditMode3 = true
    modifiedPlayers3 = new Set()
    tegn3()
  }

  function lagAngreRad3(): HTMLElement {
    const angreRad = createEl('div', null, 'sb-angre-rad')
    const angreBtn = createEl('button', '↩', 'sb-angre-btn')
    if (isEditMode3) {
      angreBtn.title = 'Avbryt endring'
      angreBtn.addEventListener('click', avbrytEditMode3)
      angreRad.appendChild(angreBtn)
      const avbrytBtn = createEl('button', 'Avbryt endring', 'sb-avbryt-btn')
      avbrytBtn.addEventListener('click', avbrytEditMode3)
      angreRad.appendChild(avbrytBtn)
    } else {
      angreBtn.title = 'Endre siste omgang'
      angreBtn.disabled = omgangData.length === 0
      angreBtn.addEventListener('click', startEditMode3)
      angreRad.appendChild(angreBtn)
    }
    return angreRad
  }

  function lagPoengKnappar3(i: number, disabledSet: Set<number> | undefined): HTMLElement {
    const knappar = createEl('div', null, 'sb-knappar')
    for (const n of pointValues) {
      const btn = createEl('button', String(n), 'sb-poeng-btn')
      btn.dataset.spelar = String(i)
      btn.dataset.val = String(n)
      if (vals[i] === n) btn.classList.add('sb-valgt')
      if (disabledSet?.has(n)) btn.disabled = true
      knappar.appendChild(btn)
    }
    return knappar
  }

  function lagSpelerPanel3(
    ks: (typeof spelarar)[number],
    i: number,
    total: number,
    editIdxar: number[],
    disabledSets: Set<number>[],
    isStarter = false,
  ): HTMLElement {
    const visVunne = vinnRekkefolge.includes(i) && !isEditMode3
    const plass = visVunne ? vinnRekkefolge.indexOf(i) + 1 : null
    const panel = createEl('div', null, `sb-spelar-panel${visVunne ? ' sb-spelar-panel--vann' : ''}`)
    const navn = navnFor(ks)
    let navnClass3 = navn.erPar ? 'sb-spelar-navn sb-spelar-navn--par' : 'sb-spelar-navn'
    if (isStarter) navnClass3 += ' sb-spelar-navn--starter'
    panel.appendChild(createEl('div', navn.label, navnClass3))
    panel.appendChild(createEl('div', String(total), 'sb-score'))

    if (plass) panel.appendChild(createEl('div', `${plass}. plass`, 'sb-plass-badge'))

    if (editIdxar.includes(i) && kanRedigere && !kamp.er_bekreftet) {
      panel.appendChild(lagPoengKnappar3(i, disabledSets[i]))
    }
    return panel
  }

  function bindPoengKnappar3(): void {
    container.querySelectorAll<HTMLButtonElement>('[data-spelar]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.spelar ?? '0')
        const v = parseInt(btn.dataset.val ?? '0')
        vals[idx] = (vals[idx] === v) ? null : v
        modifiedPlayers3.add(idx)
        tegn3()
      })
    })
  }

  function kanGaaVidare3(editIdxar: number[], aktiveIdxar: number[]): boolean {
    if (isEditMode3) return modifiedPlayers3.size > 0 && editIdxar.some(i => vals[i] !== null)
    return aktiveIdxar.some(i => vals[i] !== null)
  }

  function settOmgangTittel3(erFerdig: boolean): void {
    if (!omgangEl) return
    const maxOmgang = omgangData.length ? Math.max(...omgangData.map(o => o.omgang)) : 0
    omgangEl.textContent = kamp.er_bekreftet ? 'Fullført' : (erFerdig ? 'Ferdig' : `Omgang ${maxOmgang + 1}`)
  }

  function lagStatusFooter3(erFerdig: boolean): HTMLElement | null {
    if (erFerdig && !isEditMode3 && !kamp.er_bekreftet && onBekreft && kanRedigere) {
      return lagBekreftKnapp(() => onBekreft(vinnRekkefolge.map(i => spelarar[i]!.kasterid)))
    }
    if (kamp.er_bekreftet) return createEl('div', 'Kamp fullført', 'alert alert-success mt-2')
    return null
  }

  function tegn3(): void {
    container.innerHTML = ''
    const totalar = spelarar.map((_, i) => beregnTotal(i))
    const aktiveIdxar = [0, 1, 2].filter(i => spelarar[i] && !vinnRekkefolge.includes(i))
    const editIdxar = isEditMode3 ? editModeIdxar : aktiveIdxar
    const erFerdig = vinnRekkefolge.length === spelarar.length
    const disabledSets = beregnDisabledSets3(editIdxar)
    const currentOmgang3 = omgangData.length ? Math.max(...omgangData.map(o => o.omgang)) + 1 : 1
    const starterIdx3 = (!erFerdig && !isEditMode3) ? getOmgangStarterIndex(currentOmgang3, 3) : -1

    settOmgangTittel3(erFerdig)

    const wrap = createEl('div', null, isEditMode3 ? 'sb-wrap sb-wrap--3p sb-wrap--edit-mode' : 'sb-wrap sb-wrap--3p')
    spelarar.forEach((ks, i) => {
      const isStarter3 = i === starterIdx3 && aktiveIdxar.includes(i)
      wrap.appendChild(lagSpelerPanel3(ks, i, totalar[i] ?? 0, editIdxar, disabledSets, isStarter3))
    })
    container.appendChild(wrap)

    if (kanRedigere && !kamp.er_bekreftet) {
      container.appendChild(lagAngreRad3())

      if (isEditMode3 || !erFerdig) {
        const nesteBtn = lagAsyncKnapp(isEditMode3 ? 'Bekreft endring' : 'Neste omgang', 'sb-neste-btn', nesteOmgang3)
        nesteBtn.disabled = !kanGaaVidare3(editIdxar, aktiveIdxar)
        container.appendChild(nesteBtn)
      }
    }

    const footer = lagStatusFooter3(erFerdig)
    if (footer) container.appendChild(footer)

    bindPoengKnappar3()
  }

  async function nesteOmgang3(): Promise<void> {
    const aktiveIdxar = [0, 1, 2].filter(i => spelarar[i] && !vinnRekkefolge.includes(i))

    if (isEditMode3) {
      const lastNr = Math.max(...omgangData.map(o => o.omgang))
      const rows = editModeIdxar.map(i => {
        const v = vals[i] ?? 0
        return { kamp_spelar_id: getOmgangThrowerId(sideIds[i] ?? [], lastNr)!, omgang: lastNr, score: v, antall_ringer: calcRingCount(v) }
      })
      const { error } = await updateMatchRound(rows)
      if (error) { showToast('Feil ved lagring', 'error'); return }
      isEditMode3 = false
      modifiedPlayers3 = new Set()
      editModeIdxar = []
    } else {
      const nr = omgangData.length ? Math.max(...omgangData.map(o => o.omgang)) + 1 : 1
      const inserts = aktiveIdxar.map(i => {
        const v = vals[i] ?? 0
        return { kamp_spelar_id: getOmgangThrowerId(sideIds[i] ?? [], nr)!, omgang: nr, score: v, antall_ringer: calcRingCount(v) }
      })
      const { error } = await saveMatchRound(inserts)
      if (error) { showToast('Feil ved lagring', 'error'); return }
      await lastOmgangar3()
    }

    vals = [null, null, null]
    tegn3()
  }

  tegn3()

  return cleanup
}
