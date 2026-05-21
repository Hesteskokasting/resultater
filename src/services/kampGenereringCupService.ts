import { supabase } from '@/supabase'
import { beregnCupRundeParingar } from '@/utils/kastemetoder-logikk'
import { harAlleSemifinalarBekrefta } from '@/services/kampService'
import type { RundeOppsett } from '@/types'

function genMatchId(): string {
  return crypto.randomUUID()
}

interface KampMedBane { id: number; bane_nummer: number | null }
interface KampMedMatchId { id: number; match_id: string }
interface KampSpelarInsert { kampid: number; kasterid: number; posisjon: number; score_poeng: number; kamp_poeng: number; antall_ringer: number }

interface GruppeForCup {
  gruppeNavn: string | null
  spelarar: { kasterid: number; plassering: number }[]
  runde1Oppsett?: RundeOppsett | null
}

interface Runde1Format {
  [gruppeNavn: string]: RundeOppsett | undefined
}

// ── Private helpers ───────────────────────────────────────────────────────────

async function _insertCupParingar(
  stevneid: number,
  paringar: ReturnType<typeof beregnCupRundeParingar>,
  rundeNummer: number,
  gruppeNavn: string | null,
  baneStart = 0,
  rundeNavn: string | null = null,
): Promise<number> {
  const matchIds = paringar.map(() => genMatchId())
  let baneNr = baneStart
  const rundekampar = paringar.map((p, i) => ({
    match_id: matchIds[i],
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

  for (let i = 0; i < paringar.length; i++) {
    const kampid = matchIdMap[matchIds[i]]
    paringar[i].spelarar.forEach((kasterid, pos) => {
      spelarRader.push({ kampid, kasterid: kasterid as number, posisjon: pos + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })
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
      for (let i = 0; i < myIdx; i++) {
        const prev = runde1Format[gruppeOrder[i]]
        if (prev) formatBaneOffset += (prev.c3 ?? 0) + (prev.c2 ?? 0)
      }
    }

    const baneStart = Math.max(dbMaxBane, formatBaneOffset)
    const erSemfinale = gr.spelarar.length === 4
    totalKampar += await _insertCupParingar(stevneid, paringar, 1, gr.gruppeNavn, baneStart, erSemfinale ? 'Semifinale' : null)
  }
  return totalKampar
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

  const { data: maxBane } = await supabase.from('kamp')
    .select('bane_nummer').eq('stevneid', stevneid).eq('fase', 'avsluttende')
    .eq('runde_nummer', rundeNummer).not('bane_nummer', 'is', null)
    .order('bane_nummer', { ascending: false }).limit(1)
  const baneStart = (maxBane as KampMedBane[] | null)?.[0]?.bane_nummer ?? 0

  const antallKampar = await _insertCupParingar(
    stevneid, paringar, rundeNummer, gruppeNavn, baneStart,
    erSemfinale ? 'Semifinale' : null,
  )
  return { rundeNummer, antallKampar }
}

// Generates the next round for all active groups simultaneously.
// Delegates to genererNesteCupRundeForGruppe per group so bane numbering
// stays consistent whether groups advance together or independently.
export async function genererNesteCupRunde(
  stevneid: number,
  medSeeding: boolean,
  stilling: { kasterid: number; runde_eliminert: number | null; gruppe: { navn: string } | null; kamp_poeng: number; score_poeng: number; startnummer: number | null }[],
): Promise<{ rundeNummer: number; antallKampar: number; erSemfinale: boolean }> {
  const aktive = stilling.filter(r => r.runde_eliminert == null)
  const erSemfinale = aktive.length === 4

  const gruppeNavns = [...new Set(
    aktive.map(sp => sp.gruppe?.navn).filter((n): n is string => n != null)
  )]

  let rundeNummer = 0
  let totalKampar = 0

  for (const gruppeNavn of gruppeNavns) {
    const gruppeAktive = aktive.filter(r => r.gruppe?.navn === gruppeNavn)
    const spelarar = gruppeAktive.map((r, i) => ({ kasterid: r.kasterid, plassering: i + 1 }))
    const result = await genererNesteCupRundeForGruppe(stevneid, gruppeNavn, medSeeding, spelarar)
    rundeNummer = result.rundeNummer
    totalKampar += result.antallKampar
  }

  return { rundeNummer, antallKampar: totalKampar, erSemfinale }
}

export async function genererFinaleOgBronsefinale(
  stevneid: number,
  gruppeNavn: string,
): Promise<void> {
  interface SemiSpelar {
    id: number
    kasterid: number | null
    score_poeng: number
    posisjon: number | null
    omgangar: { score: number | null }[] | null
  }
  interface SemiKamp {
    id: number
    runde_nummer: number
    spelarar: SemiSpelar[] | null
  }

  const { data: semikampar } = await supabase
    .from('kamp')
    .select('id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, posisjon, omgangar:kamp_omgang(score))')
    .eq('stevneid', stevneid)
    .eq('fase', 'avsluttende')
    .eq('gruppe_navn', gruppeNavn)
    .eq('runde_navn', 'Semifinale')
    .eq('er_bekreftet', true)

  if (!semikampar?.length) throw new Error('Semifinalane er ikkje bekrefta.')

  const typedSemi = semikampar as SemiKamp[]
  const rundeNummer = typedSemi[0].runde_nummer + 1
  const vinnarar: (number | null)[] = []
  const taparar: (number | null)[] = []

  for (const kamp of typedSemi) {
    const sp = kamp.spelarar ?? []
    const sorted = [...sp].sort((a, b) => {
      const sA = a.omgangar?.length ? a.omgangar.reduce((s, o) => s + (o.score ?? 0), 0) : (a.score_poeng ?? 0)
      const sB = b.omgangar?.length ? b.omgangar.reduce((s, o) => s + (o.score ?? 0), 0) : (b.score_poeng ?? 0)
      return sB - sA
    })
    if (sorted[0]) vinnarar.push(sorted[0].kasterid)
    if (sorted[1]) taparar.push(sorted[1].kasterid)
  }

  const { data: maxBane } = await supabase.from('kamp')
    .select('bane_nummer').eq('stevneid', stevneid).eq('fase', 'avsluttende')
    .eq('runde_nummer', rundeNummer).not('bane_nummer', 'is', null)
    .order('bane_nummer', { ascending: false }).limit(1)
  const baneStart = (maxBane as KampMedBane[] | null)?.[0]?.bane_nummer ?? 0

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
    ...vinnarar.filter((k): k is number => k != null).map((kid, i) => ({ kampid: finaleId, kasterid: kid, posisjon: i + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
    ...taparar.filter((k): k is number => k != null).map((kid, i) => ({ kampid: bronseId, kasterid: kid, posisjon: i + 1, score_poeng: 0, kamp_poeng: 0, antall_ringer: 0 })),
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
