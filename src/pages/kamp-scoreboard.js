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
        stevne:stevneid(navn),
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

  const hovudHeader = document.querySelector('.topp-header')
  if (hovudHeader) hovudHeader.style.display = 'none'
  container.classList.add('sb-fullskjerm-modus')

  window.addEventListener('hashchange', () => {
    if (hovudHeader) hovudHeader.style.display = ''
    container.classList.remove('sb-fullskjerm-modus')
  }, { once: true })

  const spelarar = kamp.spelarar ?? []
  const kasterid = auth?.profil?.kasterid ?? null
  const rolle = auth?.profil?.rolle ?? null
  const erArrangor = rolle === 'admin' || rolle === 'klubbadmin'
  const erDeltakar = !!kasterid && spelarar.some(s => s.kasterid === kasterid)

  const p1ks = spelarar.find(s => s.posisjon === 1) ?? spelarar[0] ?? null
  const p2ks = spelarar.find(s => s.posisjon === 2) ?? spelarar[1] ?? null
  const p3ks = kamp.er_tre_spelarar ? (spelarar.find(s => s.posisjon === 3) ?? spelarar[2] ?? null) : null

  const stevneNavn = kamp.stevne?.navn ?? ''

  function lagKampWrapper(midten, body, { midtenId = null } = {}) {
    return `
      <div class="sb-kamp-wrapper">
        <div class="sb-kamp-topbar">
          <div class="sb-kamp-topbar-venstre">
            <button class="sb-tilbake-btn" aria-label="Tilbake">←</button>
            <span class="sb-kamp-stevnenavn">${stevneNavn}</span>
          </div>
          <div${midtenId ? ` id="${midtenId}"` : ''} class="sb-kamp-topbar-midten">${midten}</div>
          <div class="sb-kamp-topbar-høgre">
            <span class="sb-kamp-info-full">Runde ${kamp.runde_nummer} - Bane ${kamp.bane_nummer}</span>
            <span class="sb-kamp-info-kort">R${kamp.runde_nummer} - B${kamp.bane_nummer}</span>
          </div>
        </div>
        ${body}
      </div>
    `
  }

  container.innerHTML = lagKampWrapper(
    'Omgang 1',
    '<div id="sb-container" class="sb-page"></div>',
    { midtenId: 'sb-omgang-tittel' }
  )

  container.addEventListener('click', e => { if (e.target.closest('.sb-tilbake-btn')) history.back() })

  const sbContainer = container.querySelector('#sb-container')
  const omgangEl = container.querySelector('#sb-omgang-tittel')

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
    sessionStorage.setItem(`ventar-neste-${kampId}`, '1')
    container.innerHTML = lagKampWrapper(
      'Fullført',
      `<div style="padding:20px">
        <div class="alert alert-success mb-3"><strong>Kampen er ferdig!</strong></div>
        <div class="alert alert-info">Ventar på neste kamp…</div>
      </div>`
    )

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

    window.addEventListener('hashchange', () => {
      sessionStorage.removeItem(`ventar-neste-${kampId}`)
      supabase.removeChannel(kanal)
    }, { once: true })
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

  // orderedKasterids: brukt berre for 3-spelar cup (rekkefølgje: [1.plass, 2.plass, 3.plass])
  async function onBekreft(orderedKasterids = null) {
    if (kamp.fase === 'avsluttende') {
      await _bekreftAvsluttendeFraScoreboard(orderedKasterids)
    } else {
      await _bekreftInnledende()
    }
    await navigerTilNesteKamp()
  }

  async function _bekreftInnledende() {
    const ids = [p1ks?.id, p2ks?.id].filter(Boolean)
    const { data: omgData } = await supabase
      .from('kamp_omgang')
      .select('kamp_spelar_id, score, antall_ringer')
      .in('kamp_spelar_id', ids)

    let t1 = 0, t2 = 0, r1 = 0, r2 = 0
    for (const row of (omgData ?? [])) {
      if (row.kamp_spelar_id === p1ks?.id) { t1 += row.score ?? 0; r1 += row.antall_ringer ?? 0 }
      else { t2 += row.score ?? 0; r2 += row.antall_ringer ?? 0 }
    }

    const [kp1, kp2] = beregnKampPoeng(t1, t2)
    const kasterids = [p1ks?.kasterid, p2ks?.kasterid].filter(Boolean)

    const updates = [supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kampId)]
    if (p1ks?.id) updates.push(supabase.from('kamp_spelar').update({ score_poeng: t1, kamp_poeng: kp1, antall_ringer: r1 }).eq('id', p1ks.id))
    if (p2ks?.id) updates.push(supabase.from('kamp_spelar').update({ score_poeng: t2, kamp_poeng: kp2, antall_ringer: r2 }).eq('id', p2ks.id))

    const results = await Promise.all(updates)
    const err = results.find(r => r.error)?.error
    if (err) { alert('Feil ved bekreftelse: ' + err.message); return }

    if (kamp.stevneid) await oppdaterResultatInnl(kamp.stevneid, kasterids, kamp.fase)
  }

  async function _bekreftAvsluttendeFraScoreboard(orderedKasterids) {
    await supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kampId)

    // Finn taper (3-spelar: 3. plass; 2-spelar: lågaste score)
    let eliminertId = null
    if (orderedKasterids?.length === 3) {
      eliminertId = orderedKasterids[2]
    } else {
      const ids = [p1ks?.id, p2ks?.id].filter(Boolean)
      const { data: omgData } = await supabase.from('kamp_omgang')
        .select('kamp_spelar_id, score').in('kamp_spelar_id', ids)
      const totalar = {}
      ;(omgData ?? []).forEach(o => { totalar[o.kamp_spelar_id] = (totalar[o.kamp_spelar_id] ?? 0) + (o.score ?? 0) })
      const t1 = totalar[p1ks?.id] ?? p1ks?.score_poeng ?? 0
      const t2 = totalar[p2ks?.id] ?? p2ks?.score_poeng ?? 0
      eliminertId = t1 >= t2 ? p2ks?.kasterid : p1ks?.kasterid
    }

    if (eliminertId && kamp.stevneid) {
      // Tell aktive spelarar for plassering
      const { count } = await supabase.from('resultat')
        .select('kasterid', { count: 'exact', head: true })
        .eq('stevneid', kamp.stevneid)
        .is('runde_eliminert', null)

      const erFinaleRunde = kamp.runde_navn === 'Finale' || kamp.runde_navn === 'Bronsefinale'
      const elimUpdate = erFinaleRunde
        ? { runde_eliminert: kamp.runde_nummer, plassering: kamp.runde_navn === 'Finale' ? 2 : 4 }
        : { runde_eliminert: kamp.runde_nummer }

      await supabase.from('resultat')
        .update(elimUpdate)
        .eq('stevneid', kamp.stevneid).eq('kasterid', eliminertId)

      if (kamp.runde_navn === 'Finale') {
        const vinnarId = orderedKasterids ? orderedKasterids[0]
          : (eliminertId === p2ks?.kasterid ? p1ks?.kasterid : p2ks?.kasterid)
        if (vinnarId) await supabase.from('resultat').update({ plassering: 1 }).eq('stevneid', kamp.stevneid).eq('kasterid', vinnarId)
      }
      if (kamp.runde_navn === 'Bronsefinale') {
        const vinnarId = orderedKasterids ? orderedKasterids[0]
          : (eliminertId === p2ks?.kasterid ? p1ks?.kasterid : p2ks?.kasterid)
        if (vinnarId) await supabase.from('resultat').update({ plassering: 3 }).eq('stevneid', kamp.stevneid).eq('kasterid', vinnarId)
      }
    }
  }

  if (kamp.er_bekreftet && sessionStorage.getItem(`ventar-neste-${kampId}`)) {
    await navigerTilNesteKamp()
    return
  }

  await renderScoreboard(sbContainer, kamp, p1ks, p2ks, { erArrangor, erDeltakar, onBekreft, omgangEl, p3ks })
}
