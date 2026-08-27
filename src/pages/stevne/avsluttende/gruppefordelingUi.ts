import { escHtml } from "@/utils/escHtml";
import type { RoundSetup } from "@/types";
import {
  calcValidGroupSizes,
  validRound1Setups,
  calcCupStructure,
} from "@/utils/kamp/cupStructure";

interface StandingRowForGroup {
  startnummer?: number | string | null;
  navn?: string | null;
  kamp_poeng?: number | null;
  score_poeng?: number | null;
  poeng_xkast?: number | null;
  antall_ring_xkast?: number | null;
}

interface StandingRowWithCupRank extends StandingRowForGroup {
  cupPlassering: number;
}

interface GroupAssignmentOptions {
  showPlayerList?: boolean;
  initNa?: number | null;
  initFormat?: { A?: RoundSetup | null; B?: RoundSetup | null } | null;
}

export function renderGroupAssignment(
  resultsOrN: number | StandingRowForGroup[],
  { showPlayerList = true, initNa = null, initFormat = null }: GroupAssignmentOptions = {},
): string {
  const n = typeof resultsOrN === "number" ? resultsOrN : resultsOrN.length;
  const sorted: StandingRowWithCupRank[] =
    typeof resultsOrN === "number"
      ? []
      : resultsOrN.map((r, i) => ({ ...r, cupPlassering: i + 1 }));

  const splits = calcValidGroupSizes(n);

  const resolvedNa = (() => {
    if (initNa === n) return n;
    if (initNa != null && splits.some((s) => s.nA === initNa)) return initNa;
    return splits[0]?.nA ?? n;
  })();
  const resolvedNb = n - resolvedNa;

  const threeSplits = splits.filter((s) => validRound1Setups(s.nA).some((o) => o.c3 > 0));
  const twoSplits = splits.filter((s) => !validRound1Setups(s.nA).some((o) => o.c3 > 0));
  const showNone = validRound1Setups(n).length > 0;

  const renderSplitRadios = (arr: { nA: number; nB: number }[], startIdx: number): string =>
    arr
      .map((s, i) => {
        const checked = s.nA === resolvedNa && !(initNa === n);
        const idx = startIdx + i;
        return `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-${idx}" value="${s.nA}" ${checked ? "checked" : ""}>
        <label class="form-check-label" for="split-${idx}">A:${s.nA} — B:${s.nB}</label>
      </div>`;
      })
      .join("");

  const splitParts: string[] = [];
  if (threeSplits.length) {
    splitParts.push(
      `<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${renderSplitRadios(threeSplits, 0)}`,
    );
  }
  if (twoSplits.length) {
    if (splitParts.length) splitParts.push('<hr class="my-2">');
    splitParts.push(
      `<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${renderSplitRadios(twoSplits, threeSplits.length)}`,
    );
  }
  if (showNone) {
    if (splitParts.length) splitParts.push('<hr class="my-2">');
    splitParts.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-none" value="${n}" ${initNa === n ? "checked" : ""}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`);
  }
  const splitOptions = splitParts.join("");

  const initSetupA: RoundSetup | null = initFormat?.A ?? validRound1Setups(resolvedNa)[0] ?? null;
  const initSetupB: RoundSetup | null =
    resolvedNb >= 2 ? (initFormat?.B ?? validRound1Setups(resolvedNb)[0] ?? null) : null;

  const groupPreviewHtml = showPlayerList
    ? `<div id="group-preview">${renderGroupPreview(sorted, resolvedNa, initSetupA?.walkovers ?? 0, initSetupB?.walkovers ?? 0)}</div>`
    : "";

  return `
    <div id="group-assignment-wrapper" data-n="${n}">
      <h5 class="mb-3">Velg gruppefordeling for cup</h5>
      <div class="d-flex group-layout gap-3 align-items-start mb-3">
        <div class="card">
          <div class="card-body">
            ${splitOptions}
          </div>
        </div>
        <div id="group-panels" class="d-flex gap-3 flex-wrap">
          <div id="group-panel-a" class="final-group-col">
            ${renderGroupPanelContent("Gruppe A", resolvedNa, "round1-format-a", initSetupA)}
          </div>
          ${
            resolvedNb >= 2
              ? `<div id="group-panel-b" class="final-group-col">
            ${renderGroupPanelContent("Gruppe B", resolvedNb, "round1-format-b", initSetupB)}
          </div>`
              : ""
          }
        </div>
      </div>
      ${groupPreviewHtml}
      <div class="confirm-banner">
        <button id="confirm-group-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `;
}

export interface GroupAssignmentSelection {
  nA: number;
  nB: number;
  setupA: RoundSetup | null;
  setupB: RoundSetup | null;
}

/**
 * Wires the form rendered by renderGroupAssignment: picking a split re-renders
 * the group panels, picking a round-1 format re-renders that group's structure
 * table, and either one refreshes the preview. What the confirm button then does
 * with the chosen split — store it, start the fase, assign the groups — is the
 * caller's business, so it arrives as onConfirm.
 */
export function bindGroupAssignment(
  container: HTMLElement,
  standings: StandingRowForGroup[],
  onConfirm: (selection: GroupAssignmentSelection) => void | Promise<void>,
): void {
  const n =
    parseInt(container.querySelector<HTMLElement>("#group-assignment-wrapper")?.dataset.n ?? "0") ||
    standings.length;
  const sorted: StandingRowWithCupRank[] = standings.map((r, i) => ({
    ...r,
    cupPlassering: i + 1,
  }));
  const panelsEl = container.querySelector<HTMLElement>("#group-panels");

  /** The checked format radio, or the first valid setup when none is rendered. */
  function readSelectedSetup(radioName: string, nGroup: number): RoundSetup | null {
    const selectedRadio = container.querySelector<HTMLInputElement>(
      `input[name="${radioName}"]:checked`,
    );
    if (selectedRadio?.dataset.oppsett) {
      try {
        return JSON.parse(selectedRadio.dataset.oppsett) as RoundSetup;
      } catch {
        /* fall through */
      }
    }
    return validRound1Setups(nGroup)[0] ?? null;
  }

  function selectedNa(): number {
    return parseInt(
      container.querySelector<HTMLInputElement>('input[name="group-split"]:checked')?.value ??
        String(n),
    );
  }

  function updatePreview(nA: number, setupA: RoundSetup | null, setupB: RoundSetup | null): void {
    const prevEl = container.querySelector("#group-preview");
    if (!prevEl) return;
    prevEl.innerHTML = renderGroupPreview(
      sorted,
      nA,
      setupA?.walkovers ?? 0,
      setupB?.walkovers ?? 0,
    );
  }

  panelsEl?.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (!target.matches('input[name^="round1-format"]')) return;
    const nA = selectedNa();
    const nB = n - nA;
    const setupA = readSelectedSetup("round1-format-a", nA);
    const setupB = readSelectedSetup("round1-format-b", nB);
    if (target.name === "round1-format-a") {
      const strEl = container.querySelector("#structure-a");
      if (strEl) strEl.outerHTML = renderStructureListHtml(nA, setupA, "a");
    } else {
      const strEl = container.querySelector("#structure-b");
      if (strEl) strEl.outerHTML = renderStructureListHtml(nB, setupB, "b");
    }
    updatePreview(nA, setupA, setupB);
  });

  container.querySelectorAll<HTMLInputElement>('input[name="group-split"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const nA = parseInt(radio.value);
      const nB = n - nA;
      const setupA = validRound1Setups(nA)[0] ?? null;
      const setupB = nB >= 2 ? (validRound1Setups(nB)[0] ?? null) : null;
      if (panelsEl) {
        panelsEl.innerHTML =
          `<div id="group-panel-a" class="final-group-col">
            ${renderGroupPanelContent("Gruppe A", nA, "round1-format-a", setupA)}
          </div>` +
          (nB >= 2
            ? `<div id="group-panel-b" class="final-group-col">
            ${renderGroupPanelContent("Gruppe B", nB, "round1-format-b", setupB)}
          </div>`
            : "");
      }
      updatePreview(nA, setupA, setupB);
    });
  });

  container.querySelector("#confirm-group-btn")?.addEventListener("click", () => {
    const selected = container.querySelector<HTMLInputElement>('input[name="group-split"]:checked');
    if (!selected) return;
    const nA = parseInt(selected.value);
    const nB = n - nA;
    void onConfirm({
      nA,
      nB,
      setupA: readSelectedSetup("round1-format-a", nA),
      setupB: nB >= 2 ? readSelectedSetup("round1-format-b", nB) : null,
    });
  });
}

export function renderGroupPreview(
  sorted: StandingRowWithCupRank[],
  nA: number,
  woA = 0,
  woB = 0,
): string {
  const groupA = sorted.slice(0, nA);
  const groupB = sorted.slice(nA);

  // X-kast-fed cups carry poeng_xkast; show R (ringere) / X (poeng) instead of KP / SP.
  const isXkast = sorted.some((r) => r.poeng_xkast != null);

  function tableRows(spel: StandingRowWithCupRank[], woCount = 0): string {
    return spel
      .map((r, i) => {
        const isWalkover = i < woCount;
        const col1 = isXkast ? (r.antall_ring_xkast ?? 0) : (r.kamp_poeng ?? 0);
        const col2 = isXkast ? (r.poeng_xkast ?? 0) : (r.score_poeng ?? 0);
        return `
      <tr>
        <td>${r.cupPlassering}</td>
        <td>${escHtml(r.navn ?? "")}${isWalkover ? ' <span class="badge bg-info text-dark">Walkover</span>' : ""}</td>
        <td class="text-center">${col1}</td>
        <td class="text-center">${col2}</td>
      </tr>`;
      })
      .join("");
  }

  const tableHeader = `
    <thead class="stevne-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">${isXkast ? "R" : "KP"}</th>
      <th class="th-44 text-center">${isXkast ? "X" : "SP"}</th>
    </tr></thead>`;

  const tableA = `
    <table class="table table-bordered table-sm bg-white mb-0">
      ${tableHeader}
      <tbody>${tableRows(groupA, woA)}</tbody>
    </table>`;

  const tableB = groupB.length
    ? `
    <table class="table table-bordered table-sm bg-white mb-0">
      ${tableHeader}
      <tbody>${tableRows(groupB, woB)}</tbody>
    </table>`
    : "";

  return `
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${groupA.length})</h6>
        ${tableA}
      </div>
      ${
        groupB.length
          ? `<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${groupB.length})</h6>
        ${tableB}
      </div>`
          : ""
      }
    </div>`;
}

function setupLabel(o: RoundSetup): string {
  const perBane = o.c3 > 0 ? 3 : 2;
  return `${o.walkovers} walkover - ${perBane} deltakere per bane`;
}

function renderRound1FormatSelector(
  _groupLabel: string,
  n: number,
  radioName: string,
  initSetup: RoundSetup | null = null,
): string {
  const setups = validRound1Setups(n);
  if (setups.length <= 1) return "";
  const radios = setups
    .map((o, i) => {
      const id = `${radioName}-${i}`;
      const val = JSON.stringify(o);
      const checked = initSetup
        ? o.walkovers === initSetup.walkovers && o.c3 === initSetup.c3 && o.c2 === initSetup.c2
        : i === 0;
      const btnClass = o.c3 > 0 ? "btn-outline-success" : "btn-outline-warning";
      return `
      <input type="radio" class="btn-check" name="${radioName}" id="${id}"
        value='${val}' data-oppsett='${val}' autocomplete="off" ${checked ? "checked" : ""}>
      <label class="btn btn-sm ${btnClass}" for="${id}">${setupLabel(o)}</label>`;
    })
    .join("");
  return `<div class="d-flex flex-column align-items-start gap-1 mb-2">${radios}</div>`;
}

export function renderStructureListHtml(
  n: number,
  setup: RoundSetup | null,
  suffix: string,
): string {
  const rounds = n >= 2 ? calcCupStructure(n, { runde1: setup }) : [];
  const rows = rounds
    .map((r, i) => {
      const wo = r.walkovers ?? 0;
      const active = r.players - wo;
      const participantsCell =
        wo > 0 ? `${active} <span class="text-muted">(${wo} w.o.)</span>` : `${active}`;
      let perLane: string;
      if (i === 0 && setup) {
        perLane = setup.c3 > 0 && setup.c2 > 0 ? "2/3" : setup.c3 > 0 ? "3" : "2";
      } else {
        perLane = r.players % r.lanes === 0 ? String(r.players / r.lanes) : "2/3";
      }
      return `<tr${r.threePlayers ? ' class="fw-bold"' : ""}>
      <td>${r.runde}</td>
      <td>${participantsCell}</td>
      <td>${r.lanes}</td>
      <td>${perLane}</td>
    </tr>`;
    })
    .join("");
  return `<div id="structure-${suffix}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

export function renderGroupPanelContent(
  label: string,
  n: number,
  radioName: string,
  setup: RoundSetup | null,
): string {
  const suffix = radioName.slice(-1);
  const formatSelector = renderRound1FormatSelector(label, n, radioName, setup);
  const title = formatSelector ? `${label}: Velg format` : `${label} (${n})`;
  return `
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${title}</h6>
        ${formatSelector}
        ${renderStructureListHtml(n, setup, suffix)}
      </div>
    </div>`;
}
