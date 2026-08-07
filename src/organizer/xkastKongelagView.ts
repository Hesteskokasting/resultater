// ── Shared court view for X-kast (innledende) and Kongelag (avsluttende) ──────
//
// Usage: call createCourtPhaseRenderer(variant) once at module level in each
// kastemetode file, mirroring createFinalPhaseRenderer in avsluttendeBase.
// The factory owns state, realtime channel, rendering, and the shared
// register/confirm/complete actions; the variant supplies fase, column
// layout, and numberpad entry order.
//
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createErrorBanner } from "@/components/ErrorBanner";
import { createLoadingState } from "@/components/LoadingState";
import { createEmptyState } from "@/components/EmptyState";
import { showToast } from "@/components/Toast";
import { confirmDialog } from "@/components/ConfirmDialog";
import {
  showOmgangNumberpad,
  type OmgangEntryStep,
  type OmgangPadHeader,
} from "@/components/OmgangNumberpad";
import { showTotalNumberpad } from "@/components/TotalNumberpad";
import { escHtml } from "@/utils/escHtml";
import { throwerName } from "@/utils/kaster";
import { logError } from "@/utils/logError";
import { unsubscribeChannel } from "@/utils/realtime";
import { coalesceReload } from "@/utils/coalesceReload";
import { ringerPercent } from "@/utils/omgangValidation";
import {
  renderMainContent,
  bindTabToggle,
  getActiveTab,
  setActiveTab,
} from "@/organizer/org-shared";
import {
  getCourts,
  saveOmgang,
  confirmCourt,
  swapCourtPlayers,
  editCourtOmgang,
  setCourtTotal,
  subscribeToCourtChanges,
  type CourtRow,
  type CourtParticipantRow,
  type CourtFase,
  type CourtPhaseConfig,
  type KongelagCarryOverInfo,
} from "@/services/xkastKongelagService";
import { writePlacements } from "@/services/resultatService";
import { setTournamentCompleted } from "@/services/stevneService";
import { autoCompleteCourts } from "@/services/testDataService";
import { buildXkastStanding, type XkastStandingRow } from "@/utils/xkastStilling";
import { buildKongelagStanding, type KongelagStandingRow } from "@/utils/kongelagStilling";

// ── Variant contract ──────────────────────────────────────────────────────────

/** One row of the omgang breakdown: a label and the omganger it covers. */
export interface DetailRow {
  label: string;
  omganger: number[];
}

/** One numberpad step before recorded-omgang filtering: who throws which omgang. */
export interface EntrySlot {
  participant: CourtParticipantRow;
  omgang: number;
  /** Bane/runde context and the round strip shown above the pad. */
  header: OmgangPadHeader;
}

export interface CourtPhaseContext {
  stevneid: number;
  isAdmin: boolean;
  config: CourtPhaseConfig;
  antallOmganger: number;
  courts: CourtRow[];
  reload: () => Promise<void>;
}

export interface CourtPhaseVariant {
  fase: CourtFase;
  channelName: (stevneid: number) => string;
  loadConfig: (stevneid: number) => Promise<{ data: CourtPhaseConfig | null; error: unknown }>;
  /**
   * Rows of the omgang breakdown, at most five omganger each. X-kast groups by
   * runde (R1, R2 …); Kongelag chunks the flat omgang list (1–5, 6–10).
   */
  detailRows: (antallOmganger: number) => DetailRow[];
  /**
   * Score area of the main row. "runder" gives one column per detail row,
   * holding its sum (X-kast). "omganger" gives a single cell holding every
   * omgang as a five-wide grid (Kongelag), so ten omganger read as two rows.
   */
  mainScore: "runder" | "omganger";
  /** 'court': Registrer per court (X-kast). 'pulje': one Registrer per pulje (Kongelag). */
  registerScope: "court" | "pulje";
  /** Numberpad entry order over the given courts (recorded omganger are filtered out later). */
  entryOrder: (courts: CourtRow[], antallOmganger: number) => EntrySlot[];
  /**
   * Header for one omgang in the numberpad: bane pill, "Runde x av y" line and
   * the strip of omganger the round covers. Shared by the entry wizard and the
   * single-omgang edit pad so both show the same context.
   */
  padHeader: (
    court: CourtRow,
    participant: CourtParticipantRow,
    omgang: number,
    antallOmganger: number,
  ) => OmgangPadHeader;
  emptyHint: (isAdmin: boolean) => string;
  /**
   * Lets admins swap two players between courts (tap one, tap the other) as
   * long as neither court is confirmed and neither seat has recorded
   * omganger. X-kast only for now.
   */
  canSwapPlayers?: boolean;
  /** Optional replacement for the empty state (e.g. Kongelag's admin start panel). */
  renderNoCourts?: (ctx: CourtPhaseContext) => HTMLElement | null;
  /**
   * Optional innledende carry-over (Kongelag Phases 3/4). When it resolves
   * non-null, the standing gains I/TOT columns (plus the raw X-kast sum and
   * percentage for X-kast innledende) and ranks by poeng + carry-over;
   * placements on Fullfør use the same ranking.
   */
  loadCarryOver?: (
    stevneid: number,
  ) => Promise<{ data: KongelagCarryOverInfo | null; error: unknown }>;
}

// ── Shared pure helpers ───────────────────────────────────────────────────────

export function sortedParticipants(court: CourtRow): CourtParticipantRow[] {
  return [...court.deltakarar].sort((a, b) => a.id - b.id);
}

function totalSum(participant: CourtParticipantRow): number {
  if (participant.totalsum_manuelt) return participant.poeng;
  return participant.omgangar.reduce((sum, o) => sum + o.poeng, 0);
}

function isCourtComplete(court: CourtRow, antallOmganger: number): boolean {
  return court.deltakarar.every((p) => p.totalsum_manuelt || p.omgangar.length >= antallOmganger);
}

function courtStatus(court: CourtRow): string {
  if (court.er_bekreftet) return "done";
  if (court.deltakarar.some((p) => p.totalsum_manuelt || p.omgangar.length > 0))
    return "in-progress";
  return "not-started";
}

function hasOpenEntries(courts: CourtRow[], antallOmganger: number): boolean {
  return courts.some((c) => !c.er_bekreftet && !isCourtComplete(c, antallOmganger));
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createCourtPhaseRenderer(variant: CourtPhaseVariant) {
  interface CourtPhaseState {
    stevneid: number;
    isAdmin: boolean;
    config: CourtPhaseConfig;
    antallOmganger: number;
    courts: CourtRow[];
    /** Innledende carry-over; null = no carry-over columns. */
    carryOver: KongelagCarryOverInfo | null;
    /** Deltaker id of the first player picked in a pending swap. */
    swapSelectedId: number | null;
    /**
     * Deltaker ids whose omgang detail table is open. Independent per player
     * (several can be open at once). Held in state so a realtime repaint keeps
     * the open tables — same intent as the active-tab restore.
     */
    expandedDeltakerIds: Set<number>;
  }

  let state: CourtPhaseState | null = null;
  let channel: RealtimeChannel | null = null;
  let bannerSlot: HTMLElement | null = null;
  const boundContainers = new WeakSet<HTMLElement>();

  // ── Entry wizard ────────────────────────────────────────────────────────────

  function buildEntrySteps(slots: EntrySlot[]): OmgangEntryStep[] {
    return (
      slots
        // Manual-total players have no omganger to enter; already-recorded omganger are skipped.
        .filter(
          (slot) =>
            !slot.participant.totalsum_manuelt &&
            !slot.participant.omgangar.some((o) => o.omgang === slot.omgang),
        )
        .map((slot) => ({
          header: slot.header,
          playerName: throwerName(slot.participant.kaster),
          onSave: async (poeng, antallRinger) => {
            const { error } = await saveOmgang(
              slot.participant.id,
              slot.omgang,
              poeng,
              antallRinger,
            );
            if (error) {
              showToast("Feil ved lagring av omgang.", "error");
              return false;
            }
            return true;
          },
        }))
    );
  }

  function openEntryPad(courts: CourtRow[]): void {
    const s = state;
    if (!s) return;
    const openCourts = courts.filter((c) => !c.er_bekreftet);
    const steps = buildEntrySteps(variant.entryOrder(openCourts, s.antallOmganger));
    if (!steps.length) {
      showToast("Alle omganger er registrerte.", "info");
      return;
    }
    showOmgangNumberpad(steps);
  }

  // ── Rendering (same structure/classes as the kamp views) ───────────────────

  /** Score columns between NAMN and TOT: one per runde, or one grid cell. */
  function scoreColumnCount(): number {
    const s = state!;
    return variant.mainScore === "runder" ? variant.detailRows(s.antallOmganger).length : 1;
  }

  /** Count of this court's players with their detail panel currently open. */
  function expandedCountInCourt(court: CourtRow): number {
    const s = state!;
    return court.deltakarar.filter((p) => s.expandedDeltakerIds.has(p.id)).length;
  }

  function courtRowspan(court: CourtRow): number {
    return court.deltakarar.length + expandedCountInCourt(court);
  }

  /**
   * Bane-level actions, shown inside every expanded player of the court: both
   * Registrer and Bekreft act on the whole bane, and neither fits the main row
   * on a phone.
   */
  function courtActionsHtml(court: CourtRow): string {
    const s = state!;
    if (court.er_bekreftet) {
      return '<span class="match-confirmed-indicator">✓ Bekreftet</span>';
    }
    if (!s.isAdmin) return "";
    const canConfirm = isCourtComplete(court, s.antallOmganger);
    const bane = court.bane_nummer ?? "?";
    const registerBtn =
      variant.registerScope === "court"
        ? `<button class="match-button match-button-primary" data-xk-register="${court.id}">Registrer bane ${bane}</button>`
        : "";
    return `${registerBtn}<button class="match-button${canConfirm ? " match-button-success" : ""}" data-xk-confirm="${court.id}"${canConfirm ? "" : " disabled"}>Bekreft bane ${bane}</button>`;
  }

  function canSwapParticipant(court: CourtRow, participant: CourtParticipantRow): boolean {
    const s = state!;
    return (
      Boolean(variant.canSwapPlayers) &&
      s.isAdmin &&
      !court.er_bekreftet &&
      participant.omgangar.length === 0
    );
  }

  /** Admin may edit omgang scores (confirmed courts allowed; fullført and manual totals not). */
  function canEditScores(participant: CourtParticipantRow): boolean {
    const s = state!;
    return s.isAdmin && !s.config.erfullfort && !participant.totalsum_manuelt;
  }

  /** One score cell: poeng with the ringer count as a small secondary figure. */
  function omgangValueHtml(rec: CourtParticipantRow["omgangar"][number] | undefined): string {
    if (!rec) return '<span class="bane-detail-dash">—</span>';
    const ringer =
      rec.antall_ringer != null
        ? `<span class="bane-detail-ringer">${rec.antall_ringer}</span>`
        : "";
    return `<span class="bane-detail-poeng">${rec.poeng}</span>${ringer}`;
  }

  /**
   * Everything the main row no longer carries, for one player: ringere, ringer
   * percentage, the bane-level actions, and the omgang breakdown (one row per
   * detail row, one column per omgang within it). Admins edit an omgang by
   * tapping its cell; the tap reuses the data-xk-omgang-edit handler.
   */
  function detailPanelHtml(
    court: CourtRow,
    participant: CourtParticipantRow,
    tintClass: string,
  ): string {
    const s = state!;
    const rows = variant.detailRows(s.antallOmganger);
    const maxPerRow = rows.reduce((max, r) => Math.max(max, r.omganger.length), 0);
    const editable = canEditScores(participant);

    const omgangHeaders = Array.from(
      { length: maxPerRow },
      (_, j) => `<th class="text-center">${j + 1}</th>`,
    ).join("");

    const bodyRows = rows
      .map((row) => {
        const cells = Array.from({ length: maxPerRow }, (_, j) => {
          const omgang = row.omganger[j];
          if (omgang == null) return '<td class="bane-detail-empty"></td>';
          const rec = participant.omgangar.find((o) => o.omgang === omgang);
          const inner = omgangValueHtml(rec);
          return editable
            ? `<td class="text-center"><button type="button" class="bane-detail-cell-btn" data-xk-omgang-edit="${participant.id}:${omgang}" aria-label="Rediger omgang ${omgang}">${inner}</button></td>`
            : `<td class="text-center bane-detail-value">${inner}</td>`;
        }).join("");
        const totals = row.omganger.reduce(
          (acc, o) => {
            const rec = participant.omgangar.find((r) => r.omgang === o);
            return {
              poeng: acc.poeng + (rec?.poeng ?? 0),
              ringer: acc.ringer + (rec?.antall_ringer ?? 0),
            };
          },
          { poeng: 0, ringer: 0 },
        );
        return `<tr>
          <th scope="row" class="bane-detail-runde">${escHtml(row.label)}</th>
          ${cells}
          <td class="text-center bane-detail-ringer-sum">${totals.ringer}</td>
          <td class="bane-detail-sum">${totals.poeng}</td>
        </tr>`;
      })
      .join("");

    // The lane column is rowspanned over this row; span the rest (NAMN + score
    // columns + TOT). The tint class frames the recessed panel with the court's
    // zebra tint.
    return `<tr class="xk-detail-row ${tintClass}"><td colspan="${scoreColumnCount() + 2}">
        <div class="bane-detail-panel">
          <div class="bane-detail-meta">
            <span class="bane-detail-stat"><span class="bane-detail-stat-key">R</span>${ringerSum(participant)}</span>
            <span class="bane-detail-stat"><span class="bane-detail-stat-key">%</span>${participantPercentHtml(participant)}</span>
            <span class="bane-detail-actions">${courtActionsHtml(court)}</span>
          </div>
          <table class="bane-detail-table">
            <thead>
              <tr>
                <th class="bane-detail-runde-head">RD</th>
                ${omgangHeaders}
                <th class="text-center bane-detail-ringer-head">R</th>
                <th class="bane-detail-sum-head">SUM</th>
              </tr>
            </thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </td></tr>`;
  }

  /**
   * The player-name cell. In X-kast it doubles as the row-level detail toggle
   * (chevron); in Kongelag it stays a plain cell. Admins can still swap a
   * not-yet-scored player via the name; there the chevron alone toggles detail.
   */
  function nameCellHtml(
    court: CourtRow,
    participant: CourtParticipantRow,
    isExpanded: boolean,
  ): string {
    const s = state!;
    const name = escHtml(throwerName(participant.kaster));
    const isSwappable = canSwapParticipant(court, participant);
    const swapSelected = s.swapSelectedId === participant.id ? " court-swap-selected" : "";
    // Confirmation is per bane, so every player of a confirmed bane is marked.
    const confirmedMark = court.er_bekreftet
      ? '<span class="bane-name-confirmed" aria-label="Bekrefta">✓</span>'
      : "";

    const chevron = '<span class="bane-detail-chevron" aria-hidden="true"></span>';
    if (isSwappable) {
      return `<td class="text-start bane-name-cell">
          <button type="button" class="bane-detail-toggle" data-xk-toggle-detail="${participant.id}" aria-expanded="${isExpanded}" aria-label="Vis omgangar for ${name}">${chevron}</button>
          <span class="court-swap-cell${swapSelected}" data-xk-swap="${participant.id}">${name}</span>
        </td>`;
    }
    return `<td class="text-start bane-name-cell">
        <button type="button" class="bane-name-toggle" data-xk-toggle-detail="${participant.id}" aria-expanded="${isExpanded}">${chevron}<span>${name}</span>${confirmedMark}</button>
      </td>`;
  }

  /** X-kast main row: one read-only cell per runde, holding that runde's sum. */
  function rundeCellsHtml(participant: CourtParticipantRow): string {
    const s = state!;
    return variant
      .detailRows(s.antallOmganger)
      .map((row) => {
        const recorded = row.omganger
          .map((o) => participant.omgangar.find((r) => r.omgang === o))
          .filter((rec) => rec != null);
        const value = recorded.length
          ? String(recorded.reduce((sum, rec) => sum + rec.poeng, 0))
          : "—";
        return `<td class="text-center">${value}</td>`;
      })
      .join("");
  }

  /**
   * Kongelag main row: every omgang in one cell, five per line — ten omganger
   * read as two rows instead of ten columns nothing narrow can hold. Each chip
   * is the edit target for its omgang.
   */
  function omgangGridCellHtml(participant: CourtParticipantRow): string {
    const s = state!;
    const editable = canEditScores(participant);
    const columns = Math.min(5, s.antallOmganger);
    const chips = Array.from({ length: s.antallOmganger }, (_, i) => {
      const omgang = i + 1;
      const rec = participant.omgangar.find((o) => o.omgang === omgang);
      const value = rec ? String(rec.poeng) : "–";
      const emptyClass = rec ? "" : " is-empty";
      return editable
        ? `<button type="button" class="bane-omgang-chip${emptyClass}" data-xk-omgang-edit="${participant.id}:${omgang}" aria-label="Rediger omgang ${omgang}">${value}</button>`
        : `<span class="bane-omgang-chip${emptyClass}">${value}</span>`;
    }).join("");
    return `<td class="bane-omgang-cell">
        <div class="bane-omgang-grid" style="grid-template-columns: repeat(${columns}, minmax(0, 1fr))">${chips}</div>
      </td>`;
  }

  function courtRowsHtml(court: CourtRow, courtIndex: number): string {
    const s = state!;
    // Zebra tint alternates per bane group (court order within the pulje), not
    // per row — so both kastar rows of a bane share one tint and a solo bane
    // never desyncs the stripe. Status accent is handled separately below.
    const tintClass = courtIndex % 2 === 1 ? "bane-group bane-group--b" : "bane-group";
    // A solo bane (rowspan 1) gets a min block height so it matches a pair.
    const laneCellClass =
      courtRowspan(court) === 1 ? "bane-lane-cell bane-lane-cell--solo" : "bane-lane-cell";
    return sortedParticipants(court)
      .map((participant, i) => {
        const isExpanded = s.expandedDeltakerIds.has(participant.id);
        // Runde sums are read-only summaries — editing happens per omgang, and
        // a click on a runde total would be ambiguous.
        const scoreCells =
          variant.mainScore === "runder"
            ? rundeCellsHtml(participant)
            : omgangGridCellHtml(participant);
        const firstCells =
          i === 0
            ? `<td class="text-center align-middle fw-semibold ${laneCellClass}" rowspan="${courtRowspan(court)}">${court.bane_nummer ?? ""}</td>`
            : "";
        // Every row of the court carries the tint class; only the first row also
        // carries the status accent (match-row-desktop + data-status).
        const rowClass = i === 0 ? `${tintClass} match-row-desktop` : tintClass;
        const rowAttrs =
          i === 0
            ? ` class="${rowClass}" data-status="${courtStatus(court)}"`
            : ` class="${rowClass}"`;
        const canEditTotal = s.isAdmin && !s.config.erfullfort;
        const totCls = `text-center fw-semibold${canEditTotal ? " xk-editable-cell" : ""}`;
        const totAttr = canEditTotal ? ` data-xk-total="${participant.id}"` : "";
        // text-start: the reused match-row-desktop styling right-aligns the P1
        // column (td:nth-child(2)) for kamp rows; court names stay left-aligned.
        const row = `<tr${rowAttrs}>
        ${firstCells}
        ${nameCellHtml(court, participant, isExpanded)}
        ${scoreCells}
        <td class="${totCls}"${totAttr}>${totalSum(participant)}</td>
      </tr>`;
        const detail = isExpanded ? detailPanelHtml(court, participant, tintClass) : "";
        return row + detail;
      })
      .join("");
  }

  function puljeSectionHtml(pulje: number, courts: CourtRow[], puljeLabel: string): string {
    const s = state!;
    // "runder": a labelled column per runde. "omganger": one unlabelled column
    // holding the omgang grid.
    const scoreHeaders =
      variant.mainScore === "runder"
        ? variant
            .detailRows(s.antallOmganger)
            .map((row) => `<th class="text-center th-36">${escHtml(row.label)}</th>`)
            .join("")
        : '<th class="bane-omgang-th"></th>';
    const puljeRegisterBtn =
      s.isAdmin && variant.registerScope === "pulje" && hasOpenEntries(courts, s.antallOmganger)
        ? ` <button class="match-button match-button-primary ms-2" data-xk-register-pulje="${pulje}">Registrer</button>`
        : "";

    return `
      <div class="mb-3">
        <h6 class="text-center fw-bold mb-1">${escHtml(puljeLabel)}${puljeRegisterBtn}</h6>
        <div class="table-scroll">
          <table class="table table-sm match-table mb-0">
            <thead class="org-thead">
              <tr>
                <th class="th-36 text-center">B</th>
                <th>NAMN</th>
                ${scoreHeaders}
                <th class="text-center th-44">TOT</th>
              </tr>
            </thead>
            <tbody>${courts.map((court, i) => courtRowsHtml(court, i)).join("")}</tbody>
          </table>
        </div>
      </div>`;
  }

  function computeStanding(): XkastStandingRow[] | KongelagStandingRow[] {
    const s = state!;
    const base = buildXkastStanding(
      s.courts.flatMap((court) =>
        court.deltakarar.map((p) => ({
          kasterid: p.kasterid,
          navn: throwerName(p.kaster),
          omganger: p.omgangar,
          manualTotal: p.totalsum_manuelt
            ? { poeng: p.poeng, antallRinger: p.antall_ringer, antallOmganger: s.antallOmganger }
            : null,
        })),
      ),
    );
    return s.carryOver ? buildKongelagStanding(base, s.carryOver.byKasterid) : base;
  }

  function standingRowHtml(row: XkastStandingRow | KongelagStandingRow): string {
    const s = state!;
    const xkastCell = s.carryOver?.xkastPoengByKasterid
      ? `<td class="standing-number standing-dim-cell">${s.carryOver.xkastPoengByKasterid[row.kasterid] ?? "—"}</td>`
      : "";
    const carryCells =
      "carryOver" in row
        ? `<td class="standing-number">${row.poeng}</td>
      ${xkastCell}
      <td class="standing-number standing-dim-cell">${row.carryOver}</td>
      <td class="standing-number standing-sp-cell">${row.displayTotal}</td>`
        : `<td class="standing-number standing-sp-cell">${row.poeng}</td>`;
    return `<tr class="standing-player-row" data-kasterid="${row.kasterid}">
      <td class="standing-dim-cell">${row.plassering}</td>
      <td>${escHtml(row.navn)}</td>
      <td class="standing-number standing-dim-cell">${row.antallOmganger}</td>
      <td class="standing-number standing-kp-cell table-summary-start">${row.antallRinger}</td>
      <td class="standing-number standing-dim-cell">${percentCellHtml(row.antallRinger, row.antallOmganger)}</td>
      ${carryCells}
    </tr>`;
  }

  function standingHtml(): string {
    const s = state!;
    const standing = computeStanding();
    if (!standing.length) return "";

    // With carry-over: P = kongelag poeng, X = rå X-kast-sum, I = innleiande
    // carry-over (X × prosenten i overskrifta), TOT = P + I
    const scoreHeaders = s.carryOver
      ? `<th class="th-44 standing-number">P</th>
            ${s.carryOver.xkastPoengByKasterid ? '<th class="th-44 standing-number">X</th>' : ""}
            <th class="th-44 standing-number">I</th>
            <th class="th-50 standing-number standing-sp-th">TOT</th>`
      : '<th class="th-44 standing-number standing-sp-th">P</th>';
    const percentSuffix =
      s.carryOver?.xkastPercent != null ? ` · overføring ${s.carryOver.xkastPercent} %` : "";

    return `
      <div class="standing-table-wrap">
        <h6 class="text-center fw-bold mb-1">${standing.length} spelarar${percentSuffix}</h6>
        <div class="table-scroll">
          <table class="table table-sm match-table mb-0">
            <thead class="org-thead">
              <tr>
                <th class="th-32">#</th>
                <th>NAMN</th>
                <th class="th-50 standing-number">O</th>
                <th class="th-44 standing-number standing-kp-th table-summary-start">R</th>
                <th class="th-50 standing-number">%</th>
                ${scoreHeaders}
              </tr>
            </thead>
            <tbody>${standing.map((row) => standingRowHtml(row)).join("")}</tbody>
          </table>
        </div>
      </div>`;
  }

  function buildContext(container: HTMLElement): CourtPhaseContext {
    const s = state!;
    return {
      stevneid: s.stevneid,
      isAdmin: s.isAdmin,
      config: s.config,
      antallOmganger: s.antallOmganger,
      courts: s.courts,
      reload: () => reload(container),
    };
  }

  function renderView(container: HTMLElement): void {
    const s = state;
    if (!s) return;

    if (!s.courts.length) {
      const custom = variant.renderNoCourts?.(buildContext(container)) ?? null;
      container.replaceChildren(custom ?? createEmptyState(variant.emptyHint(s.isAdmin)));
      renderBanner(container);
      return;
    }

    const byPulje = new Map<number, CourtRow[]>();
    for (const court of s.courts) {
      const key = court.pulje ?? 0;
      byPulje.set(key, [...(byPulje.get(key) ?? []), court]);
    }

    const courtsHtml = [...byPulje.entries()]
      .sort(([a], [b]) => a - b)
      .map(([pulje, courts]) =>
        puljeSectionHtml(pulje, courts, pulje === 0 ? "Utan pulje" : `Pulje ${pulje}`),
      )
      .join("");

    const activeTab = getActiveTab(container);
    container.innerHTML = renderMainContent(courtsHtml, standingHtml());
    bindTabToggle(container);
    if (activeTab === "standing") setActiveTab(container, "standing");
    renderBanner(container);
  }

  // ── Banner (Fullfør turnering) ──────────────────────────────────────────────

  function renderBanner(container: HTMLElement): void {
    const s = state;
    if (!bannerSlot || !s) return;
    if (!s.isAdmin) {
      bannerSlot.innerHTML = "";
      return;
    }

    const allConfirmed = s.courts.length > 0 && s.courts.every((c) => c.er_bekreftet);
    const isFinalView = variant.fase === "avsluttende" || !s.config.hasFinalPhase;
    const showComplete = allConfirmed && isFinalView;
    const showAutoComplete =
      import.meta.env.VITE_ENV === "dev" && s.courts.length > 0 && !allConfirmed;

    bannerSlot.innerHTML = `
      ${showComplete ? `<button id="complete-tournament-btn" class="btn btn-sm btn-success"${s.config.erfullfort ? " disabled" : ""}>Fullfør turnering</button>` : ""}
      ${showAutoComplete ? '<button id="test-auto-complete-btn" class="btn btn-sm btn-outline-warning">TEST: Autofullfør</button>' : ""}
    `;

    bannerSlot.querySelector("#test-auto-complete-btn")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      if (
        !(await confirmDialog({
          title: "Autofullfør banar",
          message: "Fylle alle manglande omganger med tilfeldige resultat og bekrefte banane?",
        }))
      )
        return;
      btn.disabled = true;
      await autoCompleteCourts(s.stevneid, variant.fase, s.antallOmganger);
      await reload(container);
    });

    bannerSlot.querySelector("#complete-tournament-btn")?.addEventListener("click", async () => {
      if (
        !(await confirmDialog({
          title: "Fullfør turnering",
          message: "Vil du fullføre turneringa? Dette kan ikkje angrast.",
          danger: true,
        }))
      )
        return;
      // Same ranking as the displayed standing — includes carry-over when present
      const { error: plErr } = await writePlacements(s.stevneid, computeStanding());
      if (plErr) {
        showToast("Feil ved lagring av plasseringar", "error");
        return;
      }
      const { error } = await setTournamentCompleted(s.stevneid);
      if (error) {
        showToast("Feil ved fullføring av turnering", "error");
        return;
      }
      await reload(container);
    });
  }

  // ── Player swap (tap one player, tap the other) ─────────────────────────────

  function findParticipant(
    deltakerId: number,
  ): { court: CourtRow; participant: CourtParticipantRow } | null {
    const s = state;
    if (!s) return null;
    for (const court of s.courts) {
      const participant = court.deltakarar.find((p) => p.id === deltakerId);
      if (participant) return { court, participant };
    }
    return null;
  }

  async function handleSwapClick(container: HTMLElement, deltakerId: number): Promise<void> {
    const s = state;
    if (!s) return;

    if (s.swapSelectedId == null) {
      s.swapSelectedId = deltakerId;
      renderView(container);
      showToast("Vel spelaren du vil byte med.", "info");
      return;
    }
    if (s.swapSelectedId === deltakerId) {
      s.swapSelectedId = null;
      renderView(container);
      return;
    }

    const first = findParticipant(s.swapSelectedId);
    const second = findParticipant(deltakerId);
    if (!first || !second) {
      s.swapSelectedId = null;
      renderView(container);
      return;
    }
    if (first.court.id === second.court.id) {
      showToast("Spelarane står allereie på same bane.", "info");
      return;
    }

    const ok = await confirmDialog({
      title: "Byte spelarar",
      message: `Byte ${throwerName(first.participant.kaster)} (bane ${first.court.bane_nummer ?? "?"}) og ${throwerName(second.participant.kaster)} (bane ${second.court.bane_nummer ?? "?"})?`,
    });
    if (!ok) return;

    const { error } = await swapCourtPlayers(first.participant.id, second.participant.id);
    if (error) {
      showToast("Feil ved byte av spelarar.", "error");
      return;
    }
    s.swapSelectedId = null;
    showToast("Spelarane har bytt bane.", "success");
    await reload(container);
  }

  // ── Score editing (admin) ───────────────────────────────────────────────────

  function ringerSum(participant: CourtParticipantRow): number {
    if (participant.totalsum_manuelt) return participant.antall_ringer;
    return participant.omgangar.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0);
  }

  /**
   * Ringer percentage cell content, one decimal. Counted over the omganger
   * actually thrown so the figure stays honest mid-match; a manual total has no
   * partial progress, so it counts the full configured distance.
   */
  function percentCellHtml(antallRinger: number, antallOmganger: number): string {
    const percent = ringerPercent(antallRinger, antallOmganger);
    if (percent == null) return '<span class="bane-detail-dash">—</span>';
    return percent.toFixed(1);
  }

  function participantPercentHtml(participant: CourtParticipantRow): string {
    const s = state!;
    const omganger = participant.totalsum_manuelt ? s.antallOmganger : participant.omgangar.length;
    return percentCellHtml(ringerSum(participant), omganger);
  }

  function openOmgangEdit(deltakerId: number, omgang: number): void {
    const s = state;
    if (!s) return;
    const found = findParticipant(deltakerId);
    if (!found) return;
    const { court, participant } = found;
    const existing = participant.omgangar.find((o) => o.omgang === omgang);
    showOmgangNumberpad([
      {
        header: variant.padHeader(court, participant, omgang, s.antallOmganger),
        playerName: throwerName(participant.kaster),
        initialPoeng: existing?.poeng,
        initialRinger: existing?.antall_ringer ?? undefined,
        onSave: async (poeng, antallRinger) => {
          const { error } = await editCourtOmgang(participant.id, omgang, poeng, antallRinger);
          if (error) {
            showToast("Feil ved lagring av omgang.", "error");
            return false;
          }
          return true;
        },
      },
    ]);
  }

  function openTotalEdit(deltakerId: number): void {
    const s = state;
    if (!s) return;
    const found = findParticipant(deltakerId);
    if (!found) return;
    const { court, participant } = found;
    const hasOmganger = participant.omgangar.length > 0;
    const open = (): void =>
      showTotalNumberpad({
        contextLabel: `Bane ${court.bane_nummer ?? "?"} · Totalsum`,
        playerName: throwerName(participant.kaster),
        antallOmganger: s.antallOmganger,
        initialPoeng:
          participant.totalsum_manuelt || hasOmganger ? totalSum(participant) : undefined,
        initialRinger:
          participant.totalsum_manuelt || hasOmganger ? ringerSum(participant) : undefined,
        onSave: async (poeng, antallRinger) => {
          const { error } = await setCourtTotal(participant.id, poeng, antallRinger);
          if (error) {
            showToast("Feil ved lagring av totalsum.", "error");
            return false;
          }
          showToast("Totalsum lagra.", "success");
          return true;
        },
      });
    if (hasOmganger) {
      void confirmDialog({
        title: "Overstyr med totalsum",
        message: `Dette slettar alle omgangsskår for ${throwerName(participant.kaster)} og lagrar berre totalsummen. Vil du halde fram?`,
        danger: true,
      }).then((ok) => {
        if (ok) open();
      });
    } else {
      open();
    }
  }

  function toggleDetail(container: HTMLElement, deltakerId: number): void {
    const s = state;
    if (!s) return;
    if (s.expandedDeltakerIds.has(deltakerId)) s.expandedDeltakerIds.delete(deltakerId);
    else s.expandedDeltakerIds.add(deltakerId);
    renderView(container);
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  function bindActions(container: HTMLElement): void {
    if (boundContainers.has(container)) return;
    boundContainers.add(container);
    container.addEventListener("click", async (e) => {
      const s = state;
      if (!s) return;
      const target = e.target as Element;

      const registerBtn = target.closest<HTMLElement>("[data-xk-register]");
      if (registerBtn) {
        const court = s.courts.find((c) => c.id === Number(registerBtn.dataset.xkRegister));
        if (court) openEntryPad([court]);
        return;
      }

      const puljeRegisterBtn = target.closest<HTMLElement>("[data-xk-register-pulje]");
      if (puljeRegisterBtn) {
        const pulje = Number(puljeRegisterBtn.dataset.xkRegisterPulje);
        openEntryPad(s.courts.filter((c) => (c.pulje ?? 0) === pulje));
        return;
      }

      const toggleBtn = target.closest<HTMLElement>("[data-xk-toggle-detail]");
      if (toggleBtn) {
        toggleDetail(container, Number(toggleBtn.dataset.xkToggleDetail));
        return;
      }

      const swapCell = target.closest<HTMLElement>("[data-xk-swap]");
      if (swapCell) {
        await handleSwapClick(container, Number(swapCell.dataset.xkSwap));
        return;
      }

      const totalCell = target.closest<HTMLElement>("[data-xk-total]");
      if (totalCell) {
        openTotalEdit(Number(totalCell.dataset.xkTotal));
        return;
      }

      const omgangChip = target.closest<HTMLElement>("[data-xk-omgang-edit]");
      if (omgangChip) {
        const [pid, omgang] = omgangChip.dataset.xkOmgangEdit!.split(":").map(Number);
        openOmgangEdit(pid!, omgang!);
        return;
      }

      const confirmBtn = target.closest<HTMLButtonElement>("[data-xk-confirm]");
      if (confirmBtn && !confirmBtn.disabled) {
        const court = s.courts.find((c) => c.id === Number(confirmBtn.dataset.xkConfirm));
        if (!court) return;
        const ok = await confirmDialog({
          title: "Bekreft resultat",
          message: `Bekrefte resultata for bane ${court.bane_nummer ?? "?"}? Dette låser bana.`,
        });
        if (!ok) return;
        const { error } = await confirmCourt(court.id);
        if (error) {
          showToast("Feil ved bekrefting av resultat.", "error");
          return;
        }
        showToast("Resultata er bekrefta.", "success");
      }
    });
  }

  // ── Data / lifecycle ────────────────────────────────────────────────────────

  async function reload(container: HTMLElement): Promise<void> {
    const s = state;
    if (!s) return;
    try {
      const [configRes, courtsRes, carryRes] = await Promise.all([
        variant.loadConfig(s.stevneid),
        getCourts(s.stevneid, variant.fase),
        variant.loadCarryOver?.(s.stevneid) ?? Promise.resolve({ data: null, error: null }),
      ]);
      if (configRes.error || courtsRes.error || carryRes.error) return; // logError done in the service; keep the last good view
      if (configRes.data) s.config = configRes.data;
      s.courts = courtsRes.data;
      s.carryOver = carryRes.data;
      renderView(container);
    } catch (err) {
      logError("xkastKongelagView.reload", err);
    }
  }

  return async function render(
    container: HTMLElement,
    { id, isAdmin = false }: { id: number; isAdmin?: boolean },
    _bannerSlot: HTMLElement | null = null,
  ): Promise<void> {
    bannerSlot = _bannerSlot;
    if (channel) {
      void unsubscribeChannel(channel);
      channel = null;
    }
    container.replaceChildren(createLoadingState());

    try {
      const [configRes, courtsRes, carryRes] = await Promise.all([
        variant.loadConfig(id),
        getCourts(id, variant.fase),
        variant.loadCarryOver?.(id) ?? Promise.resolve({ data: null, error: null }),
      ]);
      if (configRes.error || courtsRes.error || carryRes.error || !configRes.data) {
        container.replaceChildren(createErrorBanner("Kunne ikkje laste data."));
        return;
      }
      const antallOmganger = configRes.data.antallOmganger;
      if (!antallOmganger) {
        container.replaceChildren(
          createErrorBanner("Kastemetoden manglar antal omganger — sjekk kastemetode-oppsettet."),
        );
        return;
      }

      state = {
        stevneid: id,
        isAdmin,
        config: configRes.data,
        antallOmganger,
        courts: courtsRes.data,
        carryOver: carryRes.data,
        swapSelectedId: null,
        expandedDeltakerIds: new Set(),
      };
      renderView(container);
      bindActions(container);
      channel = subscribeToCourtChanges(
        id,
        variant.channelName(id),
        coalesceReload(() => reload(container)),
        (deltakerId) =>
          (state?.courts ?? []).some((c) => c.deltakarar.some((p) => p.id === deltakerId)),
      );
    } catch (err) {
      logError("xkastKongelagView.render", err);
      container.replaceChildren(createErrorBanner("Kunne ikkje laste data."));
    }
  };
}
