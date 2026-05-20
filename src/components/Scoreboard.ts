import type { KampOmgangRow, KampRow, KampSpelarIKamp } from '@/services/kampService'
import {
  hentKampOmgangar,
  lagreKampOmgang,
  slettKampOmgangarFra,
  unbekreftKamp,
  subscribeToScoreboardEndringar,
} from '@/services/kampService'
import { avmeldKanal } from '@/utils/realtime'
import { showToast } from './Toast'
import { confirmDialog } from './ConfirmDialog'

interface ScoreboardOptions {
  pointValues: number[]
  erArrangor?: boolean
  erDeltakar?: boolean
  onBekreft?: ((orderedKasterids?: number[] | null) => Promise<void>) | null
  omgangEl?: HTMLElement | null
  p3ks?: KampSpelarIKamp | null
  hcp1?: number
  hcp2?: number
}

type OmgangRad = { omgang: number; s1: number; s2: number; r1: number; r2: number }

export async function renderScoreboard(
  container: HTMLElement,
  kamp: KampRow,
  p1ks: KampSpelarIKamp | null,
  p2ks: KampSpelarIKamp | null,
  options: ScoreboardOptions,
): Promise<void> {
  const {
    pointValues,
    erArrangor = false,
    erDeltakar = false,
    onBekreft = null,
    omgangEl = null,
    p3ks = null,
    hcp1 = 0,
    hcp2 = 0,
  } = options

  if (p3ks && kamp.er_tre_spelarar) {
    return renderScoreboard3(container, kamp, p1ks, p2ks, p3ks, { pointValues, erArrangor, erDeltakar, onBekreft, omgangEl })
  }

  let omgangar: OmgangRad[] = []
  let val1: number | null = null
  let val2: number | null = null
  let kampFerdig = kamp.er_bekreftet || kamp.er_walkover

  const kanRedigere = erArrangor || (erDeltakar && !kamp.er_bekreftet)

  await lastOmgangar()
  tegn()

  const spelarIds = [p1ks?.id, p2ks?.id].filter((id): id is number => id != null)

  const kanal = subscribeToScoreboardEndringar(
    kamp.id,
    spelarIds,
    async () => { await lastOmgangar(); tegn() },
    async () => { kamp.er_bekreftet = true; await lastOmgangar(); tegn() },
  )

  window.addEventListener('hashchange', () => void avmeldKanal(kanal), { once: true })

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

    return { p1Dis, p2Dis }
  }

  function tegn(): void {
    container.innerHTML = ''

    const [t1, t2] = beregnEffektiveTotalar()
    const [r1, r2] = beregnRingarTotalar()
    const nr = noverAndeOmgang()
    const { p1Dis, p2Dis } = bereknKnappStatus(val1, val2)
    const kanNeste = kanRedigere && !kampFerdig && (val1 !== null || val2 !== null)
    const kanBekrefte = kampFerdig && !kamp.er_bekreftet && (erArrangor || erDeltakar) && !!onBekreft
    const maxRinger = omgangar.length * 2

    if (omgangEl) {
      omgangEl.textContent = kamp.er_bekreftet ? 'Fullført' : (kampFerdig ? 'Ferdig' : `Omgang ${nr}`)
    }

    const wrap = lagEl('div', null, 'sb-wrap')
    wrap.appendChild(lagSpelerPanel(spelarNamn(p1ks, 'Spelar 1'), t1, r1, maxRinger, val1, p1Dis, !kanRedigere, 1))
    wrap.appendChild(lagSpelerPanel(spelarNamn(p2ks, 'Spelar 2'), t2, r2, maxRinger, val2, p2Dis, !kanRedigere, 2))
    container.appendChild(wrap)

    if (kanRedigere) {
      const angreRad = lagEl('div', null, 'sb-angre-rad')

      if (omgangar.length > 0) {
        angreRad.appendChild(lagOmgangSlettKnappar(omgangar.map(o => o.omgang), slettOmgangFra))
      }

      const angreBtn = lagEl('button', '↩', 'sb-angre-btn')
      angreBtn.title = 'Angre val for denne omgangen'
      angreBtn.disabled = val1 === null && val2 === null
      angreBtn.addEventListener('click', () => { val1 = null; val2 = null; tegn() })
      angreRad.appendChild(angreBtn)

      container.appendChild(angreRad)
    }

    if (kanBekrefte) {
      container.appendChild(lagBekreftKnapp(() => onBekreft!()))
    } else if (kanRedigere) {
      const nesteBtn = lagEl('button', 'Neste omgang', 'sb-neste-btn')
      nesteBtn.disabled = !kanNeste
      nesteBtn.addEventListener('click', async () => {
        nesteBtn.disabled = true
        nesteBtn.textContent = 'Lagrer…'
        await nesteOmgang()
      })
      container.appendChild(nesteBtn)
    }

    container.querySelectorAll<HTMLButtonElement>('[data-spelar]').forEach(btn => {
      btn.addEventListener('click', () => {
        const spelar = parseInt(btn.dataset.spelar ?? '0')
        const v = parseInt(btn.dataset.val ?? '0')
        if (spelar === 1) val1 = v
        else val2 = v
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
  ): HTMLElement {
    const panel = lagEl('div', null, 'sb-spelar-panel')
    panel.appendChild(lagEl('div', navn, 'sb-spelar-navn'))
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
    const nr = noverAndeOmgang()
    const s1 = val1 ?? 0
    const s2 = val2 ?? 0
    const r1 = s1 === 6 ? 2 : (s1 === 3 || s1 === 4) ? 1 : 0
    const r2 = s2 === 6 ? 2 : (s2 === 3 || s2 === 4) ? 1 : 0

    const inserts = []
    if (p1ks?.id) inserts.push({ kamp_spelar_id: p1ks.id, omgang: nr, score: s1, antall_ringer: r1 })
    if (p2ks?.id) inserts.push({ kamp_spelar_id: p2ks.id, omgang: nr, score: s2, antall_ringer: r2 })

    const { error } = await lagreKampOmgang(inserts)
    if (error) { showToast('Feil ved lagring', 'error'); return }

    omgangar.push({ omgang: nr, s1, s2, r1, r2 })
    val1 = null
    val2 = null

    const [newT1, newT2] = beregnEffektiveTotalar()
    if (erVinnarKondisjon(newT1, newT2)) kampFerdig = true

    tegn()
  }

  async function slettOmgangFra(fraNr: number): Promise<void> {
    if (!await confirmDialog({ title: 'Slett omgangar', message: `Slett omgang ${fraNr} og alle etter? Dette kan ikkje angrast.`, danger: true })) return

    const ids = [p1ks?.id, p2ks?.id].filter((id): id is number => id != null)
    const { error } = await slettKampOmgangarFra(ids, fraNr)
    if (error) { showToast('Feil ved sletting', 'error'); return }

    if (kamp.er_bekreftet) {
      const { error: e2 } = await unbekreftKamp(kamp.id)
      if (e2) { showToast('Feil ved oppdatering av kampstatus', 'error'); return }
      kamp.er_bekreftet = false
    }

    omgangar = omgangar.filter(o => o.omgang < fraNr)
    val1 = null
    val2 = null

    const [t1, t2] = beregnEffektiveTotalar()
    kampFerdig = erVinnarKondisjon(t1, t2)
    tegn()
  }
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

function lagOmgangSlettKnappar(omgangNumre: number[], onSlett: (nr: number) => void): HTMLElement {
  const row = lagEl('div', null, 'sb-omg-btns')
  for (const nr of omgangNumre) {
    const btn = lagEl('button', String(nr), 'sb-omg-btn')
    btn.title = `Slett frå omgang ${nr}`
    btn.addEventListener('click', () => onSlett(nr))
    row.appendChild(btn)
  }
  return row
}

function lagBekreftKnapp(onBekreft: () => Promise<void>): HTMLButtonElement {
  const btn = lagEl('button', 'Bekreft kamp', 'sb-neste-btn sb-neste-btn--bekreft')
  btn.addEventListener('click', async () => {
    btn.disabled = true
    btn.textContent = 'Lagrar…'
    await onBekreft()
  })
  return btn
}

// ── 3-player scoreboard ───────────────────────────────────────────────────────

async function renderScoreboard3(
  container: HTMLElement,
  kamp: KampRow,
  p1ks: KampSpelarIKamp | null,
  p2ks: KampSpelarIKamp | null,
  p3ks: KampSpelarIKamp,
  options: Pick<ScoreboardOptions, 'pointValues' | 'erArrangor' | 'erDeltakar' | 'onBekreft' | 'omgangEl'>,
): Promise<void> {
  const { pointValues, erArrangor = false, erDeltakar = false, onBekreft = null, omgangEl = null } = options
  const kanRedigere = erArrangor || (erDeltakar && !kamp.er_bekreftet)
  const spelarar = [p1ks, p2ks, p3ks].filter((s): s is KampSpelarIKamp => s != null)
  const spelarIds = spelarar.map(s => s.id).filter((id): id is number => id != null)

  let omgangData: KampOmgangRow[] = []
  let vinnRekkefolge: number[] = []
  let vals: (number | null)[] = [null, null, null]

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

  const kanal3 = subscribeToScoreboardEndringar(
    kamp.id,
    spelarIds,
    async () => { await lastOmgangar3(); tegn3() },
    async () => { kamp.er_bekreftet = true; await lastOmgangar3(); tegn3() },
  )

  window.addEventListener('hashchange', () => void avmeldKanal(kanal3), { once: true })

  function bereknKnappStatus3(aktiveIdxar: number[]): Set<number>[] {
    const disabledSets = spelarar.map(() => new Set<number>())
    const selectedIdxar = aktiveIdxar.filter(i => vals[i] !== null)
    if (!selectedIdxar.length) return disabledSets

    const harNonRing = selectedIdxar.some(i => [1, 2, 4].includes(vals[i] as number))
    const harRing = selectedIdxar.some(i => [3, 6].includes(vals[i] as number))

    for (const i of aktiveIdxar) {
      if (vals[i] !== null) {
        pointValues.forEach(n => { if (n !== vals[i]) disabledSets[i].add(n) })
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
    const erFerdig = vinnRekkefolge.length === spelarar.length
    const maxOmgang = omgangData.length ? Math.max(...omgangData.map(o => o.omgang)) : 0
    const disabledSets = bereknKnappStatus3(aktiveIdxar)

    if (omgangEl) {
      omgangEl.textContent = kamp.er_bekreftet ? 'Fullført' : (erFerdig ? 'Ferdig' : `Omgang ${maxOmgang + 1}`)
    }

    const wrap = lagEl('div', null, 'sb-wrap sb-wrap--3p')
    spelarar.forEach((ks, i) => {
      const erVunne = vinnRekkefolge.includes(i)
      const plass = erVunne ? vinnRekkefolge.indexOf(i) + 1 : null
      const panel = lagEl('div', null, `sb-spelar-panel${erVunne ? ' sb-spelar-panel--vann' : ''}`)
      panel.appendChild(lagEl('div', spelarNamn(ks), 'sb-spelar-navn'))
      panel.appendChild(lagEl('div', String(totalar[i]), 'sb-score'))

      if (plass) panel.appendChild(lagEl('div', `${plass}. plass`, 'sb-plass-badge'))

      if (!erVunne && kanRedigere && !erFerdig && !kamp.er_bekreftet) {
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

    if (kanRedigere && !erFerdig && !kamp.er_bekreftet) {
      const angreRad = lagEl('div', null, 'sb-angre-rad')

      if (omgangData.length > 0) {
        const omgangarNr = [...new Set(omgangData.map(o => o.omgang))].sort((a, b) => a - b)
        angreRad.appendChild(lagOmgangSlettKnappar(omgangarNr, slettOmgangFra3))
      }

      const angreBtn = lagEl('button', '↩', 'sb-angre-btn')
      angreBtn.title = 'Angre val for denne omgangen'
      angreBtn.disabled = aktiveIdxar.every(i => vals[i] === null)
      angreBtn.addEventListener('click', () => { vals = [null, null, null]; tegn3() })
      angreRad.appendChild(angreBtn)
      container.appendChild(angreRad)

      const kanNeste = aktiveIdxar.some(i => vals[i] !== null)
      const nesteBtn = lagEl('button', 'Neste omgang', 'sb-neste-btn')
      nesteBtn.disabled = !kanNeste
      nesteBtn.addEventListener('click', nesteOmgang3)
      container.appendChild(nesteBtn)
    }

    if (erFerdig && !kamp.er_bekreftet && onBekreft && kanRedigere) {
      container.appendChild(lagBekreftKnapp(() => onBekreft(vinnRekkefolge.map(i => spelarar[i].kasterid))))
    } else if (kamp.er_bekreftet) {
      container.appendChild(lagEl('div', 'Kamp fullført', 'alert alert-success mt-2'))
    }

    container.querySelectorAll<HTMLButtonElement>('[data-spelar]').forEach(btn => {
      btn.addEventListener('click', () => {
        vals[parseInt(btn.dataset.spelar ?? '0')] = parseInt(btn.dataset.val ?? '0')
        tegn3()
      })
    })
  }

  async function nesteOmgang3(): Promise<void> {
    const aktiveIdxar = [0, 1, 2].filter(i => spelarar[i] && !vinnRekkefolge.includes(i))
    const nr = omgangData.length ? Math.max(...omgangData.map(o => o.omgang)) + 1 : 1
    const inserts = aktiveIdxar.map(i => {
      const v = vals[i] ?? 0
      return { kamp_spelar_id: spelarar[i].id, omgang: nr, score: v, antall_ringer: v === 6 ? 2 : (v === 3 || v === 4) ? 1 : 0 }
    })
    const { error } = await lagreKampOmgang(inserts)
    if (error) { showToast('Feil ved lagring', 'error'); return }
    vals = [null, null, null]
    await lastOmgangar3()
    tegn3()
  }

  async function slettOmgangFra3(fraNr: number): Promise<void> {
    if (!await confirmDialog({ title: 'Slett omgangar', message: `Slett omgang ${fraNr} og alle etter? Dette kan ikkje angrast.`, danger: true })) return
    const { error } = await slettKampOmgangarFra(spelarIds, fraNr)
    if (error) { showToast('Feil ved sletting', 'error'); return }

    if (kamp.er_bekreftet) {
      const { error: e2 } = await unbekreftKamp(kamp.id)
      if (e2) { showToast('Feil ved oppdatering av kampstatus', 'error'); return }
      kamp.er_bekreftet = false
    }

    vals = [null, null, null]
    await lastOmgangar3()
    tegn3()
  }

  tegn3()
}
