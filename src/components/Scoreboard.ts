// Shared helpers (lagEl, spelarNamn, lagAsyncKnapp, lagBekreftKnapp, setupScoreboardRealtime)
// serve both renderScoreboard (2-player) and renderScoreboard3 (3-player) — fixes to
// realtime, button behaviour, or DOM utilities apply once. Genuine divergences:
// tegn/tegn3, bereknKnappStatus/bereknKnappStatus3, nesteOmgang/nesteOmgang3,
// and OmgangRad[] vs KampOmgangRow[] state structures.
import type { KampOmgangRow, KampRow, KampSpelarIKamp } from '@/services/kampService'
import { calcAntallRinger } from '@/utils/kamp'
import {
  hentKampOmgangar,
  lagreKampOmgang,
  oppdaterKampOmgang,
  subscribeToScoreboardEndringar,
} from '@/services/kampService'
import { avmeldKanal } from '@/utils/realtime'
import { showToast } from './Toast'

interface ScoreboardOptions {
  pointValues: number[]
  erArrangor?: boolean
  erDeltakar?: boolean
  onBekreft?: ((orderedKasterids?: number[] | null) => Promise<void>) | null
  onKampBekreft?: () => Promise<void>
  omgangEl?: HTMLElement | null
  p3ks?: KampSpelarIKamp | null
  hcp1?: number
  hcp2?: number
  /** Label overrides — Par/Mix passes "Fornavn E. / Fornavn E." per side. */
  p1Navn?: string | null
  p2Navn?: string | null
  p3Navn?: string | null
}

type OmgangRad = { omgang: number; s1: number; s2: number; r1: number; r2: number }

export async function renderScoreboard(
  container: HTMLElement,
  kamp: KampRow,
  p1ks: KampSpelarIKamp | null,
  p2ks: KampSpelarIKamp | null,
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
    return renderScoreboard3(container, kamp, p1ks, p2ks, p3ks, { pointValues, erArrangor, erDeltakar, onBekreft, onKampBekreft, omgangEl, p1Navn, p2Navn, p3Navn })
  }

  let omgangar: OmgangRad[] = []
  let val1: number | null = null
  let val2: number | null = null
  let kampFerdig = kamp.er_bekreftet || kamp.er_walkover
  let isEditMode = false
  let modifiedPlayers = new Set<number>()

  const kanRedigere = erArrangor || (erDeltakar && !kamp.er_bekreftet)

  await lastOmgangar()
  tegn()

  const spelarIds = [p1ks?.id, p2ks?.id].filter((id): id is number => id != null)

  const cleanup = setupScoreboardRealtime(
    kamp,
    spelarIds,
    async () => { await lastOmgangar(); tegn() },
    onKampBekreft,
  )

  async function lastOmgangar(): Promise<void> {
    const ids = [p1ks?.id, p2ks?.id].filter((id): id is number => id != null)
    if (!ids.length) return

    const { data } = await hentKampOmgangar(ids)

    const omgMap: Record<number, OmgangRad> = {}
    for (const r of data) {
      if (!omgMap[r.omgang]) omgMap[r.omgang] = { omgang: r.omgang, s1: 0, s2: 0, r1: 0, r2: 0 }
      if (r.kamp_spelar_id === p1ks?.id) {
        omgMap[r.omgang].s1 = r.score ?? 0
        omgMap[r.omgang].r1 = r.antall_ringer ?? 0
      } else {
        omgMap[r.omgang].s2 = r.score ?? 0
        omgMap[r.omgang].r2 = r.antall_ringer ?? 0
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
    return omgangar.length > 0 ? omgangar[omgangar.length - 1].omgang + 1 : 1
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

  function tegn(): void {
    container.innerHTML = ''

    const [t1, t2] = beregnEffektiveTotalar()
    const [r1, r2] = beregnRingarTotalar()
    const nr = noverAndeOmgang()
    const { p1Dis, p2Dis } = bereknKnappStatus(val1, val2)
    if (isEditMode) {
      if (val1 !== null && !modifiedPlayers.has(1)) pointValues.forEach(n => { if (n !== val1) p1Dis.add(n) })
      if (val2 !== null && !modifiedPlayers.has(2)) pointValues.forEach(n => { if (n !== val2) p2Dis.add(n) })
    }
    const kanNeste = isEditMode
      ? modifiedPlayers.size > 0 && (val1 !== null || val2 !== null)
      : kanRedigere && (val1 !== null || val2 !== null) && !kampFerdig
    const kanBekrefte = kampFerdig && !isEditMode && !kamp.er_bekreftet && (erArrangor || erDeltakar) && !!onBekreft
    const maxRinger = omgangar.length * 2

    if (omgangEl) {
      omgangEl.textContent = kamp.er_bekreftet ? 'Fullført' : (kampFerdig ? 'Ferdig' : `Omgang ${nr}`)
    }

    const wrap = lagEl('div', null, isEditMode ? 'sb-wrap sb-wrap--edit-mode' : 'sb-wrap')
    wrap.appendChild(lagSpelerPanel(p1Navn ?? spelarNamn(p1ks, 'Spelar 1'), t1, r1, maxRinger, val1, p1Dis, !kanRedigere, 1, p1Navn != null))
    wrap.appendChild(lagSpelerPanel(p2Navn ?? spelarNamn(p2ks, 'Spelar 2'), t2, r2, maxRinger, val2, p2Dis, !kanRedigere, 2, p2Navn != null))
    container.appendChild(wrap)

    if (kanRedigere && !kamp.er_bekreftet) {
      const angreRad = lagEl('div', null, 'sb-angre-rad')
      const angreBtn = lagEl('button', '↩', 'sb-angre-btn')
      if (isEditMode) {
        angreBtn.title = 'Avbryt endring'
        angreBtn.addEventListener('click', () => { isEditMode = false; modifiedPlayers = new Set(); val1 = null; val2 = null; tegn() })
        angreRad.appendChild(angreBtn)
        const avbrytBtn = lagEl('button', 'Avbryt endring', 'sb-avbryt-btn')
        avbrytBtn.addEventListener('click', () => { isEditMode = false; modifiedPlayers = new Set(); val1 = null; val2 = null; tegn() })
        angreRad.appendChild(avbrytBtn)
      } else {
        angreBtn.title = 'Endre siste omgang'
        angreBtn.disabled = omgangar.length === 0
        angreBtn.addEventListener('click', () => {
          const last = omgangar[omgangar.length - 1]
          val1 = last.s1 || null
          val2 = last.s2 || null
          isEditMode = true
          modifiedPlayers = new Set()
          tegn()
        })
        angreRad.appendChild(angreBtn)
      }
      container.appendChild(angreRad)
    }

    if (kanBekrefte) {
      container.appendChild(lagBekreftKnapp(() => onBekreft!()))
    } else if (kanRedigere) {
      const nesteLabel = isEditMode ? 'Bekreft endring' : 'Neste omgang'
      const nesteBtn = lagAsyncKnapp(nesteLabel, 'sb-neste-btn', nesteOmgang)
      nesteBtn.disabled = !kanNeste
      container.appendChild(nesteBtn)
    }

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
  ): HTMLElement {
    const panel = lagEl('div', null, 'sb-spelar-panel')
    panel.appendChild(lagEl('div', navn, erParNavn ? 'sb-spelar-navn sb-spelar-navn--par' : 'sb-spelar-navn'))
    panel.appendChild(lagEl('div', String(total), 'sb-score'))

    const ringerPct = maxRinger > 0 ? Math.round(ringer / maxRinger * 100) : 0
    panel.appendChild(lagEl('p', `Ring: ${ringer} av ${maxRinger} ( ${ringerPct}% )`, 'sb-ringer-info'))

    if (!lesvisning) {
      const knappar = lagEl('div', null, 'sb-knappar')
      for (const n of pointValues) {
        const btn = lagEl('button', String(n), 'sb-poeng-btn')
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

  async function nesteOmgang(): Promise<void> {
    const s1 = val1 ?? 0
    const s2 = val2 ?? 0
    const r1 = calcAntallRinger(s1)
    const r2 = calcAntallRinger(s2)

    if (isEditMode) {
      const lastNr = omgangar[omgangar.length - 1].omgang
      const rows = []
      if (p1ks?.id) rows.push({ kamp_spelar_id: p1ks.id, omgang: lastNr, score: s1, antall_ringer: r1 })
      if (p2ks?.id) rows.push({ kamp_spelar_id: p2ks.id, omgang: lastNr, score: s2, antall_ringer: r2 })
      const { error } = await oppdaterKampOmgang(rows)
      if (error) { showToast('Feil ved lagring', 'error'); return }
      omgangar[omgangar.length - 1] = { omgang: lastNr, s1, s2, r1, r2 }
      isEditMode = false
      modifiedPlayers = new Set()
    } else {
      const nr = noverAndeOmgang()
      const inserts = []
      if (p1ks?.id) inserts.push({ kamp_spelar_id: p1ks.id, omgang: nr, score: s1, antall_ringer: r1 })
      if (p2ks?.id) inserts.push({ kamp_spelar_id: p2ks.id, omgang: nr, score: s2, antall_ringer: r2 })
      const { error } = await lagreKampOmgang(inserts)
      if (error) { showToast('Feil ved lagring', 'error'); return }
      omgangar.push({ omgang: nr, s1, s2, r1, r2 })
      const [newT1, newT2] = beregnEffektiveTotalar()
      kampFerdig = erVinnarKondisjon(newT1, newT2)
    }

    val1 = null
    val2 = null
    tegn()
  }

  return cleanup
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function lagEl(tag: string, tekst: string | null, klasse: string): HTMLButtonElement
function lagEl(tag: string, tekst: string | null, klasse?: string): HTMLElement
function lagEl(tag: string, tekst: string | null, klasse?: string): HTMLElement {
  const el = document.createElement(tag)
  if (tekst != null) el.textContent = tekst
  if (klasse) el.className = klasse
  return el
}

function spelarNamn(ks: KampSpelarIKamp | null, fallback = 'Spelar'): string {
  return ks?.kaster ? `${ks.kaster.fornavn} ${ks.kaster.etternavn}` : fallback
}


function lagAsyncKnapp(
  label: string,
  klasse: string,
  onClick: () => Promise<void>,
): HTMLButtonElement {
  const btn = lagEl('button', label, klasse)
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
  kamp: KampRow,
  spelarIds: number[],
  reloadAndDraw: () => Promise<void>,
  onKampBekreft?: () => Promise<void>,
): () => void {
  const kanal = subscribeToScoreboardEndringar(
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
  kamp: KampRow,
  p1ks: KampSpelarIKamp | null,
  p2ks: KampSpelarIKamp | null,
  p3ks: KampSpelarIKamp,
  options: Pick<ScoreboardOptions, 'pointValues' | 'erArrangor' | 'erDeltakar' | 'onBekreft' | 'onKampBekreft' | 'omgangEl' | 'p1Navn' | 'p2Navn' | 'p3Navn'>,
): Promise<() => void> {
  const { pointValues, erArrangor = false, erDeltakar = false, onBekreft = null, onKampBekreft, omgangEl = null, p1Navn = null, p2Navn = null, p3Navn = null } = options
  const kanRedigere = erArrangor || (erDeltakar && !kamp.er_bekreftet)
  const spelarar = [p1ks, p2ks, p3ks].filter((s): s is KampSpelarIKamp => s != null)
  const spelarIds = spelarar.map(s => s.id).filter((id): id is number => id != null)

  function navnFor(ks: KampSpelarIKamp): { label: string; erPar: boolean } {
    if (p1Navn && ks === p1ks) return { label: p1Navn, erPar: true }
    if (p2Navn && ks === p2ks) return { label: p2Navn, erPar: true }
    if (p3Navn && ks === p3ks) return { label: p3Navn, erPar: true }
    return { label: spelarNamn(ks), erPar: false }
  }

  let omgangData: KampOmgangRow[] = []
  let vinnRekkefolge: number[] = []
  let vals: (number | null)[] = [null, null, null]
  let isEditMode3 = false
  let modifiedPlayers3 = new Set<number>()
  let editModeIdxar: number[] = []

  function beregnTotal(idx: number): number {
    return omgangData
      .filter(o => o.kamp_spelar_id === spelarar[idx]?.id)
      .reduce((s, o) => s + (o.score ?? 0), 0)
  }

  function beregnVinnRekkefolge(): number[] {
    if (!omgangData.length) return []
    const maxOmgang = Math.max(...omgangData.map(o => o.omgang))
    const aktive = new Set([0, 1, 2].filter(i => spelarar[i]))
    const rekkefolge: number[] = []
    const totalar = [0, 0, 0]

    for (let omg = 1; omg <= maxOmgang; omg++) {
      for (const i of aktive) {
        const rad = omgangData.find(o => o.kamp_spelar_id === spelarar[i].id && o.omgang === omg)
        if (rad) totalar[i] += rad.score ?? 0
      }
      let nySjekk = true
      while (nySjekk && aktive.size > 1) {
        nySjekk = false
        for (const i of [...aktive]) {
          const andreAktive = [...aktive].filter(j => j !== i)
          const minAndre = Math.min(...andreAktive.map(j => totalar[j]))
          if (totalar[i] >= 21 && totalar[i] - minAndre >= 2) {
            rekkefolge.push(i)
            aktive.delete(i)
            nySjekk = true
            break
          }
        }
      }
    }
    if (aktive.size === 1 && rekkefolge.length === 2) rekkefolge.push([...aktive][0])
    return rekkefolge
  }

  async function lastOmgangar3(): Promise<void> {
    if (!spelarIds.length) return
    const { data } = await hentKampOmgangar(spelarIds)
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
      if (effectiveVals[i] !== null) {
        pointValues.forEach(n => { if (n !== effectiveVals[i]) disabledSets[i].add(n) })
      } else if (harNonRing) {
        pointValues.forEach(n => disabledSets[i].add(n))
      } else if (harRing) {
        ;[1, 2, 4].forEach(n => disabledSets[i].add(n))
      }
    }
    return disabledSets
  }

  function tegn3(): void {
    container.innerHTML = ''
    const totalar = spelarar.map((_, i) => beregnTotal(i))
    const aktiveIdxar = [0, 1, 2].filter(i => spelarar[i] && !vinnRekkefolge.includes(i))
    const editIdxar = isEditMode3 ? editModeIdxar : aktiveIdxar
    const erFerdig = vinnRekkefolge.length === spelarar.length
    const maxOmgang = omgangData.length ? Math.max(...omgangData.map(o => o.omgang)) : 0
    const disabledSets = bereknKnappStatus3(editIdxar, vals)
    if (isEditMode3) {
      editIdxar.forEach(i => {
        if (vals[i] !== null && !modifiedPlayers3.has(i)) pointValues.forEach(n => { if (n !== vals[i]) disabledSets[i].add(n) })
      })
    }

    if (omgangEl) {
      omgangEl.textContent = kamp.er_bekreftet ? 'Fullført' : (erFerdig ? 'Ferdig' : `Omgang ${maxOmgang + 1}`)
    }

    const wrap = lagEl('div', null, isEditMode3 ? 'sb-wrap sb-wrap--3p sb-wrap--edit-mode' : 'sb-wrap sb-wrap--3p')
    spelarar.forEach((ks, i) => {
      const erVunne = vinnRekkefolge.includes(i)
      const visVunne = erVunne && !isEditMode3
      const plass = visVunne ? vinnRekkefolge.indexOf(i) + 1 : null
      const panel = lagEl('div', null, `sb-spelar-panel${visVunne ? ' sb-spelar-panel--vann' : ''}`)
      const navn = navnFor(ks)
      panel.appendChild(lagEl('div', navn.label, navn.erPar ? 'sb-spelar-navn sb-spelar-navn--par' : 'sb-spelar-navn'))
      panel.appendChild(lagEl('div', String(totalar[i]), 'sb-score'))

      if (plass) panel.appendChild(lagEl('div', `${plass}. plass`, 'sb-plass-badge'))

      if (editIdxar.includes(i) && kanRedigere && !kamp.er_bekreftet) {
        const knappar = lagEl('div', null, 'sb-knappar')
        for (const n of pointValues) {
          const btn = lagEl('button', String(n), 'sb-poeng-btn')
          btn.dataset.spelar = String(i)
          btn.dataset.val = String(n)
          if (vals[i] === n) btn.classList.add('sb-valgt')
          if (disabledSets[i]?.has(n)) btn.disabled = true
          knappar.appendChild(btn)
        }
        panel.appendChild(knappar)
      }

      wrap.appendChild(panel)
    })
    container.appendChild(wrap)

    if (kanRedigere && !kamp.er_bekreftet) {
      const angreRad = lagEl('div', null, 'sb-angre-rad')
      const angreBtn = lagEl('button', '↩', 'sb-angre-btn')
      if (isEditMode3) {
        angreBtn.title = 'Avbryt endring'
        angreBtn.addEventListener('click', () => { isEditMode3 = false; modifiedPlayers3 = new Set(); editModeIdxar = []; vals = [null, null, null]; tegn3() })
        angreRad.appendChild(angreBtn)
        const avbrytBtn = lagEl('button', 'Avbryt endring', 'sb-avbryt-btn')
        avbrytBtn.addEventListener('click', () => { isEditMode3 = false; modifiedPlayers3 = new Set(); editModeIdxar = []; vals = [null, null, null]; tegn3() })
        angreRad.appendChild(avbrytBtn)
      } else {
        angreBtn.title = 'Endre siste omgang'
        angreBtn.disabled = omgangData.length === 0
        angreBtn.addEventListener('click', () => {
          const lastNr = Math.max(...omgangData.map(o => o.omgang))
          editModeIdxar = []
          spelarar.forEach((_, i) => {
            const row = omgangData.find(o => o.kamp_spelar_id === spelarar[i].id && o.omgang === lastNr)
            if (row !== undefined) {
              vals[i] = row.score || null
              editModeIdxar.push(i)
            }
          })
          isEditMode3 = true
          modifiedPlayers3 = new Set()
          tegn3()
        })
        angreRad.appendChild(angreBtn)
      }
      container.appendChild(angreRad)

      if (isEditMode3 || !erFerdig) {
        const kanNeste = isEditMode3
          ? modifiedPlayers3.size > 0 && editIdxar.some(i => vals[i] !== null)
          : aktiveIdxar.some(i => vals[i] !== null)
        const nesteLabel = isEditMode3 ? 'Bekreft endring' : 'Neste omgang'
        const nesteBtn = lagAsyncKnapp(nesteLabel, 'sb-neste-btn', nesteOmgang3)
        nesteBtn.disabled = !kanNeste
        container.appendChild(nesteBtn)
      }
    }

    if (erFerdig && !isEditMode3 && !kamp.er_bekreftet && onBekreft && kanRedigere) {
      container.appendChild(lagBekreftKnapp(() => onBekreft(vinnRekkefolge.map(i => spelarar[i].kasterid))))
    } else if (kamp.er_bekreftet) {
      container.appendChild(lagEl('div', 'Kamp fullført', 'alert alert-success mt-2'))
    }

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

  async function nesteOmgang3(): Promise<void> {
    const aktiveIdxar = [0, 1, 2].filter(i => spelarar[i] && !vinnRekkefolge.includes(i))

    if (isEditMode3) {
      const lastNr = Math.max(...omgangData.map(o => o.omgang))
      const rows = editModeIdxar.map(i => {
        const v = vals[i] ?? 0
        return { kamp_spelar_id: spelarar[i].id, omgang: lastNr, score: v, antall_ringer: calcAntallRinger(v) }
      })
      const { error } = await oppdaterKampOmgang(rows)
      if (error) { showToast('Feil ved lagring', 'error'); return }
      isEditMode3 = false
      modifiedPlayers3 = new Set()
      editModeIdxar = []
    } else {
      const nr = omgangData.length ? Math.max(...omgangData.map(o => o.omgang)) + 1 : 1
      const inserts = aktiveIdxar.map(i => {
        const v = vals[i] ?? 0
        return { kamp_spelar_id: spelarar[i].id, omgang: nr, score: v, antall_ringer: calcAntallRinger(v) }
      })
      const { error } = await lagreKampOmgang(inserts)
      if (error) { showToast('Feil ved lagring', 'error'); return }
      await lastOmgangar3()
    }

    vals = [null, null, null]
    tegn3()
  }

  tegn3()

  return cleanup
}
