import { supabase } from '../supabase.js'

let cachedKasterPlayers = []

async function loadKasterPlayers() {
  const { data, error } = await supabase
    .from('kaster')
    .select('*, klubb(navn)')
    .eq('eraktiv', true)
  if (error) { console.error('Feil ved henting av kastere:', error); return [] }
  cachedKasterPlayers = data
  return data
}

function kasterNavn(p) {
  return `${p.fornavn} ${p.etternavn}`
}

function sortKastere(players) {
  return [...players].sort((a, b) => {
    const klubbA = (a.klubbid || '').toString()
    const klubbB = (b.klubbid || '').toString()
    if (klubbA !== klubbB) return klubbA.localeCompare(klubbB)
    const etternavnCmp = (a.etternavn || '').localeCompare(b.etternavn || '')
    if (etternavnCmp !== 0) return etternavnCmp
    return (a.fornavn || '').localeCompare(b.fornavn || '')
  })
}

function filterDatabasePlayers(players, search, selectedIds) {
  const q = search.toLowerCase()
  return players.filter(p => {
    if (selectedIds.has(p.id)) return false
    return !q || kasterNavn(p).toLowerCase().includes(q) || p.klubb?.navn?.toLowerCase().includes(q)
  })
}

function createPlayerColumn(title) {
  const column = document.createElement('div')

  const titleEl = document.createElement('h6')
  titleEl.textContent = title
  titleEl.className = 'fw-bold mb-1'

  const tableWrapper = document.createElement('div')
  tableWrapper.className = 'border rounded deltaker-tabell-wrapper'

  const table = document.createElement('table')
  table.className = 'table table-sm table-hover table-bordered mb-0'

  tableWrapper.appendChild(table)
  column.appendChild(titleEl)
  column.appendChild(tableWrapper)
  return { column, table, titleEl }
}

function createSelectedPlayerRow(player, onRemove, disabled = false) {
  const row = document.createElement('tr')

  const playerCell = document.createElement('td')
  playerCell.textContent = kasterNavn(player)

  const clubCell = document.createElement('td')
  clubCell.textContent = player.klubb?.navn ?? ''

  const actionCell = document.createElement('td')
  actionCell.className = 'text-center th-40'

  if (!disabled) {
    const removeBtn = document.createElement('button')
    removeBtn.innerHTML = '&times;'
    removeBtn.className = 'btn btn-danger btn-sm rounded-circle p-0 lh-1 deltaker-fjern-btn'
    removeBtn.title = 'Fjern spelar'
    removeBtn.addEventListener('click', (e) => { e.stopPropagation(); onRemove(player) })
    actionCell.appendChild(removeBtn)
    row.classList.add('deltaker-rad')
    row.addEventListener('click', (e) => { if (e.target !== removeBtn) onRemove(player) })
  }

  row.appendChild(playerCell)
  row.appendChild(clubCell)
  row.appendChild(actionCell)
  return row
}

function createAvailablePlayerRow(player, onSelect, disabled = false) {
  const row = document.createElement('tr')

  const playerCell = document.createElement('td')
  playerCell.textContent = kasterNavn(player)

  const clubCell = document.createElement('td')
  clubCell.textContent = player.klubb?.navn ?? 'Ingen klubb'

  if (!disabled) {
    row.classList.add('deltaker-rad')
    row.addEventListener('click', () => onSelect(player))
  }

  row.appendChild(playerCell)
  row.appendChild(clubCell)
  return row
}

function createEmptyRow(message) {
  const row = document.createElement('tr')
  const cell = document.createElement('td')
  cell.className = 'text-center text-muted fst-italic py-3'
  cell.textContent = message
  cell.colSpan = 3
  row.appendChild(cell)
  return row
}

export async function render(container, { id } = {}, bannerSlot = null) {
  const stevneid = Number(id)
  container.innerHTML = '<p class="laster">Laster…</p>'

  const [{ data: stevne }, { data: pameldingar }] = await Promise.all([
    supabase.from('stevne').select('id, navn, stevne_fase').eq('id', stevneid).single(),
    supabase.from('pamelding')
      .select('id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubbid, klubb:klubbid(navn))')
      .eq('stevneid', stevneid)
      .order('id'),
  ])
  await loadKasterPlayers()

  if (!stevne) {
    container.innerHTML = '<p class="feil">Stevne ikkje funne.</p>'
    return
  }

  const fase = stevne.stevne_fase ?? null
  const kanEndrast = bannerSlot !== null && (fase === null || fase === 'ikke_startet')
  const alleSpelarar = cachedKasterPlayers
  const pameldtIds = new Set((pameldingar ?? []).map(p => p.kasterid))

  container.innerHTML = `
    <div>
      <h4 class="mb-2">${stevne.navn} — Spelarar</h4>
      ${!kanEndrast ? `<div class="alert alert-warning py-2">Spelarar kan ikkje endrast etter at stevnet er starta.</div>` : ''}
      <div class="row g-3" id="spelarar-layout"></div>
    </div>
  `

  const layout = container.querySelector('#spelarar-layout')

  const venstreWrapper = document.createElement('div')
  venstreWrapper.className = 'col-md-6'
  const søkInput = document.createElement('input')
  søkInput.type = 'text'
  søkInput.placeholder = 'Søk etter namn eller klubb…'
  søkInput.className = 'form-control mb-2'
  const { column: venstreKol, table: tilgjengeliListe } = createPlayerColumn('Tilgjengelege spelarar')
  venstreWrapper.appendChild(søkInput)
  venstreWrapper.appendChild(venstreKol)
  layout.appendChild(venstreWrapper)

  const høgreWrapper = document.createElement('div')
  høgreWrapper.className = 'col-md-6'
  const { column: høgreKol, table: pameldtListe, titleEl: pameldtTittel } = createPlayerColumn('Påmelde spelarar')
  høgreWrapper.appendChild(høgreKol)
  layout.appendChild(høgreWrapper)

  function renderPameldtListe() {
    pameldtListe.innerHTML = ''
    const lista = sortKastere(alleSpelarar.filter(p => pameldtIds.has(p.id)))
    pameldtTittel.textContent = `Påmelde spelarar: ${lista.length}`
    if (!lista.length) { pameldtListe.appendChild(createEmptyRow('Ingen spelarar påmelde')); return }
    for (const sp of lista) {
      pameldtListe.appendChild(createSelectedPlayerRow(sp, async (s) => {
        await fjernSpelar(stevneid, s.id)
        pameldtIds.delete(s.id)
        renderPameldtListe()
        renderTilgjengeliListe()
      }, !kanEndrast))
    }
  }

  function renderTilgjengeliListe() {
    const filtrert = sortKastere(filterDatabasePlayers(alleSpelarar, søkInput.value, pameldtIds))
    tilgjengeliListe.innerHTML = ''
    if (!filtrert.length) { tilgjengeliListe.appendChild(createEmptyRow('Ingen spelarar funne')); return }
    for (const sp of filtrert) {
      tilgjengeliListe.appendChild(createAvailablePlayerRow(sp, async (s) => {
        await leggTilSpelar(stevneid, s.id)
        pameldtIds.add(s.id)
        renderPameldtListe()
        renderTilgjengeliListe()
      }, !kanEndrast))
    }
  }

  søkInput.addEventListener('input', renderTilgjengeliListe)
  renderPameldtListe()
  renderTilgjengeliListe()
}

async function leggTilSpelar(stevneid, kasterid) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('pamelding').insert({
    stevneid,
    kasterid,
    ...(user ? { bruker_id: user.id } : {}),
  })
  if (error) alert('Feil ved innmelding: ' + error.message)
}

async function fjernSpelar(stevneid, kasterid) {
  const { error } = await supabase
    .from('pamelding')
    .delete()
    .eq('stevneid', stevneid)
    .eq('kasterid', kasterid)
  if (error) alert('Feil ved fjerning: ' + error.message)
}
