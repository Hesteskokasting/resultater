import { supabase } from '@/supabase'
import { beregnCupRundeParingar } from '@/utils/kastemetoder-logikk'
import { harAlleSemifinalarBekrefta } from '@/services/kampService'
import type { RundeOppsett } from '@/types'

function genMatchId(): string {
  return crypto.randomUUID()
}

interface KampMedBane { id: number; bane_nummer: number | null }
interface KampMedMatchId { id: number; match_id: string }
interface KampSpelarInsert { kampid: number; kasterid: number; score_poeng: number; kamp_poeng: number; antall_ringer: number }

interface GruppeForCup {
  gruppeNavn: string | null
  spelarar: { kasterid: number; plassering: number }[]
  runde1Oppsett?: RundeOppsett | null
}

interface Runde1Format {
  [gruppeNavn: string]: RundeOppsett | undefined
}

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Side membership from resultat.startnummer: each kasterid maps to all
 * kasterids sharing its startnummer (posisjon order). Singel: the player
 * alone. The cup algorithms operate on one representative kasterid per side;
 * this expands them back to full kamp_spelar rows at insert time.
 */
interface SideInfo {
  kasteridToSnr: Record<number, number>
  snrToMembers: Record<number, number[]>
}

async function _hentSideInfo(stevneid: number): Promise<SideInfo> {
  const { data, error } = await supabase
    .from('resultat')
    .select('kasterid, startnummer, posisjon')
    .eq('stevneid', stevneid)
  if (error) throw new Error('Feil ved henting av resultat: ' + error.message)

  const kasteridToSnr: Record<number, number> = {}
  const rawMembers: Record<number, { kasterid: number; posisjon: number | null }[]> = {}
  for (const rad of data ?? []) {
    if (rad.kasterid == null || rad.startnummer == null) continue
    kasteridToSnr[rad.kasterid] = rad.startnummer
    const sideRader = (rawMembers[rad.startnummer] ??= [])
    sideRader.push({ kasterid: rad.kasterid, posisjon: rad.posisjon })
  }

  const snrToMembers: Record<number, number[]> = {}
  for (const [snr, members] of Object.entries(rawMembers)) {
    members.sort((a, b) => (a.posisjon ?? Infinity) - (b.posisjon ?? Infinity) || a.kasterid - b.kasterid)
    snrToMembers[Number(snr)] = members.map(m => m.kasterid)
  }
  return { kasteridToSnr, snrToMembers }
}

function _sideMembers(sideInfo: SideInfo, kasterid: number): number[] {
  const snr = sideInfo.kasteridToSnr[kasterid]
  return (snr != null ? sideInfo.snrToMembers[snr] : undefined) ?? [kasterid]
}

async function _insertCupParingar(
  stevneid: number,
  paringar: ReturnType<typeof beregnCupRundeParingar>,
  rundeNummer: number,
  gruppeNavn: string | null,
  sideInfo: SideInfo,
  baneStart = 0,
  rundeNavn: string | null = null,
): Promise<number> {
  const matchIds = paringar.map(() => genMatchId())
  let baneNr = baneStart
  const rundekampar = paringar.map((p, i) => ({
    match_id: matchIds[i]!,
    stevneid,
    fase: 'avsluttende',
    runde_nummer: rundeNummer,
    gruppe_navn: gruppeNavn ?? null,
    bane_nummer: p.erWalkover ? null : ++baneNr,
    er_bekreftet: false,
    er_walkover: p.erWalkover,
    er_tre_spelarar: p.erTreSpelarar,
    runde_navn: rundeNavn,
  }))

  const { data: innsettaKampar, error: kampErr } = await supabase
    .from('kamp').insert(rundekampar).select('id, match_id')
  if (kampErr) throw new Error('Feil ved innsetting av cup-kampar: ' + kampErr.message)

  const matchIdMap: Record<string, number> = Object.fromEntries(
    (innsettaKampar as KampMedMatchId[]).map(k => [k.match_id, k.id]),
  )
  const spelarRader: KampSpelarInsert[] = []

  for (const [i, paring] of paringar.entries()) {
    // matchIds maps 1:1 to paringar, and every inserted kamp comes back with its match_id
    const kampid = matchIdMap[matchIds[i]!]!
    paring.spelarar.forEach((kasterid) => {
      for (const member of _sideMembers(sideInfo, kasterid as number)) {
        spelarRader.push({ kampid, kasterid: member, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
      }
    })
  }

  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil ved innsetting av cup-spelarar: ' + spErr.message)

  return (innsettaKampar as KampMedMatchId[]).length
}

// ── Public exports ────────────────────────────────────────────────────────────

export async function genererCupRunde1(
  stevneid: number,
  grupper: GruppeForCup[],
  medSeeding: boolean,
  runde1Format: Runde1Format | null = null,
): Promise<number> {
  const gruppeOrder = ['A', 'B', 'C']
  let totalKampar = 0
  const sideInfo = await _hentSideInfo(stevneid)

  for (const gr of grupper) {
    const paringar = beregnCupRundeParingar(gr.spelarar, { medSeeding, isRunde1: true, runde1Oppsett: gr.runde1Oppsett ?? null })
    const { data: maxBane } = await supabase.from('kamp')
      .select('bane_nummer').eq('stevneid', stevneid).eq('fase', 'avsluttende')
      .eq('runde_nummer', 1).not('bane_nummer', 'is', null)
      .order('bane_nummer', { ascending: false }).limit(1)
    const dbMaxBane = (maxBane as KampMedBane[] | null)?.[0]?.bane_nummer ?? 0

    let formatBaneOffset = 0
    if (runde1Format && gr.gruppeNavn) {
      const myIdx = gruppeOrder.indexOf(gr.gruppeNavn)
      for (const gruppe of gruppeOrder.slice(0, myIdx)) {
        const prev = runde1Format[gruppe]
        if (prev) formatBaneOffset += (prev.c3 ?? 0) + (prev.c2 ?? 0)
      }
    }

    const baneStart = Math.max(dbMaxBane, formatBaneOffset)
    const erSemfinale = gr.spelarar.length === 4
    totalKampar += await _insertCupParingar(stevneid, paringar, 1, gr.gruppeNavn, sideInfo, baneStart, erSemfinale ? 'Semifinale' : null)
  }
  return totalKampar
}

/** Highest assigned bane number for the round, so new matches continue after it. */
async function _hentBaneStart(stevneid: number, rundeNummer: number): Promise<number> {
  const { data: maxBane } = await supabase.from('kamp')
    .select('bane_nummer').eq('stevneid', stevneid).eq('fase', 'avsluttende')
    .eq('runde_nummer', rundeNummer).not('bane_nummer', 'is', null)
    .order('bane_nummer', { ascending: false }).limit(1)
  return (maxBane as KampMedBane[] | null)?.[0]?.bane_nummer ?? 0
}

export async function genererNesteCupRundeForGruppe(
  stevneid: number,
  gruppeNavn: string,
  medSeeding: boolean,
  sorterteSpelarar: { kasterid: number; plassering: number }[],
): Promise<{ rundeNummer: number; antallKampar: number }> {
  const { data: kampar } = await supabase.from('kamp')
    .select('runde_nummer')
    .eq('stevneid', stevneid).eq('fase', 'avsluttende').eq('gruppe_navn', gruppeNavn)
    .order('runde_nummer', { ascending: false }).limit(1)
  const rundeNummer = ((kampar as { runde_nummer: number }[] | null)?.[0]?.runde_nummer ?? 0) + 1

  const spelarar = sorterteSpelarar
  const erSemfinale = spelarar.length === 4
  const paringar = beregnCupRundeParingar(spelarar, { medSeeding, isRunde1: false })

  const baneStart = await _hentBaneStart(stevneid, rundeNummer)

  const sideInfo = await _hentSideInfo(stevneid)
  const antallKampar = await _insertCupParingar(
    stevneid, paringar, rundeNummer, gruppeNavn, sideInfo, baneStart,
    erSemfinale ? 'Semifinale' : null,
  )
  return { rundeNummer, antallKampar }
}

export async function genererFinaleOgBronsefinale(
  stevneid: number,
  gruppeNavn: string,
): Promise<void> {
  interface SemiSpelar {
    id: number
    kasterid: number | null
    score_poeng: number
    omgangar: { score: number | null }[] | null
  }
  interface SemiKamp {
    id: number
    runde_nummer: number
    spelarar: SemiSpelar[] | null
  }

  const { data: semikampar } = await supabase
    .from('kamp')
    .select('id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))')
    .eq('stevneid', stevneid)
    .eq('fase', 'avsluttende')
    .eq('gruppe_navn', gruppeNavn)
    .eq('runde_navn', 'Semifinale')
    .eq('er_bekreftet', true)

  if (!semikampar?.length) throw new Error('Semifinalane er ikkje bekrefta.')

  const sideInfo = await _hentSideInfo(stevneid)
  const typedSemi = semikampar as SemiKamp[]
  const rundeNummer = typedSemi[0]!.runde_nummer + 1
  // One entry per side: all member kasterids of the winning/losing unit
  const vinnarar: number[][] = []
  const taparar: number[][] = []

  for (const kamp of typedSemi) {
    // Group rows into sides by startnummer; side score = sum of members'
    // own omgangar (pair members alternate throws) or score_poeng fallback
    const sider = new Map<number | string, { kasterids: number[]; score: number }>()
    for (const sp of kamp.spelarar ?? []) {
      if (sp.kasterid == null) continue
      const key = sideInfo.kasteridToSnr[sp.kasterid] ?? `kaster-${sp.kasterid}`
      const side = sider.get(key) ?? { kasterids: [], score: 0 }
      side.kasterids.push(sp.kasterid)
      side.score += sp.omgangar?.length
        ? sp.omgangar.reduce((s, o) => s + (o.score ?? 0), 0)
        : (sp.score_poeng ?? 0)
      sider.set(key, side)
    }
    const sorted = [...sider.values()].sort((a, b) => b.score - a.score)
    if (sorted[0]) vinnarar.push(sorted[0].kasterids)
    if (sorted[1]) taparar.push(sorted[1].kasterids)
  }

  const baneStart = await _hentBaneStart(stevneid, rundeNummer)

  const finale = {
    match_id: genMatchId(), stevneid, fase: 'avsluttende', runde_nummer: rundeNummer,
    gruppe_navn: gruppeNavn, bane_nummer: baneStart + 1, runde_navn: 'Finale',
    er_bekreftet: false, er_walkover: false, er_tre_spelarar: false,
  }
  const bronsefinale = {
    match_id: genMatchId(), stevneid, fase: 'avsluttende', runde_nummer: rundeNummer,
    gruppe_navn: gruppeNavn, bane_nummer: baneStart + 2, runde_navn: 'Bronsefinale',
    er_bekreftet: false, er_walkover: false, er_tre_spelarar: false,
  }

  const { data: kampar, error } = await supabase
    .from('kamp').insert([finale, bronsefinale]).select('id, runde_navn')
  if (error) throw new Error('Feil: ' + error.message)

  const typedKampar = kampar as { id: number; runde_navn: string | null }[]
  const finaleId = typedKampar.find(k => k.runde_navn === 'Finale')!.id
  const bronseId = typedKampar.find(k => k.runde_navn === 'Bronsefinale')!.id

  const spelarRader: KampSpelarInsert[] = [
    ...vinnarar.flat().map(kid => ({ kampid: finaleId, kasterid: kid, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
    ...taparar.flat().map(kid => ({ kampid: bronseId, kasterid: kid, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
  ]
  const { error: spErr } = await supabase.from('kamp_spelar').insert(spelarRader)
  if (spErr) throw new Error('Feil: ' + spErr.message)
}

export async function autoGenererFinaleOgBronsefinale(kampId: number): Promise<void> {
  const { data: kamp } = await supabase
    .from('kamp')
    .select('stevneid, runde_navn, gruppe_navn')
    .eq('id', kampId)
    .single()

  if (!kamp || kamp.runde_navn !== 'Semifinale' || !kamp.gruppe_navn) return

  const allConfirmed = await harAlleSemifinalarBekrefta(kamp.stevneid, kamp.gruppe_navn)
  if (!allConfirmed) return

  await genererFinaleOgBronsefinale(kamp.stevneid, kamp.gruppe_navn)
}
