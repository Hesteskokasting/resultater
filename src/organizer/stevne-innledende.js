import { supabase } from '../supabase.js'
import { opnNumberpad } from './score-numberpad.js'
import { beregnKampPoeng, hentP1P2, scoreForSp, ringerForSp, oppdaterResultatInnl } from '../utils/kamp.js'
import { renderOrgNav } from './org-nav.js'
import { genererNesteSwissRunde } from './kampgenerering-db.js'
import { autoFullforInnledendeKamper, slettKamperForFase, settStevneFaseTilIkkeStartet } from '../utils/organizer-test-utils.js'
import { renderOrgBanner, byggInnledendeSpelMap, sorterStilling } from './org-shared.js'

let kanal = null

export async function render(container, { id } = {}) {
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
          kaster:kasterid(id, fornavn, etternavn),
          omgangar:kamp_omgang(score, antall_ringer)
        )
      `)
      .eq('stevneid', stevneid)
      .eq('fase', 'innledende')
      .order('runde_nummer')
      .order('bane_nummer'),
    supabase.from('resultat')
      .select('kasterid, startnummer')
      .eq('stevneid', stevneid),
  ])

  if (!stevne) {
    container.innerHTML = '<p class="feil">Stevne ikkje funne.</p>'
    return
  }

  const metodeNavn = stevne.kastemetode?.navn ?? ''
  const erSwiss = !metodeNavn.toLowerCase().includes('gloppen')
  const startnrMap = Object.fromEntries((resultatListe ?? []).map(r => [r.kasterid, r.startnummer]))

  const alleKamper = (kamper ?? []).sort(
    (a, b) => a.runde_nummer - b.runde_nummer || a.bane_nummer - b.bane_nummer
  )

  const rundeMap = new Map()
  for (const kamp of alleKamper) {
    if (!rundeMap.has(kamp.runde_nummer)) rundeMap.set(kamp.runde_nummer, [])
    rundeMap.get(kamp.runde_nummer).push(kamp)
  }

  const { spelMap, ekteKasterids } = byggInnledendeSpelMap(alleKamper, startnrMap)

  const stilling = sorterStilling(
    Object.values(spelMap).filter(s => ekteKasterids.has(s.kasterid)),
    alleKamper
  )

  const erAlleKamperBekreftet = alleKamper.length > 0 && alleKamper.every(k => k.er_bekreftet)

  const knapperHtml = `
    ${erSwiss ? `<button id="neste-runde-btn" class="btn btn-sm btn-warning"${stevne.erfullfort || !erAlleKamperBekreftet ? ' disabled' : ''}>Generer neste runde</button>` : ''}
    <button id="fullfor-btn" class="btn btn-sm btn-primary"${stevne.erfullfort || !erAlleKamperBekreftet ? ' disabled' : ''}>Fullfør turnering</button>
    <button id="test-autofullfør-btn" class="btn btn-sm btn-outline-warning">TEST: Autofullfør</button>
    <button id="test-slett-btn" class="btn btn-sm btn-outline-danger">TEST: Slett kamper</button>
    <button id="test-fase-ikkestartet-btn" class="btn btn-sm btn-outline-secondary">TEST: Fase → ikke_startet</button>
  `

  container.innerHTML = `
    <div class="px-3 py-2">
      ${renderOrgNav(stevneid, 'innledende')}
      ${renderOrgBanner(stevne.navn, knapperHtml)}
      <div class="d-flex gap-3 align-items-start">
        <div class="flex-grow-1">
          ${[...rundeMap.entries()].map(([nr, rKamper]) => renderRunde(nr, rKamper, startnrMap)).join('')}
        </div>
        <div class="org-stilling-sidebar">
          ${renderStilling(stilling)}
        </div>
      </div>
    </div>
  `

  container.querySelector('#fullfor-btn').addEventListener('click', () => fullforTurnering(container, stevneid))

  container.querySelector('#test-autofullfør-btn')?.addEventListener('click', async (e) => {
    if (!confirm('Autofullfør alle ubekreftede innledande kamper?')) return
    e.currentTarget.disabled = true
    await autoFullforInnledendeKamper(stevneid)
    await lastOgVis(container, stevneid)
  })

  container.querySelector('#test-slett-btn')?.addEventListener('click', async (e) => {
    if (!confirm('Slett alle innledande kamper?')) return
    e.currentTarget.disabled = true
    await slettKamperForFase(stevneid, 'innledende')
    await lastOgVis(container, stevneid)
  })

  container.querySelector('#test-fase-ikkestartet-btn')?.addEventListener('click', async (e) => {
    if (!confirm('Sett stevne_fase til "ikke_startet"?')) return
    e.currentTarget.disabled = true
    await settStevneFaseTilIkkeStartet(stevneid)
    await lastOgVis(container, stevneid)
  })

  if (erSwiss) {
    container.querySelector('#neste-runde-btn')?.addEventListener('click', async () => {
      try {
        const { rundeNummer } = await genererNesteSwissRunde(stevneid)
        await lastOgVis(container, stevneid)
        alert(`Runde ${rundeNummer} er generert.`)
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
      bekreftKamp(container, stevneid, kamp, startnrMap)
    )
  }

  if (!kanal) {
    kanal = supabase
      .channel(`stevne-innl-${stevneid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kamp_omgang' },
                () => {
      if (location.hash === `#/stevne/${stevneid}/organizer/innledende`) {
        lastOgVis(container, stevneid)
      } else {
        supabase.removeChannel(kanal)
        kanal = null
      }
    }
      )
      .subscribe()
  }
}

function renderRunde(nr, kamper, startnrMap) {
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
            <th class="th-148"></th>
          </tr>
        </thead>
        <tbody>
          ${kamper.map(k => kampRad(k, startnrMap)).join('')}
        </tbody>
      </table>
    </div>`
}

function kampRad(kamp, startnrMap) {
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

  const s1Raw = scoreForSp(p1)
  const s2Raw = scoreForSp(p2)
  const erUbekreftaWalkover = kamp.er_walkover && !kamp.er_bekreftet
  const s1 = erUbekreftaWalkover ? 21 : s1Raw
  const s2 = erUbekreftaWalkover ? 0 : s2Raw

  const harPoeng = kamp.er_bekreftet || kamp.er_walkover
    || (p1?.omgangar?.length ?? 0) > 0 || (p2?.omgangar?.length ?? 0) > 0
    || s1Raw > 0 || s2Raw > 0

  const harOmgangar = (p1?.omgangar?.length ?? 0) > 0 || (p2?.omgangar?.length ?? 0) > 0
  const kanBekrefte = !kamp.er_bekreftet && (kamp.er_walkover || (!harOmgangar && (s1 >= 21 || s2 >= 21)))
  const bekrfKlass = kamp.er_bekreftet || kanBekrefte ? 'btn-success' : 'btn-outline-secondary'
  const bekrfDisabled = kamp.er_bekreftet || !kanBekrefte ? ' disabled' : ''
  const scoreboardDisabled = kamp.er_bekreftet && !harOmgangar ? ' disabled' : ''
  return `
    <tr>
      <td class="text-center">${kamp.bane_nummer ?? ''}</td>
      <td>${p1Vis}</td>
      <td class="text-center">${harPoeng ? s1 : ''}</td>
      <td class="text-center">${harPoeng ? s2 : ''}</td>
      <td>${p2Vis}</td>
      <td class="text-end pe-2">
        <button class="btn btn-primary btn-sm" id="plus-${kamp.id}"${kamp.er_bekreftet ? ' disabled' : ''}>+</button>
        <button class="btn btn-secondary btn-sm" id="scoreboard-${kamp.id}" data-bane="${kamp.bane_nummer ?? ''}" title="Scoreboard"${scoreboardDisabled}>S</button>
        <button class="btn ${bekrfKlass} btn-sm" id="bekrft-${kamp.id}"${bekrfDisabled}>Bekreft</button>
      </td>
    </tr>`
}

function renderStilling(stilling) {
  return `
    <div>
      <h6 class="text-center fw-bold mb-1">${stilling.length} spelarar</h6>
      <table class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-32">#</th>
            <th class="th-32">S</th>
            <th>NAMN</th>
            <th class="th-50 text-center">ANT.</th>
            <th class="th-44 text-center">KP</th>
            <th class="th-44 text-center">SP</th>
          </tr>
        </thead>
        <tbody>
          ${stilling.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${s.startnummer ?? ''}</td>
              <td>${s.namn}</td>
              <td class="text-center">${s.antall_kamper}</td>
              <td class="text-center">${s.kamp_poeng}</td>
              <td class="text-center">${s.score_poeng}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`
}

async function bekreftKamp(container, stevneid, kamp, startnrMap) {
  const { data: spelarar, error: spErr } = await supabase
    .from('kamp_spelar')
    .select(`
      id, kasterid, score_poeng, antall_ringer, posisjon,
      omgangar:kamp_omgang(score, antall_ringer)
    `)
    .eq('kampid', kamp.id)

  if (spErr) { alert('Feil ved henting av kampdata: ' + spErr.message); return }

  const [p1, p2] = hentP1P2(spelarar ?? [], startnrMap)

  const s1 = kamp.er_walkover ? 21 : scoreForSp(p1)
  const s2 = kamp.er_walkover ? 0 : scoreForSp(p2)
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
  if (!confirm('Vil du fullføre turneringa? Dette kan ikkje angrast.')) return
  await supabase.from('stevne').update({ erfullfort: true }).eq('id', stevneid)
  await lastOgVis(container, stevneid)
}
