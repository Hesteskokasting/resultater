import type { QueryData, RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { logError } from '../utils/logError'
import { beregnKampPoeng } from '../utils/kamp'

const _kampSpelarQuery = supabase.from('kamp_spelar').select(`
  id, kasterid, posisjon,
  kamp:kampid(
    id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
    stevne:stevneid(id, navn, erfullfort),
    spelarar:kamp_spelar(
      id, kasterid, posisjon,
      kaster:kasterid(id, fornavn, etternavn)
    )
  )
`)

export type KampSpelarRow = QueryData<typeof _kampSpelarQuery>[number]

export async function hentMineKampar(kasterid: number): Promise<{ data: KampSpelarRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp_spelar')
    .select(`
      id, kasterid, posisjon,
      kamp:kampid(
        id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
        stevne:stevneid(id, navn, erfullfort),
        spelarar:kamp_spelar(
          id, kasterid, posisjon,
          kaster:kasterid(id, fornavn, etternavn)
        )
      )
    `)
    .eq('kasterid', kasterid)
  if (error) logError('hentMineKampar', error)
  return { data: data ?? [], error }
}

// ── Scoreboard types ──────────────────────────────────────────────────────────

const _kampScoreboardQuery = supabase
  .from('kamp')
  .select(`
    id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
    er_bekreftet, er_walkover, er_tre_spelarar,
    stevne:stevneid(navn),
    spelarar:kamp_spelar(
      id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
      kaster:kasterid(id, fornavn, etternavn)
    )
  `)

export type KampRow = QueryData<typeof _kampScoreboardQuery>[number]
export type KampSpelarIKamp = KampRow['spelarar'][number]

// ── Innledande fase ───────────────────────────────────────────────────────────

const _innlKamperQuery = supabase.from('kamp').select(`
  id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer, posisjon,
    kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`)
export type InnlKampRow = QueryData<typeof _innlKamperQuery>[number]
export type InnlKampSpelarRow = InnlKampRow['spelarar'][number]

export async function hentInnledendeKamper(stevneid: number): Promise<{ data: InnlKampRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp')
    .select(`
      id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer, posisjon,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `)
    .eq('stevneid', stevneid)
    .eq('fase', 'innledende')
    .order('runde_nummer')
    .order('bane_nummer')
  if (error) logError('hentInnledendeKamper', error)
  return { data: data ?? [], error }
}

export async function harKampOmgangar(spelarIds: number[]): Promise<boolean> {
  if (!spelarIds.length) return false
  const { data, error } = await supabase
    .from('kamp_omgang')
    .select('id')
    .in('kamp_spelar_id', spelarIds)
    .limit(1)
  if (error) logError('harKampOmgangar', error)
  return (data?.length ?? 0) > 0
}

export async function slettKampOmgangar(spelarIds: number[]): Promise<{ error: unknown }> {
  if (!spelarIds.length) return { error: null }
  const { error } = await supabase.from('kamp_omgang').delete().in('kamp_spelar_id', spelarIds)
  if (error) logError('slettKampOmgangar', error)
  return { error }
}

export async function oppdaterKampSpelarScoreRask(
  id: number,
  scorePoeng: number,
  kampPoeng?: number,
): Promise<{ error: unknown }> {
  const update = kampPoeng !== undefined
    ? { score_poeng: scorePoeng, kamp_poeng: kampPoeng }
    : { score_poeng: scorePoeng }
  const { error } = await supabase.from('kamp_spelar').update(update).eq('id', id)
  if (error) logError('oppdaterKampSpelarScoreRask', error)
  return { error }
}

// ── Scoreboard read ───────────────────────────────────────────────────────────

export async function hentKamp(id: number): Promise<{ data: KampRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp')
    .select(`
      id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
      er_bekreftet, er_walkover, er_tre_spelarar,
      stevne:stevneid(navn),
      spelarar:kamp_spelar(
        id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn)
      )
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) logError('hentKamp', error)
  return { data, error }
}

export async function hentHcp(
  stevneId: number,
  kasterids: number[],
): Promise<Map<number, number>> {
  if (!kasterids.length) return new Map()
  const { data, error } = await supabase
    .from('resultat')
    .select('kasterid, hcp')
    .eq('stevneid', stevneId)
    .in('kasterid', kasterids)
  if (error) logError('hentHcp', error)
  return new Map(
    (data ?? [])
      .filter((r): r is typeof r & { kasterid: number } => r.kasterid != null)
      .map(r => [r.kasterid, r.hcp ?? 0]),
  )
}

export async function hentNesteKampOrganisator(
  stevneId: number,
  baneNummer: number,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp')
    .select('id')
    .eq('stevneid', stevneId)
    .eq('bane_nummer', baneNummer)
    .eq('er_bekreftet', false)
    .eq('er_walkover', false)
    .order('runde_nummer')
    .limit(1)
    .maybeSingle()
  if (error) logError('hentNesteKampOrganisator', error)
  return { data, error }
}

export async function hentNesteKampDeltakar(
  stevneId: number,
  kasterid: number,
): Promise<{ data: { id: number } | null; error: unknown }> {
  const { data: mine, error: mineErr } = await supabase
    .from('kamp_spelar')
    .select('kampid')
    .eq('kasterid', kasterid)
  if (mineErr) {
    logError('hentNesteKampDeltakar:minekampar', mineErr)
    return { data: null, error: mineErr }
  }

  const kampIds = (mine ?? []).map(ks => ks.kampid).filter((id): id is number => id != null)
  if (!kampIds.length) return { data: null, error: null }

  const { data, error } = await supabase
    .from('kamp')
    .select('id')
    .in('id', kampIds)
    .eq('stevneid', stevneId)
    .eq('er_bekreftet', false)
    .eq('er_walkover', false)
    .order('runde_nummer')
    .limit(1)
    .maybeSingle()
  if (error) logError('hentNesteKampDeltakar', error)
  return { data, error }
}

export async function erDeltakarIKamp(kampId: number, kasterid: number): Promise<boolean> {
  const { data } = await supabase
    .from('kamp_spelar')
    .select('id')
    .eq('kampid', kampId)
    .eq('kasterid', kasterid)
    .maybeSingle()
  return !!data
}

// ── Scoreboard write ──────────────────────────────────────────────────────────

export type KampSpelarBekreftData = {
  spelarId: number    // kamp_spelar.id
  kasterid: number
  scorePoeng: number  // fallback if omgang data is missing
}

export async function bekreftInnledendeKamp(params: {
  kampId: number
  p1: KampSpelarBekreftData | null
  p2: KampSpelarBekreftData | null
  hcp1: number
  hcp2: number
  erWalkover?: boolean
}): Promise<{ error: unknown }> {
  const { kampId, p1, p2, hcp1, hcp2, erWalkover = false } = params
  let t1 = 0, t2 = 0, r1 = 0, r2 = 0

  if (erWalkover) {
    t1 = 21
  } else {
    const spelarIds = [p1?.spelarId, p2?.spelarId].filter((id): id is number => id != null)
    const { data: omgData, error: omgErr } = await supabase
      .from('kamp_omgang')
      .select('kamp_spelar_id, score, antall_ringer')
      .in('kamp_spelar_id', spelarIds)
    if (omgErr) {
      logError('bekreftInnledendeKamp:omgangar', omgErr)
      return { error: omgErr }
    }
    for (const row of (omgData ?? [])) {
      if (row.kamp_spelar_id === p1?.spelarId) {
        t1 += row.score ?? 0
        r1 += row.antall_ringer ?? 0
      } else {
        t2 += row.score ?? 0
        r2 += row.antall_ringer ?? 0
      }
    }
    t1 += hcp1
    t2 += hcp2
  }

  const [kp1, kp2] = beregnKampPoeng(t1, t2)

  const spelarUpdates = []
  if (p1) spelarUpdates.push(
    supabase.from('kamp_spelar')
      .update({ score_poeng: t1, kamp_poeng: kp1, antall_ringer: r1 })
      .eq('id', p1.spelarId),
  )
  if (p2) spelarUpdates.push(
    supabase.from('kamp_spelar')
      .update({ score_poeng: t2, kamp_poeng: kp2, antall_ringer: r2 })
      .eq('id', p2.spelarId),
  )

  if (spelarUpdates.length) {
    const results = await Promise.all(spelarUpdates)
    const spelarErr = results.find(r => r.error)?.error
    if (spelarErr) {
      logError('bekreftInnledendeKamp:spelarar', spelarErr)
      return { error: spelarErr }
    }
  }

  const { error } = await supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kampId)
  if (error) logError('bekreftInnledendeKamp:kamp', error)
  return { error }
}

export async function bekreftAvsluttendeKamp(params: {
  kampId: number
  stevneId: number
  rundeNavn: string | null
  rundeNummer: number
  p1: KampSpelarBekreftData | null
  p2: KampSpelarBekreftData | null
  orderedKasterids: number[] | null  // 3-player: [1st, 2nd, 3rd] kasterids
}): Promise<{ error: unknown }> {
  const { kampId, stevneId, rundeNavn, rundeNummer, p1, p2, orderedKasterids } = params

  const { error: kampErr } = await supabase
    .from('kamp')
    .update({ er_bekreftet: true })
    .eq('id', kampId)
  if (kampErr) {
    logError('bekreftAvsluttendeKamp:kamp', kampErr)
    return { error: kampErr }
  }

  let eliminertId: number | null = null
  if (orderedKasterids?.length === 3) {
    eliminertId = orderedKasterids[2]
  } else {
    const spelarIds = [p1?.spelarId, p2?.spelarId].filter((id): id is number => id != null)
    const { data: omgData } = await supabase
      .from('kamp_omgang')
      .select('kamp_spelar_id, score')
      .in('kamp_spelar_id', spelarIds)

    const totalar: Record<number, number> = {}
    for (const o of (omgData ?? [])) {
      if (o.kamp_spelar_id != null) {
        totalar[o.kamp_spelar_id] = (totalar[o.kamp_spelar_id] ?? 0) + (o.score ?? 0)
      }
    }
    const t1 = p1 ? (totalar[p1.spelarId] ?? p1.scorePoeng) : 0
    const t2 = p2 ? (totalar[p2.spelarId] ?? p2.scorePoeng) : 0
    eliminertId = t1 >= t2 ? (p2?.kasterid ?? null) : (p1?.kasterid ?? null)
  }

  if (eliminertId == null) return { error: null }

  const erFinale = rundeNavn === 'Finale'
  const erBronsefinale = rundeNavn === 'Bronsefinale'
  const elimUpdate = (erFinale || erBronsefinale)
    ? { runde_eliminert: rundeNummer, plassering: erFinale ? 2 : 4 }
    : { runde_eliminert: rundeNummer }

  const { error: elimErr } = await supabase
    .from('resultat')
    .update(elimUpdate)
    .eq('stevneid', stevneId)
    .eq('kasterid', eliminertId)
  if (elimErr) {
    logError('bekreftAvsluttendeKamp:eliminert', elimErr)
    return { error: elimErr }
  }

  if (erFinale || erBronsefinale) {
    const vinnarId = orderedKasterids
      ? orderedKasterids[0]
      : (eliminertId === p2?.kasterid ? p1?.kasterid : p2?.kasterid)
    if (vinnarId != null) {
      const { error: vinnarErr } = await supabase
        .from('resultat')
        .update({ plassering: erFinale ? 1 : 3 })
        .eq('stevneid', stevneId)
        .eq('kasterid', vinnarId)
      if (vinnarErr) {
        logError('bekreftAvsluttendeKamp:vinnar', vinnarErr)
        return { error: vinnarErr }
      }
    }
  }

  return { error: null }
}

// ── Avsluttande fase ──────────────────────────────────────────────────────────

const _avslKamperQuery = supabase.from('kamp').select(`
  id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
  er_bekreftet, er_walkover, er_tre_spelarar,
  spelarar:kamp_spelar(
    id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
    kaster:kasterid(fornavn, etternavn),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`)
export type AvslKampRow = QueryData<typeof _avslKamperQuery>[number]
export type AvslKampSpelarRow = AvslKampRow['spelarar'][number]

const _kampSpelarerQuery = supabase.from('kamp_spelar').select(
  'id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)',
)
export type KampSpelarScoreRow = QueryData<typeof _kampSpelarerQuery>[number]

export async function hentAvsluttendeKamper(stevneid: number): Promise<{ data: AvslKampRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp')
    .select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(
        id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `)
    .eq('stevneid', stevneid)
    .order('runde_nummer')
    .order('bane_nummer')
  if (error) logError('hentAvsluttendeKamper', error)
  return { data: data ?? [], error }
}

export async function hentKampSpelarar(kampId: number): Promise<{ data: KampSpelarScoreRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from('kamp_spelar')
    .select('id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)')
    .eq('kampid', kampId)
  if (error) logError('hentKampSpelarar', error)
  return { data: data ?? [], error }
}

export async function harAlleSemifinalarBekrefta(stevneid: number, gruppeNavn: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('kamp')
    .select('er_bekreftet')
    .eq('stevneid', stevneid)
    .eq('gruppe_navn', gruppeNavn)
    .eq('runde_navn', 'Semifinale')
  if (error) logError('harAlleSemifinalarBekrefta', error)
  return !!(data?.length && data.every(s => s.er_bekreftet))
}

export async function bekreftCupKamp(params: {
  kampId: number
  stevneId: number
  rundeNummer: number
  rundeNavn: string | null
  allKasterids: number[]
  eliminertId: number | null
  vidareIds: number[]
}): Promise<{ error: unknown }> {
  const { kampId, stevneId, rundeNummer, rundeNavn, allKasterids, eliminertId, vidareIds } = params
  const erFinale = rundeNavn === 'Finale' || rundeNavn === 'Bronsefinale'

  const { error: kampErr } = await supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kampId)
  if (kampErr) { logError('bekreftCupKamp:kamp', kampErr); return { error: kampErr } }

  if (!eliminertId) return { error: null }

  if (erFinale) {
    const { error } = await supabase.from('resultat')
      .update({ runde_eliminert: null, plassering: null })
      .eq('stevneid', stevneId).in('kasterid', allKasterids)
    if (error) { logError('bekreftCupKamp:reset', error); return { error } }
  } else {
    const { error } = await supabase.from('resultat')
      .update({ runde_eliminert: null })
      .eq('stevneid', stevneId).eq('runde_eliminert', rundeNummer).in('kasterid', allKasterids)
    if (error) { logError('bekreftCupKamp:reset', error); return { error } }
  }

  const elimUpdate = erFinale
    ? { runde_eliminert: rundeNummer, plassering: rundeNavn === 'Finale' ? 2 : 4 }
    : { runde_eliminert: rundeNummer }
  const { error: elimErr } = await supabase.from('resultat')
    .update(elimUpdate).eq('stevneid', stevneId).eq('kasterid', eliminertId)
  if (elimErr) { logError('bekreftCupKamp:eliminert', elimErr); return { error: elimErr } }

  if (rundeNavn === 'Finale' && vidareIds.length > 0) {
    const { error } = await supabase.from('resultat')
      .update({ plassering: 1 }).eq('stevneid', stevneId).eq('kasterid', vidareIds[0])
    if (error) { logError('bekreftCupKamp:vinnar', error); return { error } }
  }
  if (rundeNavn === 'Bronsefinale' && vidareIds.length > 0) {
    const { error } = await supabase.from('resultat')
      .update({ plassering: 3, runde_eliminert: rundeNummer })
      .eq('stevneid', stevneId).eq('kasterid', vidareIds[0])
    if (error) { logError('bekreftCupKamp:bronsefinale', error); return { error } }
  }

  return { error: null }
}

export async function oppdaterVinnarTapar(params: {
  stevneId: number
  rundeNummer: number
  rundeNavn: string | null
  allKasterids: number[]
  nyVinnarId: number | null | undefined
  nyTaparId: number | null | undefined
}): Promise<{ error: unknown }> {
  const { stevneId, rundeNummer, rundeNavn, allKasterids, nyVinnarId, nyTaparId } = params
  const erFinale = rundeNavn === 'Finale'
  const erBronsefinale = rundeNavn === 'Bronsefinale'

  if (erFinale || erBronsefinale) {
    const { error: resetErr } = await supabase.from('resultat')
      .update({ runde_eliminert: null, plassering: null })
      .eq('stevneid', stevneId).in('kasterid', allKasterids)
    if (resetErr) { logError('oppdaterVinnarTapar:reset', resetErr); return { error: resetErr } }
    if (nyTaparId) {
      const { error } = await supabase.from('resultat')
        .update({ runde_eliminert: rundeNummer, plassering: erFinale ? 2 : 4 })
        .eq('stevneid', stevneId).eq('kasterid', nyTaparId)
      if (error) { logError('oppdaterVinnarTapar:tapar', error); return { error } }
    }
    const vinUpdate = erFinale ? { plassering: 1 } : { runde_eliminert: rundeNummer, plassering: 3 }
    if (nyVinnarId) {
      const { error } = await supabase.from('resultat')
        .update(vinUpdate).eq('stevneid', stevneId).eq('kasterid', nyVinnarId)
      if (error) { logError('oppdaterVinnarTapar:vinnar', error); return { error } }
    }
  } else {
    const { error: resetErr } = await supabase.from('resultat')
      .update({ runde_eliminert: null })
      .eq('stevneid', stevneId).eq('runde_eliminert', rundeNummer).in('kasterid', allKasterids)
    if (resetErr) { logError('oppdaterVinnarTapar:reset', resetErr); return { error: resetErr } }
    if (nyTaparId) {
      const { error } = await supabase.from('resultat')
        .update({ runde_eliminert: rundeNummer })
        .eq('stevneid', stevneId).eq('kasterid', nyTaparId)
      if (error) { logError('oppdaterVinnarTapar:tapar', error); return { error } }
    }
  }

  return { error: null }
}

// ── Scoreboard omgangar ───────────────────────────────────────────────────────

const _kampOmgangQuery = supabase
  .from('kamp_omgang')
  .select('id, kamp_spelar_id, omgang, score, antall_ringer')
export type KampOmgangRow = QueryData<typeof _kampOmgangQuery>[number]

export async function hentKampOmgangar(spelarIds: number[]): Promise<{ data: KampOmgangRow[]; error: unknown }> {
  if (!spelarIds.length) return { data: [], error: null }
  const { data, error } = await supabase
    .from('kamp_omgang')
    .select('id, kamp_spelar_id, omgang, score, antall_ringer')
    .in('kamp_spelar_id', spelarIds)
    .order('omgang')
  if (error) logError('hentKampOmgangar', error)
  return { data: data ?? [], error }
}

export async function lagreKampOmgang(
  inserts: { kamp_spelar_id: number; omgang: number; score: number; antall_ringer: number }[],
): Promise<{ error: unknown }> {
  if (!inserts.length) return { error: null }
  const { error } = await supabase.from('kamp_omgang').insert(inserts)
  if (error) logError('lagreKampOmgang', error)
  return { error }
}

export async function slettKampOmgangarFra(spelarIds: number[], fraOmgang: number): Promise<{ error: unknown }> {
  if (!spelarIds.length) return { error: null }
  const { error } = await supabase
    .from('kamp_omgang')
    .delete()
    .in('kamp_spelar_id', spelarIds)
    .gte('omgang', fraOmgang)
  if (error) logError('slettKampOmgangarFra', error)
  return { error }
}

// ── Realtime ──────────────────────────────────────────────────────────────────

export type NesteKampPayload = { id: number; bane_nummer: number | null; er_walkover: boolean }

export function subscribeToNesteKamp(
  stevneId: number,
  kampId: number,
  onNewKamp: (kamp: NesteKampPayload) => void,
): RealtimeChannel {
  return supabase
    .channel(`neste-kamp-${kampId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'kamp',
      filter: `stevneid=eq.${stevneId}`,
    }, (payload) => {
      onNewKamp(payload.new as NesteKampPayload)
    })
    .subscribe()
}

export function subscribeToKampEndringar(
  stevneid: number,
  channelName: string,
  onChange: () => void,
): RealtimeChannel {
  return supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp' }, (payload) => {
      const sid = (payload.new as { stevneid?: number })?.stevneid ?? (payload.old as { stevneid?: number })?.stevneid
      if (sid === stevneid) onChange()
    })
    .subscribe()
}

export function subscribeToScoreboardEndringar(
  kampId: number,
  spelarIds: number[],
  onOmgangChange: () => Promise<void>,
  onKampBekreft: () => Promise<void>,
): RealtimeChannel {
  return supabase
    .channel(`scoreboard-kamp-${kampId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' },
      async (payload) => {
        const p = payload.new as Record<string, unknown>
        const o = payload.old as Record<string, unknown>
        const endraId = p.kamp_spelar_id ?? o.kamp_spelar_id
        if (!endraId || spelarIds.includes(endraId as number)) {
          await onOmgangChange()
        }
      },
    )
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kamp', filter: `id=eq.${kampId}` },
      async (payload) => {
        if ((payload.new as { er_bekreftet?: boolean })?.er_bekreftet) {
          await onKampBekreft()
        }
      },
    )
    .subscribe()
}
