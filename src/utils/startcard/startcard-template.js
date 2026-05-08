// Individual element creation functions
function createHeader() {
    const header = document.createElement('div');
    header.className = 'header';
    const title = document.createElement('div');
    title.className = 'title';
    const mainTitle = document.createElement('div');
    mainTitle.className = 'main-title';
    mainTitle.textContent = 'STARTKORT';
    const subTitle = document.createElement('div');
    subTitle.className = 'subtitle';
    subTitle.textContent = 'GLOPPEN-METODEN';
    title.appendChild(mainTitle);
    title.appendChild(subTitle);
    header.appendChild(title);
    return header;
}

function createInfoTable(playerId, playerName, clubName, tournamentName) {
    const infoTable = document.createElement('table');
    infoTable.className = 'info-table';

    // Row 1: Player name and start number
    const nameRow = document.createElement('tr');
    nameRow.appendChild(createInfoCell('Navn:'));
    nameRow.appendChild(createInfoCell(playerName, 'value', 'player-name'));
    nameRow.appendChild(createInfoCell('Startnr.'));
    nameRow.appendChild(createInfoCell(playerId, 'value', 'player-id'));
    infoTable.appendChild(nameRow);

    // Row 2: Club and class/group
    const clubRow = document.createElement('tr');
    clubRow.appendChild(createInfoCell('Klubb:'));
    clubRow.appendChild(createInfoCell(clubName, 'value', 'player-club'));
    clubRow.appendChild(createInfoCell('Klasse/Gruppe'));
    clubRow.appendChild(createInfoCell('', 'value', null));
    infoTable.appendChild(clubRow);

    // Row 3: Tournament name
    const tournamentRow = document.createElement('tr');
    tournamentRow.appendChild(createInfoCell('Stevne:'));
    tournamentRow.appendChild(createInfoCell(tournamentName, 'value', 'tournament-name'));
    tournamentRow.appendChild(createInfoCell(''));
    tournamentRow.appendChild(createInfoCell(''));
    infoTable.appendChild(tournamentRow);

    return infoTable;
}

function createInfoCell(text, className, id, title) {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    if (id) cell.id = id;
    if (title) cell.title = title;
    cell.textContent = text;
    return cell;
}

function createRoundsTable(roundInfos) {
    const roundsTable = document.createElement('table');
    roundsTable.className = 'rounds-table';

    // Create thead
    const thead = document.createElement('thead');
    // First header row
    const headerRow1 = document.createElement('tr');
    headerRow1.appendChild(createTh('BANE', 2, 1, 'small'));
    headerRow1.appendChild(createTh('RUNDE', 2, 1, 'small'));
    headerRow1.appendChild(createTh('POENG', 2, 1, 'small allow-wrap'));
    headerRow1.appendChild(createTh('SKÅR', 2, 1, 'small'));
    headerRow1.appendChild(createTh('MOTSTANDAR', 1, 3, 'wide'));
    thead.appendChild(headerRow1);

    // Second header row
    const headerRow2 = document.createElement('tr');
    headerRow2.appendChild(createTh('NR.', 1, 1, 'small'));
    headerRow2.appendChild(createTh('NAVN', 1, 1, 'wide'));
    headerRow2.appendChild(createTh('SKÅR', 1, 1, 'small'));
    thead.appendChild(headerRow2);

    roundsTable.appendChild(thead);

    // Create tbody
    const tbody = createRoundsBody(roundInfos);
    roundsTable.appendChild(tbody);

    // Create tfoot
    const tfoot = document.createElement('tfoot');
    const footRow = document.createElement('tr');
    footRow.appendChild(createTd('SUM', 2));
    footRow.appendChild(createTd(''));
    footRow.appendChild(createTd(''));
    footRow.appendChild(createTd('SIGN'));
    footRow.appendChild(createTd('', 5));
    tfoot.appendChild(footRow);
    roundsTable.appendChild(tfoot);

    return roundsTable;
}

function createRoundsBody(roundInfos) {
    const tbody = document.createElement('tbody');
    tbody.id = 'rounds-body';
    const roundsCount = roundInfos.length;
    for (let i = 0; i < roundsCount; i++) {
        const info = roundInfos[i] || {};
        const tr = document.createElement('tr');
        tr.className = 'round-row';
        tr.id = `round-row-${i+1}`;

        tr.appendChild(createTd(info.court !== undefined ? info.court : '', 1, `court-round-${i+1}`, 'small'));
        tr.appendChild(createTd(i+1, 1, `round-${i+1}`, 'small'));
        tr.appendChild(createTd(info.matchPoints ?? '', 1, `match-points-round-${i+1}`, 'small'));
        tr.appendChild(createTd(info.playerScore ?? '', 1, `score-points-round-${i+1}`, 'small'));
        tr.appendChild(createTd(info.opponentId !== undefined ? info.opponentId : '', 1, `opponent-nr-round-${i+1}`, 'small'));
        tr.appendChild(createTd(info.opponentName !== undefined ? info.opponentName : '', 1, `opponent-name-round-${i+1}`, 'wide'));
        tr.appendChild(createTd(info.opponentScore ?? '', 1, `opp-score-round-${i+1}`, 'small'));

        tbody.appendChild(tr);
    }
    return tbody;
}

function createTh(text, rowspan = 1, colspan = 1) {
    const th = document.createElement('th');
    // Support line breaks in header text
    if (typeof text === 'string' && text.includes('\n')) {
        th.innerHTML = text.replace(/\n/g, '<br>');
    } else {
        th.textContent = text;
    }
    if (colspan > 1) th.colSpan = colspan;
    if (rowspan > 1) th.rowSpan = rowspan;
    if (arguments.length > 3 && arguments[3]) {
        const classes = arguments[3].split(/\s+/);
        classes.forEach(cls => { if (cls) th.classList.add(cls); });
    }
    return th;
}

function createTd(text, colspan = 1, id = null) {
    const td = document.createElement('td');
    td.textContent = text;
    if (colspan > 1) td.colSpan = colspan;
    if (id) td.id = id;
    if (arguments.length > 3 && arguments[3]) {
        const classes = arguments[3].split(/\s+/);
        classes.forEach(cls => { if (cls) td.classList.add(cls); });
    }
    return td;
}

function createNotes() {
    const notes = document.createElement('div');
    notes.className = 'notes';
    notes.innerHTML = `
        <div>Ved under 10 i skår, for eksempel 7 - skriv 07</div>
        <div>Unngå rettingar/overstrykningar - ved feilskriving - kontakt domar</div>
        <div class="wo">Møter du W.O. fører du 2kp og 21sp (nytt frå 2011)</div>
    `;
    return notes;
}

function createCupTable() {
    const cupTable = document.createElement('table');
    cupTable.className = 'cup-table';
    cupTable.innerHTML = `
        <tr>
          <td colspan="8">CUP:</td>
        </tr>
        <tr>
          <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td>
        </tr>
        <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    `;
    return cupTable;
}

export function startcardTemplate(playerId, playerName, clubName, tournamentName, roundInfos) {
    // Returns a DOM element representing the start card
    const container = document.createElement('div');
    container.className = 'startcard';
    container.appendChild(createHeader());
    container.appendChild(createInfoTable(playerId, playerName, clubName, tournamentName));
    container.appendChild(createRoundsTable(roundInfos));
    container.appendChild(createNotes());
    container.appendChild(createCupTable());
    return container;
}