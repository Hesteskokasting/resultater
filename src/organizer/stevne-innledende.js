import { supabase } from '../supabase.js'
import { opnNumberpad } from './score-numberpad.js'
import { beregnKampPoeng, hentP1P2, scoreForSp, ringerForSp, oppdaterResultatInnl } from '../utils/kamp.js'
import { genererNesteSwissRunde } from './kampgenerering-db.js'
import { autoFullforInnledendeKamper } from '../utils/organizer-test-utils.js'
import { byggInnledendeSpelMap, sorterStilling, renderInnledendeKnappar, lagOnEndringHandler, renderSpelarkamparDetalj, bindStillingDetaljar } from './org-shared.js'
import { printStartkort } from './startkort-print.js'

let kanal = null
let bannerSlot = null
let isAdmin = false
let visAlleRundar = false

export async function render(container, { id, isAdmin: _isAdmin = false } = {}, _bannerSlot = null) {
  bannerSlot = _bannerSlot
  isAdmin = _isAdmin
  visAlleRundar = false
  if (kanal) { supabase.removeChannel(kanal); kanal = null }
  container.innerHTML = '<p class="laster">Laster…</p>'
  await lastOgVis(container, Number(id))
}

async function lastOgVis(container, stevneid) {
  const [{ data: stevne }, { data: kamper }, { data: resultatListe }] = await Promise.all([
    supabase.from('stevne').select(`
      id, navn, erfullfort,
      kastemetode:innledendekastemetodeid(id, navn)
    `).eq('id', stevneid).single(),
    supabase.from('kamp')
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
      .order('bane_nummer'),
    supabase.from('resultat')
      .select('kasterid, startnummer, hcp')
      .eq('stevneid', stevneid),
  ])

  if (!stevne) {
    container.innerHTML = '<p class="feil">Stevne ikkje funne.</p>'
    return
  }

  const metodeNavn = stevne.kastemetode?.navn ?? ''
  const erSwiss = !metodeNavn.toLowerCase().includes('gloppen')
  const erNordhordland = metodeNavn.toLowerCase().includes('nordhordland')
  const startnrMap = Object.fromEntries((resultatListe ?? []).map(r => [r.kasterid, r.startnummer]))
  const hcpMap = Object.fromEntries((resultatListe ?? []).filter(r => r.hcp > 0).map(r => [r.kasterid, r.hcp]))

  const alleKamper = (kamper ?? []).sort(
    (a, b) => a.runde_nummer - b.runde_nummer || a.bane_nummer - b.bane_nummer
  )

  const rundeMap = new Map()
  for (const kamp of alleKamper) {
    if (!rundeMap.has(kamp.runde_nummer)) rundeMap.set(kamp.runde_nummer, [])
    rundeMap.get(kamp.runde_nummer).push(kamp)
  }

  const { spelMap, ekteKasterids } = byggInnledendeSpelMap(alleKamper, startnrMap)
  for (const r of (resultatListe ?? [])) {
    if (spelMap[r.kasterid]) spelMap[r.kasterid].hcp = r.hcp ?? 0
  }

  const stilling = sorterStilling(
    Object.values(spelMap).filter(s => ekteKasterids.has(s.kasterid)),
    alleKamper
  )

  const erAlleKamperBekreftet = alleKamper.length > 0 && alleKamper.every(k => k.er_bekreftet)

  const sisteRundeNr = rundeMap.size ? Math.max(...rundeMap.keys()) : 0
  const harFleirRundar = erNordhordland && rundeMap.size > 1
  const toggleKnappHtml = harFleirRundar
    ? `<button class="btn btn-sm btn-outline-secondary" id="toggle-rundar-btn">${visAlleRundar ? 'Skjul tidlegare rundar' : `Vis alle rundar (${rundeMap.size})`}</button>`
    : ''

  const startkortKnappHtml = isAdmin && !erSwiss
    ? `<button class="btn btn-sm btn-outline-info" id="startkort-btn">Startkort</button>`
    : ''

  bannerSlot.innerHTML = (isAdmin ? renderInnledendeKnappar(stevne, erAlleKamperBekreftet, erSwiss) : '') + startkortKnappHtml + toggleKnappHtml

  const rundarSomVisast = harFleirRundar && !visAlleRundar
    ? new Map([[sisteRundeNr, rundeMap.get(sisteRundeNr) ?? []]])
    : rundeMap

  container.innerHTML = `
    <div class="d-flex gap-3 align-items-start">
      <div class="flex-grow-1">
        ${[...rundarSomVisast.entries()].map(([nr, rKamper]) => renderRunde(nr, rKamper, startnrMap, isAdmin, hcpMap)).join('')}
      </div>
      <div class="org-stilling-sidebar">
        ${renderStilling(stilling, alleKamper, startnrMap, isAdmin, stevneid)}
      </div>
    </div>
  `

  bindStillingDetaljar(container, 'stilling-innl')

  if (isAdmin) {
    container.querySelectorAll('.stilling-hcp-celle').forEach(celle => {
      celle.addEventListener('click', async (e) => {
        e.stopPropagation()
        const kid = Number(celle.dataset.kasterid)
        const sid = Number(celle.dataset.stevneid)
        const gjeldande = (resultatListe ?? []).find(r => r.kasterid === kid)?.hcp ?? 0
        const input = prompt('Sett HCP for spelar:', String(gjeldande))
        if (input === null) return
        const nyHcp = parseInt(input, 10)
        if (isNaN(nyHcp) || nyHcp < 0) { alert('Ugyldig HCP-verdi'); return }
        const { error } = await supabase.from('resultat').update({ hcp: nyHcp }).eq('stevneid', sid).eq('kasterid', kid)
        if (error) { alert('Feil ved lagring: ' + error.message); return }
        await lastOgVis(container, stevneid)
      })
    })
  }

  bannerSlot.querySelector('#startkort-btn')?.addEventListener('click', () => {
    printStartkort(stevne, alleKamper, rundeMap, startnrMap, stilling)
  })

  bannerSlot.querySelector('#toggle-rundar-btn')?.addEventListener('click', () => {
    visAlleRundar = !visAlleRundar
    lastOgVis(container, stevneid)
  })

  bannerSlot?.querySelector('#fullfor-btn')?.addEventListener('click', () => fullforTurnering(container, stevneid))

  bannerSlot?.querySelector('#fullfør-turnering-btn')?.addEventListener('click', async () => {
    if (!confirm('Vil du fullføre turneringa? Dette kan ikkje angrast.')) return
    const { error } = await supabase.from('stevne').update({ erfullfort: true }).eq('id', stevneid)
    if (error) { alert('Feil: ' + error.message); return }
    await lastOgVis(container, stevneid)
  })

  bannerSlot?.querySelector('#test-autofullfør-btn')?.addEventListener('click', async (e) => {
    if (!confirm('Autofullfør alle ubekreftede innledande kamper?')) return
    e.currentTarget.disabled = true
    await autoFullforInnledendeKamper(stevneid)
    await lastOgVis(container, stevneid)
  })

if (erSwiss) {
  bannerSlot?.querySelector('#neste-runde-btn')?.addEventListener('click', async () => {
    if (!erAlleKamperBekreftet) {
      alert("Noen kamper er ikke bekreftet!")
      return
    }

    try {
      const { rundeNummer } = await genererNesteSwissRunde(stevneid)
      await lastOgVis(container, stevneid)
    } catch (e) {
      alert('Feil: ' + e.message)
    }
  })
}

  for (const kamp of alleKamper) {
    container.querySelector(`#plus-${kamp.id}`)?.addEventListener('click', async () => {
      const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)
      const spelarIds = [p1?.id, p2?.id].filter(Boolean)

      let harOmgangar = false
      if (spelarIds.length) {
        const { data: omg } = await supabase
          .from('kamp_omgang')
          .select('id')
          .in('kamp_spelar_id', spelarIds)
          .limit(1)
        harOmgangar = (omg?.length ?? 0) > 0
      }

      if (harOmgangar && !confirm('Dette sletter detaljar for denne kampen. Er du sikker på at du vil fortsette?')) return

      const p1Namn = p1?.kaster ? `${p1.kaster.fornavn} ${p1.kaster.etternavn}` : '—'
      const p2Namn = p2?.kaster ? `${p2.kaster.fornavn} ${p2.kaster.etternavn}` : '—'

      opnNumberpad(p1Namn, p2Namn, scoreForSp(p1), scoreForSp(p2), async (s1, s2) => {
        if (harOmgangar && spelarIds.length) {
          await supabase.from('kamp_omgang').delete().in('kamp_spelar_id', spelarIds)
        }
        const updates = []
        if (p1) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s1 }).eq('id', p1.id))
        if (p2) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s2 }).eq('id', p2.id))
        await Promise.all(updates)
        await lastOgVis(container, stevneid)
      })
    })

    container.querySelector(`#scoreboard-${kamp.id}`)?.addEventListener('click', () => {
      location.hash = `#/kamp/${kamp.id}`
    })

    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener('click', () =>
      bekreftKamp(container, stevneid, kamp, startnrMap, hcpMap)
    )

    if (isAdmin && kamp.er_bekreftet) {
      const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)
      const p1Namn = p1?.kaster ? `${p1.kaster.fornavn} ${p1.kaster.etternavn}` : '—'
      const p2Namn = p2?.kaster ? `${p2.kaster.fornavn} ${p2.kaster.etternavn}` : '—'
      const handler = () => {
        opnNumberpad(p1Namn, p2Namn, p1?.score_poeng ?? 0, p2?.score_poeng ?? 0, async (nyS1, nyS2) => {
          const [kp1, kp2] = beregnKampPoeng(nyS1, nyS2)
          const updates = []
          if (p1) updates.push(supabase.from('kamp_spelar').update({ score_poeng: nyS1, kamp_poeng: kp1 }).eq('id', p1.id))
          if (p2) updates.push(supabase.from('kamp_spelar').update({ score_poeng: nyS2, kamp_poeng: kp2 }).eq('id', p2.id))
          const results = await Promise.all(updates)
          const dbErr = results.find(r => r.error)?.error
          if (dbErr) { alert('DB-feil: ' + dbErr.message); return }
          const kasterids = [p1?.kasterid, p2?.kasterid].filter(Boolean)
          await oppdaterResultatInnl(stevneid, kasterids, kamp.fase)
          await lastOgVis(container, stevneid)
        })
      }
      container.querySelectorAll(`[data-endre-score="${kamp.id}"]`).forEach(celle => celle.addEventListener('click', handler))
    }
  }

  abonnerPaaEndringar(container, stevneid)
}

function abonnerPaaEndringar(container, stevneid) {
  if (kanal) return
  const onEndring = lagOnEndringHandler(stevneid, ['innledende'], container, lastOgVis, () => {
    supabase.removeChannel(kanal); kanal = null
  })
  kanal = supabase
    .channel(`stevne-innl-${stevneid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' }, onEndring)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp' }, (payload) => {
      const sid = payload.new?.stevneid ?? payload.old?.stevneid
      if (sid === stevneid) onEndring()
    })
    .subscribe()
}

function renderRunde(nr, kamper, startnrMap, isAdmin, hcpMap = {}) {
  return `
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${nr}</h6>
      <table class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>P1</th>
            <th class="th-48 text-center">S1</th>
            <th class="th-48 text-center">S2</th>
            <th>P2</th>
            ${isAdmin ? '<th class="th-148"></th>' : '<th class="th-48"></th>'}
          </tr>
        </thead>
        <tbody>
          ${kamper.map(k => kampRad(k, startnrMap, isAdmin, hcpMap)).join('')}
        </tbody>
      </table>
    </div>`
}

function kampRad(kamp, startnrMap, isAdmin = true, hcpMap = {}) {
  const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)

  const p1Nr = p1?.kasterid ? (startnrMap[p1.kasterid] ?? '') : ''
  const p2Nr = p2?.kasterid ? (startnrMap[p2.kasterid] ?? '') : ''

  const p1Namn = p1?.kaster ? `${p1.kaster.fornavn} ${p1.kaster.etternavn}` : '—'
  const p2ErBye = kamp.er_walkover && !p2?.kaster
  const p2Namn = p2ErBye ? 'Walkover' : (p2?.kaster ? `${p2.kaster.fornavn} ${p2.kaster.etternavn}` : '—')

  const p1Vis = p1Nr ? `${p1Namn} (${p1Nr})` : p1Namn
  const p2Vis = p2ErBye
    ? (p2Nr ? `Walkover (${p2Nr})` : 'Walkover')
    : (p2Nr ? `${p2Namn} (${p2Nr})` : p2Namn)

  const harOmg1 = (p1?.omgangar?.length ?? 0) > 0
  const harOmg2 = (p2?.omgangar?.length ?? 0) > 0
  const harOmgangar = harOmg1 || harOmg2
  const hcp1 = hcpMap[p1?.kasterid] ?? 0
  const hcp2 = hcpMap[p2?.kasterid] ?? 0

  // Bekreftede kampar: bruk score_poeng (inkluderer hcp)
  // Ubekreftede med omgangar: råsum + hcp
  // Ubekreftede utan omgangar: score_poeng frå numberpad (allereie effektiv)
  const s1Raw = kamp.er_bekreftet ? (p1?.score_poeng ?? 0) : (scoreForSp(p1) + (harOmg1 ? hcp1 : 0))
  const s2Raw = kamp.er_bekreftet ? (p2?.score_poeng ?? 0) : (scoreForSp(p2) + (harOmg2 ? hcp2 : 0))

  const erUbekreftaWalkover = kamp.er_walkover && !kamp.er_bekreftet
  const s1 = erUbekreftaWalkover ? 21 : s1Raw
  const s2 = erUbekreftaWalkover ? 0 : s2Raw

  const harPoeng = kamp.er_bekreftet || kamp.er_walkover || harOmgangar || s1Raw > 0 || s2Raw > 0

  const kanBekrefte = !kamp.er_bekreftet && (kamp.er_walkover || (!harOmgangar && (s1 + hcp1 >= 21 || s2 + hcp2 >= 21)))
  const bekrfKlass = kamp.er_bekreftet || kanBekrefte ? 'btn-success' : 'btn-outline-secondary'
  const bekrfDisabled = kamp.er_bekreftet || !kanBekrefte ? ' disabled' : ''
  const scoreboardDisabled = kamp.er_bekreftet && !harOmgangar ? ' disabled' : ''
  const scoreEndrAttr = isAdmin && kamp.er_bekreftet ? ` data-endre-score="${kamp.id}" class="text-center score-redigerbar"` : ' class="text-center"'
  return `
    <tr>
      <td class="text-center">${kamp.bane_nummer ?? ''}</td>
      <td>${p1Vis}</td>
      <td${scoreEndrAttr}>${harPoeng ? s1 : ''}</td>
      <td${scoreEndrAttr}>${harPoeng ? s2 : ''}</td>
      <td>${p2Vis}</td>
      <td class="text-end pe-2">
        ${isAdmin ? `<button class="btn btn-primary btn-sm" id="plus-${kamp.id}"${kamp.er_bekreftet ? ' disabled' : ''}>+</button>` : ''}
        <button class="btn btn-secondary btn-sm" id="scoreboard-${kamp.id}" data-bane="${kamp.bane_nummer ?? ''}" title="Scoreboard"${scoreboardDisabled}>S</button>
        ${isAdmin ? `<button class="btn ${bekrfKlass} btn-sm" id="bekrft-${kamp.id}"${bekrfDisabled}>Bekreft</button>` : ''}
      </td>
    </tr>`
}

function renderStilling(stilling, alleKamper, startnrMap, isAdmin = false, stevneid = null) {
  const harHcp = isAdmin || stilling.some(s => (s.hcp ?? 0) > 0)
  const colspan = harHcp ? 7 : 6
  return `
    <div>
      <h6 class="text-center fw-bold mb-1">${stilling.length} spelarar</h6>
      <table id="stilling-innl" class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-32">#</th>
            <th class="th-32">S</th>
            <th>NAMN</th>
            <th class="th-50 text-center">ANT.</th>
            <th class="th-44 text-center">KP</th>
            <th class="th-44 text-center">SP</th>
            ${harHcp ? '<th class="th-44 text-center">HCP</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${stilling.map((s, i) => {
            const hcp = s.hcp ?? 0
            const hcpCelle = harHcp
              ? (isAdmin
                ? `<td class="text-center stilling-hcp-celle" data-kasterid="${s.kasterid}" data-stevneid="${stevneid}">${hcp > 0 ? hcp : '—'}</td>`
                : `<td class="text-center">${hcp > 0 ? hcp : '—'}</td>`)
              : ''
            return `
            <tr data-kasterid="${s.kasterid}" class="stilling-spelar-rad">
              <td>${i + 1}</td>
              <td>${s.startnummer ?? ''}</td>
              <td>${s.namn}</td>
              <td class="text-center">${s.antall_kamper}</td>
              <td class="text-center">${s.kamp_poeng}</td>
              <td class="text-center">${s.score_poeng}</td>
              ${hcpCelle}
            </tr>
            <tr class="stilling-detalj" data-kasterid="${s.kasterid}" hidden>
              <td colspan="${colspan}" class="p-0">
                <table class="stilling-detalj-tabell table table-sm table-bordered mb-0">
                  <thead><tr>
                    <th class="text-center">Runde</th>
                    <th class="text-center">Bane</th>
                    <th>Motstandar</th>
                    <th class="text-center">Resultat</th>
                  </tr></thead>
                  <tbody>${renderSpelarkamparDetalj(s.kasterid, alleKamper, startnrMap)}</tbody>
                </table>
              </td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>`
}

async function bekreftKamp(container, stevneid, kamp, startnrMap, hcpMap = {}) {
  const { data: spelarar, error: spErr } = await supabase
    .from('kamp_spelar')
    .select(`
      id, kasterid, score_poeng, antall_ringer, posisjon,
      omgangar:kamp_omgang(score, antall_ringer)
    `)
    .eq('kampid', kamp.id)

  if (spErr) { alert('Feil ved henting av kampdata: ' + spErr.message); return }

  const [p1, p2] = hentP1P2(spelarar ?? [], startnrMap)
  const hcp1 = hcpMap[p1?.kasterid] ?? 0
  const hcp2 = hcpMap[p2?.kasterid] ?? 0

  // Når omgangar finst (scoreboard-veg), er scoreForSp råscore → legg til hcp
  // Utan omgangar (numberpad-veg), er scoreForSp allereie effektiv score
  const harOmg1 = (p1?.omgangar?.length ?? 0) > 0
  const harOmg2 = (p2?.omgangar?.length ?? 0) > 0
  const s1 = kamp.er_walkover ? 21 : (scoreForSp(p1) + (harOmg1 ? hcp1 : 0))
  const s2 = kamp.er_walkover ? 0 : (scoreForSp(p2) + (harOmg2 ? hcp2 : 0))
  const r1 = kamp.er_walkover ? 0 : ringerForSp(p1)
  const r2 = 0

  const [kp1, kp2] = beregnKampPoeng(s1, s2)

  const updates = [supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kamp.id)]
  if (p1) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s1, kamp_poeng: kp1, antall_ringer: r1 }).eq('id', p1.id))
  if (p2) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s2, kamp_poeng: kp2, antall_ringer: r2 }).eq('id', p2.id))

  const dbResultat = await Promise.all(updates)
  const dbErr = dbResultat.find(r => r.error)?.error
  if (dbErr) { alert('DB-feil: ' + dbErr.message); return }

  const kasterids = [p1?.kasterid, p2?.kasterid].filter(Boolean)
  await oppdaterResultatInnl(stevneid, kasterids, kamp.fase)

  await lastOgVis(container, stevneid)
}

async function fullforTurnering(container, stevneid) {
  if (!confirm('Start avsluttande fase?')) return
  const { error } = await supabase.from('stevne').update({ stevne_fase: 'avsluttende' }).eq('id', stevneid)
  if (error) { alert('Feil: ' + error.message); return }
  location.hash = `#/stevne/${stevneid}/organizer/avsluttende`
}
