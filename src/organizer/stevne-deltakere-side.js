import { supabase } from '../supabase.js'
import { renderOrgNav } from './org-nav.js'

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

function createPlayerColumn(title, isSelected = false) {
  const column = document.createElement('div')
  column.className = 'db-players-column'

  const titleEl = document.createElement('h3')
  titleEl.textContent = title
  titleEl.className = 'db-players-column-title'

  const table = document.createElement('table')
  table.className = `db-players-table${isSelected ? ' selected' : ''}`

  const tableWrapper = document.createElement('div')
  tableWrapper.className = `db-players-table-wrapper${isSelected ? ' selected' : ''}`
  tableWrapper.appendChild(table)

  column.appendChild(titleEl)
  column.appendChild(tableWrapper)
  return { column, table }
}

function createSelectedPlayerRow(player, onRemove, disabled = false) {
  const row = document.createElement('tr')
  row.className = 'db-players-row selected-row'

  const playerCell = document.createElement('td')
  playerCell.className = 'db-players-cell player-info'
  playerCell.textContent = kasterNavn(player)

  const clubCell = document.createElement('td')
  clubCell.className = 'db-players-cell club-info'
  clubCell.textContent = player.klubb?.navn ?? ''

  const actionCell = document.createElement('td')
  actionCell.className = 'db-players-cell action-cell'

  if (!disabled) {
    const removeBtn = document.createElement('button')
    removeBtn.textContent = '×'
    removeBtn.className = 'db-players-remove-btn'
    removeBtn.title = 'Fjern spelar'
    removeBtn.addEventListener('click', (e) => { e.stopPropagation(); onRemove(player) })
    actionCell.appendChild(removeBtn)

    row.addEventListener('click', (e) => {
      if (e.target !== actionCell.firstChild) onRemove(player)
    })
  }

  row.appendChild(playerCell)
  row.appendChild(clubCell)
  row.appendChild(actionCell)
  return row
}

function createAvailablePlayerRow(player, onSelect, disabled = false) {
  const row = document.createElement('tr')
  row.className = 'db-players-row'

  const playerCell = document.createElement('td')
  playerCell.className = 'db-players-cell'
  playerCell.textContent = kasterNavn(player)
  playerCell.title = kasterNavn(player)

  const clubCell = document.createElement('td')
  clubCell.className = 'db-players-cell'
  clubCell.textContent = player.klubb?.navn ?? 'Ingen klubb'

  if (!disabled) row.addEventListener('click', () => onSelect(player))

  row.appendChild(playerCell)
  row.appendChild(clubCell)
  return row
}

function createEmptyRow(message) {
  const row = document.createElement('tr')
  const cell = document.createElement('td')
  cell.className = 'db-players-cell db-players-empty'
  cell.textContent = message
  cell.colSpan = 3
  row.appendChild(cell)
  return row
}

export async function render(container, { id } = {}) {
  const stevneid = Number(id)
  container.innerHTML = '<p style="text-align:center;margin-top:40px;">Laster…</p>'

  const [{ data: stevne }, { data: pameldingar }] = await Promise.all([
    supabase.from('stevne').select('id, navn, stevne_fase').eq('id', stevneid).single(),
    supabase.from('pamelding')
      .select('id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubbid, klubb:klubbid(navn))')
      .eq('stevneid', stevneid)
      .order('id'),
  ])
  await loadKasterPlayers()

  if (!stevne) {
    container.innerHTML = '<p style="text-align:center;margin-top:40px;color:red;">Stevne ikkje funne.</p>'
    return
  }

  const fase = stevne.stevne_fase ?? null
  const kanEndrast = fase === null || fase === 'ikke_startet'
  const alleSpelarar = cachedKasterPlayers
  const pameldtIds = new Set((pameldingar ?? []).map(p => p.kasterid))

  container.innerHTML = `
    <div class="container-fluid py-3">
      ${renderOrgNav(stevneid, 'spillere')}
      <h4 class="mb-2">${stevne.namn ?? stevne.navn} — Spelarar</h4>
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
  const { column: venstreKol, table: tilgjengeliListe } = createPlayerColumn('Tilgjengelege spelarar', false)
  venstreWrapper.appendChild(søkInput)
  venstreWrapper.appendChild(venstreKol)
  layout.appendChild(venstreWrapper)

  const høgreWrapper = document.createElement('div')
  høgreWrapper.className = 'col-md-6'
  const { column: høgreKol, table: pameldtListe } = createPlayerColumn('Påmelde spelarar', true)
  høgreWrapper.appendChild(høgreKol)
  layout.appendChild(høgreWrapper)

  function renderPameldtListe() {
    pameldtListe.innerHTML = ''
    const lista = sortKastere(alleSpelarar.filter(p => pameldtIds.has(p.id)))
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
