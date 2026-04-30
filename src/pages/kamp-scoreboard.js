import { supabase } from '../supabase.js'
import { getUser } from '../utils/auth.js'
import { beregnKampPoeng, oppdaterResultatInnl } from '../utils/kamp.js'
import { renderScoreboard } from '../organizer/scoreboard.js'

export async function render(container, { id } = {}) {
  const kampId = Number(id)
  container.innerHTML = '<p style="text-align:center;margin-top:40px;">Laster…</p>'

  const [{ data: kamp }, auth] = await Promise.all([
    supabase.from('kamp')
      .select(`
        id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
        spelarar:kamp_spelar(
          id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
          kaster:kasterid(id, fornavn, etternavn)
        )
      `)
      .eq('id', kampId)
      .single(),
    getUser(),
  ])

  if (!kamp) {
    container.innerHTML = '<p style="text-align:center;margin-top:40px;color:red;">Kamp ikkje funne.</p>'
    return
  }

  const spelarar = kamp.spelarar ?? []
  const kasterid = auth?.profil?.kasterid ?? null
  const rolle = auth?.profil?.rolle ?? null
  const erArrangor = rolle === 'admin' || rolle === 'klubbadmin'
  const erDeltakar = !!kasterid && spelarar.some(s => s.kasterid === kasterid)

  const p1ks = spelarar.find(s => s.posisjon === 1) ?? spelarar[0] ?? null
  const p2ks = spelarar.find(s => s.posisjon === 2) ?? spelarar[1] ?? null

  container.innerHTML = `
    <div class="container-fluid py-3" style="max-width:600px">
      <button id="tilbake-btn" class="btn btn-sm btn-outline-secondary mb-3">← Tilbake</button>
      <h5 class="mb-2">Runde ${kamp.runde_nummer} / Bane ${kamp.bane_nummer}</h5>
      <div id="sb-container" class="sb-page"></div>
    </div>
  `

  container.querySelector('#tilbake-btn').addEventListener('click', () => history.back())

  const sbContainer = container.querySelector('#sb-container')

  async function hentNesteKamp() {
    if (erArrangor) {
      const { data } = await supabase
        .from('kamp')
        .select('id')
        .eq('stevneid', kamp.stevneid)
        .eq('bane_nummer', kamp.bane_nummer)
        .eq('er_bekreftet', false)
        .eq('er_walkover', false)
        .order('runde_nummer')
        .limit(1)
        .maybeSingle()
      return data
    }

    // Deltakar: finn neste ubekrefte kamp i dette stevnet
    const { data: mine } = await supabase
      .from('kamp_spelar')
      .select('kampid')
      .eq('kasterid', kasterid)

    const kampIds = (mine ?? []).map(ks => ks.kampid)
    if (!kampIds.length) return null

    const { data } = await supabase
      .from('kamp')
      .select('id')
      .in('id', kampIds)
      .eq('stevneid', kamp.stevneid)
      .eq('er_bekreftet', false)
      .eq('er_walkover', false)
      .order('runde_nummer')
      .limit(1)
      .maybeSingle()
    return data
  }

  async function erRelevantKamp(nyKamp) {
    if (nyKamp.er_walkover) return false
    if (erArrangor) return nyKamp.bane_nummer === kamp.bane_nummer
    const { data } = await supabase
      .from('kamp_spelar')
      .select('id')
      .eq('kampid', nyKamp.id)
      .eq('kasterid', kasterid)
      .maybeSingle()
    return !!data
  }

  function visVentePaaNesteKamp() {
    container.innerHTML = `
      <div class="container-fluid py-3" style="max-width:600px">
        <button id="tilbake-btn-vente" class="btn btn-sm btn-outline-secondary mb-3">← Tilbake</button>
        <div class="alert alert-success mb-3"><strong>Kamp bekrefta!</strong></div>
        <div class="alert alert-info">Ventar på neste kamp…</div>
      </div>
    `
    container.querySelector('#tilbake-btn-vente').addEventListener('click', () => history.back())

    const kanal = supabase
      .channel(`neste-kamp-${kampId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'kamp',
        filter: `stevneid=eq.${kamp.stevneid}`,
      }, async (payload) => {
        if (await erRelevantKamp(payload.new)) {
          supabase.removeChannel(kanal)
          location.hash = `#/kamp/${payload.new.id}`
        }
      })
      .subscribe()

    // Rydd opp kanalen når brukaren navigerer bort
    window.addEventListener('hashchange', () => supabase.removeChannel(kanal), { once: true })
  }

  async function navigerTilNesteKamp() {
    const neste = await hentNesteKamp()
    if (neste) {
      location.hash = `#/kamp/${neste.id}`
    } else if (erArrangor || erDeltakar) {
      visVentePaaNesteKamp()
    } else {
      render(container, { id })
    }
  }

  async function onBekreft() {
    const ids = [p1ks?.id, p2ks?.id].filter(Boolean)
    const { data: omgData } = await supabase
      .from('kamp_omgang')
      .select('kamp_spelar_id, score, antall_ringer')
      .in('kamp_spelar_id', ids)

    let t1 = 0, t2 = 0, r1 = 0, r2 = 0
    for (const row of (omgData ?? [])) {
      if (row.kamp_spelar_id === p1ks?.id) {
        t1 += row.score ?? 0
        r1 += row.antall_ringer ?? 0
      } else {
        t2 += row.score ?? 0
        r2 += row.antall_ringer ?? 0
      }
    }

    const [kp1, kp2] = beregnKampPoeng(t1, t2)
    const kasterids = [p1ks?.kasterid, p2ks?.kasterid].filter(Boolean)

    const updates = [
      supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kampId),
    ]
    if (p1ks?.id) updates.push(supabase.from('kamp_spelar').update({ score_poeng: t1, kamp_poeng: kp1, antall_ringer: r1 }).eq('id', p1ks.id))
    if (p2ks?.id) updates.push(supabase.from('kamp_spelar').update({ score_poeng: t2, kamp_poeng: kp2, antall_ringer: r2 }).eq('id', p2ks.id))

    const results = await Promise.all(updates)
    const err = results.find(r => r.error)?.error
    if (err) { alert('Feil ved bekreftelse: ' + err.message); return }

    if (kamp.stevneid) await oppdaterResultatInnl(kamp.stevneid, kasterids, kamp.fase)

    await navigerTilNesteKamp()
  }

  await renderScoreboard(sbContainer, kamp, p1ks, p2ks, { erArrangor, erDeltakar, onBekreft })
}
