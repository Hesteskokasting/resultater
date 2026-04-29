import { supabase } from '../supabase.js'

let kanal = null

export async function render(container, { id } = {}) {
  if (kanal) { supabase.removeChannel(kanal); kanal = null }
  container.innerHTML = '<p style="text-align:center;margin-top:40px;">Laster…</p>'
  await lastOgVis(container, Number(id))
}

async function lastOgVis(container, stevneid) {
  const [{ data: stevne }, { data: kamper }, { data: resultatListe }] = await Promise.all([
    supabase.from('stevne').select('id, navn, erfullfort').eq('id', stevneid).single(),
    supabase.from('kamp')
      .select(`
        id, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
        spelarar:kamp_spelar(
          id, kasterid, score_poeng, kamp_poeng, antall_ringer, posisjon,
          kaster:kasterid(id, fornavn, etternavn),
          omgangar:kamp_omgang(score, antall_ringer)
        )
      `)
      .eq('stevneid', stevneid)
      .order('runde_nummer')
      .order('bane_nummer'),
    supabase.from('resultat')
      .select('kasterid, startnummer')
      .eq('stevneid', stevneid),
  ])

  if (!stevne) {
    container.innerHTML = '<p style="text-align:center;margin-top:40px;color:red;">Stevne ikkje funne.</p>'
    return
  }

  const startnrMap = Object.fromEntries((resultatListe ?? []).map(r => [r.kasterid, r.startnummer]))

  const alleKamper = (kamper ?? []).sort(
    (a, b) => a.runde_nummer - b.runde_nummer || a.bane_nummer - b.bane_nummer
  )

  const rundeMap = new Map()
  for (const kamp of alleKamper) {
    if (!rundeMap.has(kamp.runde_nummer)) rundeMap.set(kamp.runde_nummer, [])
    rundeMap.get(kamp.runde_nummer).push(kamp)
  }

  const spelMap = {}
  const ekteKasterids = new Set()

  for (const kamp of alleKamper) {
    const [, byeP2] = kamp.er_walkover ? hentP1P2(kamp.spelarar, startnrMap) : []
    for (const sp of kamp.spelarar ?? []) {
      if (!sp.kasterid || !sp.kaster) continue
      if (kamp.er_walkover && sp.kasterid === byeP2?.kasterid) continue
      ekteKasterids.add(sp.kasterid)
      if (!spelMap[sp.kasterid]) {
        spelMap[sp.kasterid] = {
          kasterid: sp.kasterid,
          namn: `${sp.kaster.fornavn} ${sp.kaster.etternavn}`,
          startnummer: startnrMap[sp.kasterid] ?? null,
          kamp_poeng: 0,
          score_poeng: 0,
          antall_ringer: 0,
        }
      }
      if (kamp.er_bekreftet) {
        spelMap[sp.kasterid].kamp_poeng += sp.kamp_poeng
        spelMap[sp.kasterid].score_poeng += sp.score_poeng
        spelMap[sp.kasterid].antall_ringer += sp.antall_ringer
      }
    }
  }

  const stilling = Object.values(spelMap)
    .filter(s => ekteKasterids.has(s.kasterid))
    .sort((a, b) => b.kamp_poeng - a.kamp_poeng || b.score_poeng - a.score_poeng)

  container.innerHTML = `
    <div>
      <div class="d-flex align-items-center gap-2 px-3 py-2" style="background:#1e4976;color:white">
        <h5 class="mb-0 flex-grow-1">${stevne.navn}</h5>
        <button id="fullfor-btn" class="btn btn-sm btn-primary"${stevne.erfullfort ? ' disabled' : ''}>Fullfør turnering</button>
      </div>
      <div class="d-flex gap-3 p-3 align-items-start">
        <div class="flex-grow-1">
          ${[...rundeMap.entries()].map(([nr, rKamper]) => renderRunde(nr, rKamper, startnrMap)).join('')}
        </div>
        <div style="width:400px;flex-shrink:0">
          ${renderStilling(stilling)}
        </div>
      </div>
    </div>
    <div class="modal fade" id="score-modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Registrer poeng</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="score-modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Avbryt</button>
            <button type="button" class="btn btn-primary" id="score-lagre-btn">Lagre</button>
          </div>
        </div>
      </div>
    </div>`

  container.querySelector('#fullfor-btn').addEventListener('click', () => fullforTurnering(container, stevneid))

  for (const kamp of alleKamper) {
    container.querySelector(`#plus-${kamp.id}`)?.addEventListener('click', () =>
      opnScoreModal(container, kamp, startnrMap, stevneid)
    )
    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener('click', () =>
      bekreftKamp(container, stevneid, kamp, startnrMap)
    )
  }

  if (!kanal) {
    kanal = supabase
      .channel(`stevne-${stevneid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kamp_omgang' },
        () => lastOgVis(container, stevneid)
      )
      .subscribe()
  }
}

function scoreForSp(sp) {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.score ?? 0), 0)
  return sp?.score_poeng ?? 0
}

function ringerForSp(sp) {
  if (sp?.omgangar?.length) return sp.omgangar.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0)
  return sp?.antall_ringer ?? 0
}

function renderRunde(nr, kamper, startnrMap) {
  return `
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${nr}</h6>
      <table class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th style="width:36px" class="text-center">B</th>
            <th>P1</th>
            <th style="width:48px" class="text-center">S1</th>
            <th style="width:48px" class="text-center">S2</th>
            <th>P2</th>
            <th style="width:120px"></th>
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

  const s1 = scoreForSp(p1)
  const s2 = scoreForSp(p2)

  const harPoeng = kamp.er_bekreftet || kamp.er_walkover
    || (p1?.omgangar?.length ?? 0) > 0 || (p2?.omgangar?.length ?? 0) > 0
    || s1 > 0 || s2 > 0

  const kanBekrefte = !kamp.er_bekreftet && (harPoeng || kamp.er_walkover)
  const bekrfKlass = kamp.er_bekreftet || kanBekrefte ? 'btn-success' : 'btn-outline-secondary'
  const bekrfDisabled = kamp.er_bekreftet || !kanBekrefte ? ' disabled' : ''

  return `
    <tr>
      <td class="text-center">${kamp.bane_nummer ?? ''}</td>
      <td>${p1Vis}</td>
      <td class="text-center">${harPoeng ? s1 : ''}</td>
      <td class="text-center">${harPoeng ? s2 : ''}</td>
      <td>${p2Vis}</td>
      <td class="text-end pe-2">
        <button class="btn btn-primary btn-sm" id="plus-${kamp.id}"${kamp.er_bekreftet ? ' disabled' : ''}>+</button>
        <button class="btn ${bekrfKlass} btn-sm" id="bekrft-${kamp.id}"${bekrfDisabled}>Bekreftet</button>
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
            <th style="width:32px">#</th>
            <th style="width:32px">S</th>
            <th>NAMN</th>
            <th style="width:50px" class="text-center">ANT.</th>
            <th style="width:44px" class="text-center">KP</th>
            <th style="width:44px" class="text-center">SP</th>
          </tr>
        </thead>
        <tbody>
          ${stilling.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${s.startnummer ?? ''}</td>
              <td>${s.namn}</td>
              <td class="text-center">${s.antall_ringer}</td>
              <td class="text-center">${s.kamp_poeng}</td>
              <td class="text-center">${s.score_poeng}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`
}

function opnScoreModal(container, kamp, startnrMap, stevneid) {
  const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)

  const p1Namn = p1?.kaster ? `${p1.kaster.fornavn} ${p1.kaster.etternavn}` : '—'
  const p2Namn = kamp.er_walkover && !p2?.kaster ? 'Walkover' : (p2?.kaster ? `${p2.kaster.fornavn} ${p2.kaster.etternavn}` : '—')

  const body = container.querySelector('#score-modal-body')
  body.innerHTML = `
    <div class="mb-3">
      <label class="form-label fw-bold">${p1Namn}</label>
      <input type="number" class="form-control" id="s1-input" value="${scoreForSp(p1)}" min="0">
    </div>
    <div>
      <label class="form-label fw-bold">${p2Namn}</label>
      <input type="number" class="form-control" id="s2-input" value="${scoreForSp(p2)}" min="0">
    </div>`

  const modal = new bootstrap.Modal(container.querySelector('#score-modal'))
  modal.show()

  const gamleLagreBtn = container.querySelector('#score-lagre-btn')
  const nyLagreBtn = gamleLagreBtn.cloneNode(true)
  gamleLagreBtn.replaceWith(nyLagreBtn)

  nyLagreBtn.addEventListener('click', async () => {
    const s1 = Number(body.querySelector('#s1-input').value)
    const s2 = Number(body.querySelector('#s2-input').value)

    const updates = []
    if (p1) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s1 }).eq('id', p1.id))
    if (p2) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s2 }).eq('id', p2.id))
    await Promise.all(updates)

    modal.hide()
    await lastOgVis(container, stevneid)
  })
}

async function bekreftKamp(container, stevneid, kamp, startnrMap) {
  // Alltid hent ferske data — unngår å bruke foreldra klosyre-data
  const { data: spelarar, error: spErr } = await supabase
    .from('kamp_spelar')
    .select(`
      id, kasterid, score_poeng, antall_ringer, posisjon,
      omgangar:kamp_omgang(score, antall_ringer)
    `)
    .eq('kampid', kamp.id)

  if (spErr) { alert('Feil ved henting av kampdata: ' + spErr.message); return }

  const [p1, p2] = hentP1P2(spelarar ?? [], startnrMap)

  const s1 = scoreForSp(p1)
  const s2 = scoreForSp(p2)
  const r1 = ringerForSp(p1)
  const r2 = ringerForSp(p2)

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

function beregnKampPoeng(s1, s2) {
  if (s1 === s2) return [1.5, 1.5]
  if (s1 > s2) return [2, s2 >= 11 ? 1 : 0]
  return [s1 >= 11 ? 1 : 0, 2]
}

async function oppdaterResultatInnl(stevneid, kasterids, fase) {
  const { data: kamper } = await supabase
    .from('kamp')
    .select('id')
    .eq('stevneid', stevneid)
    .eq('er_bekreftet', true)
    .eq('fase', fase)

  const kampids = (kamper ?? []).map(k => k.id)
  if (!kampids.length) return

  for (const kasterid of kasterids) {
    const { data } = await supabase
      .from('kamp_spelar')
      .select('score_poeng, kamp_poeng')
      .eq('kasterid', kasterid)
      .in('kampid', kampids)

    const scoreInnl = (data ?? []).reduce((s, r) => s + r.score_poeng, 0)
    const kampInnl = (data ?? []).reduce((s, r) => s + r.kamp_poeng, 0)

    await supabase.from('resultat')
      .update({ score_poeng_innl: scoreInnl, kamp_poeng_innl: kampInnl })
      .eq('stevneid', stevneid)
      .eq('kasterid', kasterid)
  }
}

function hentP1P2(spelarar, startnrMap) {
  const sp = spelarar ?? []
  if (sp.some(s => s.posisjon != null)) {
    return [sp.find(s => s.posisjon === 1) ?? null, sp.find(s => s.posisjon === 2) ?? null]
  }
  const sorted = [...sp].sort(
    (a, b) => (startnrMap[a.kasterid] ?? Infinity) - (startnrMap[b.kasterid] ?? Infinity)
  )
  return [sorted[0] ?? null, sorted[1] ?? null]
}

async function fullforTurnering(container, stevneid) {
  if (!confirm('Vil du fullføre turneringa? Dette kan ikkje angrast.')) return
  await supabase.from('stevne').update({ erfullfort: true }).eq('id', stevneid)
  await lastOgVis(container, stevneid)
}
