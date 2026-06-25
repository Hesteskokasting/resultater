export interface RoundInfo {
  court?: number | string | null
  matchPoints?: string
  playerScore?: string
  opponentId?: number | string | null
  opponentName?: string
  opponentScore?: string
}

function createHeader(playerId: number | string, tournamentName: string): HTMLDivElement {
  const header = document.createElement('div')
  header.className = 'header'

  const mainTitle = document.createElement('div')
  mainTitle.className = 'main-title'
  mainTitle.textContent = 'STARTKORT'

  const startNumber = document.createElement('div')
  startNumber.className = 'start-number'
  startNumber.textContent = String(playerId)

  const tournamentEl = document.createElement('div')
  tournamentEl.className = 'tournament-header'
  tournamentEl.textContent = tournamentName

  header.appendChild(mainTitle)
  header.appendChild(startNumber)
  header.appendChild(tournamentEl)
  return header
}

function createInfoTable(
  playerName: string | null,
  clubName: string,
): HTMLTableElement {
  const infoTable = document.createElement('table')
  infoTable.className = 'info-table'

  const nameRow = document.createElement('tr')
  nameRow.appendChild(createInfoCell('Navn:'))
  const nameCell = createInfoCell(playerName ?? '', 'value', 'player-name')
  nameCell.colSpan = 3
  nameRow.appendChild(nameCell)
  infoTable.appendChild(nameRow)

  const clubRow = document.createElement('tr')
  clubRow.appendChild(createInfoCell('Klubb:'))
  const clubCell = createInfoCell(clubName, 'value', 'player-club')
  clubCell.colSpan = 3
  clubRow.appendChild(clubCell)
  infoTable.appendChild(clubRow)

  return infoTable
}

function createInfoCell(text: string, className?: string, id?: string): HTMLTableCellElement {
  const cell = document.createElement('td')
  if (className) cell.className = className
  if (id) cell.id = id
  cell.textContent = text
  return cell
}

function createRoundsTable(roundInfos: RoundInfo[]): HTMLTableElement {
  const roundsTable = document.createElement('table')
  roundsTable.className = 'rounds-table'

  const thead = document.createElement('thead')
  const headerRow1 = document.createElement('tr')
  headerRow1.appendChild(createTh('KAMPINFO', 1, 4))
  headerRow1.appendChild(createTh('MOTSTANDAR', 1, 3))
  thead.appendChild(headerRow1)

  const headerRow2 = document.createElement('tr')
  headerRow2.appendChild(createTh('B', 1, 1, 'small'))
  headerRow2.appendChild(createTh('R', 1, 1, 'small'))
  headerRow2.appendChild(createTh('KP', 1, 1, 'small'))
  headerRow2.appendChild(createTh('SP', 1, 1, 'small'))
  headerRow2.appendChild(createTh('NR.', 1, 1, 'small'))
  headerRow2.appendChild(createTh('NAVN', 1, 1, 'wide'))
  headerRow2.appendChild(createTh('SP', 1, 1, 'small'))
  thead.appendChild(headerRow2)

  roundsTable.appendChild(thead)
  roundsTable.appendChild(createRoundsBody(roundInfos))

  const tfoot = document.createElement('tfoot')
  const footRow = document.createElement('tr')
  footRow.appendChild(createTd('SUM', 2))
  footRow.appendChild(createTd(''))
  footRow.appendChild(createTd(''))
  footRow.appendChild(createTd('SIGN'))
  footRow.appendChild(createTd('', 5))
  tfoot.appendChild(footRow)
  roundsTable.appendChild(tfoot)

  return roundsTable
}

function createRoundsBody(roundInfos: RoundInfo[]): HTMLTableSectionElement {
  const tbody = document.createElement('tbody')
  tbody.id = 'rounds-body'
  roundInfos.forEach((info, i) => {
    const tr = document.createElement('tr')
    tr.className = 'round-row'
    tr.id = `round-row-${i + 1}`
    tr.appendChild(createTd(info.court != null ? String(info.court) : '',   1, `court-round-${i + 1}`,        'small'))
    tr.appendChild(createTd(String(i + 1),                                  1, `round-${i + 1}`,              'small'))
    tr.appendChild(createTd(info.matchPoints ?? '',                          1, `match-points-round-${i + 1}`, 'small'))
    tr.appendChild(createTd(info.playerScore ?? '',                          1, `score-points-round-${i + 1}`, 'small'))
    tr.appendChild(createTd(info.opponentId != null ? String(info.opponentId) : '', 1, `opponent-nr-round-${i + 1}`,   'small'))
    tr.appendChild(createTd(info.opponentName ?? '',                         1, `opponent-name-round-${i + 1}`, 'wide'))
    tr.appendChild(createTd(info.opponentScore ?? '',                        1, `opp-score-round-${i + 1}`,    'small'))
    tbody.appendChild(tr)
  })
  return tbody
}

function createTh(text: string, rowspan = 1, colspan = 1, className?: string): HTMLTableCellElement {
  const th = document.createElement('th')
  if (text.includes('\n')) {
    th.innerHTML = text.replace(/\n/g, '<br>')
  } else {
    th.textContent = text
  }
  if (colspan > 1) th.colSpan = colspan
  if (rowspan > 1) th.rowSpan = rowspan
  if (className) className.split(/\s+/).forEach(cls => { if (cls) th.classList.add(cls) })
  return th
}

function createTd(text: string, colspan = 1, id?: string, className?: string): HTMLTableCellElement {
  const td = document.createElement('td')
  td.textContent = text
  if (colspan > 1) td.colSpan = colspan
  if (id) td.id = id
  if (className) className.split(/\s+/).forEach(cls => { if (cls) td.classList.add(cls) })
  return td
}

function createCupTable(): HTMLTableElement {
  const cupTable = document.createElement('table')
  cupTable.className = 'cup-table'
  cupTable.innerHTML = `
    <tr><td colspan="8">CUP:</td></tr>
    <tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td></tr>
    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
  `
  return cupTable
}

export function startcardTemplate(
  playerId: number | string,
  playerName: string | null,
  clubName: string,
  tournamentName: string,
  roundInfos: RoundInfo[],
): HTMLDivElement {
  const card = document.createElement('div')
  card.className = 'startcard'
  card.appendChild(createHeader(playerId, tournamentName))
  card.appendChild(createInfoTable(playerName, clubName))
  card.appendChild(createRoundsTable(roundInfos))
  card.appendChild(createCupTable())
  return card
}
