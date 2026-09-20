import { supabase } from "@/supabase";
import { escHtml } from "@/utils/escHtml";
import { throwerName } from "@/utils/kaster";
import { logError } from "@/utils/logError";
import { createErrorBanner, createLoadingState, createEmptyState } from "@/components/states";
import { getHashQueryParam } from "@/utils/navigation";
import { createSearchSelect } from "@/components/SearchSelect";

// ponytail: test page, all logic inline. Split into service + logic when it ships for real.

interface RoundRow {
  omgang: number;
  score: number;
  antall_ringer: number;
}

interface PlayerRow {
  kasterid: number;
  navn: string;
  score_poeng: number;
  antall_ringer: number;
  kamp_plassering: number | null;
  omgangar: RoundRow[];
}

interface MatchRow {
  id: number;
  fase: string;
  runde_nummer: number;
  runde_navn: string | null;
  gruppe_navn: string | null;
  bane_nummer: number | null;
  er_bekreftet: boolean;
  er_walkover: boolean;
  spelarar: PlayerRow[];
}

interface TournamentRow {
  id: number;
  navn: string;
  dato: string;
}

const state = { tournamentId: 0, playerId: null as number | null };

// ── Data ──────────────────────────────────────────────────────────────────────

async function fetchTournaments(): Promise<TournamentRow[]> {
  const { data, error } = await supabase
    .from("stevne")
    // Inner joins keep only tournaments with at least one registered omgang;
    // the limits make each match just one probe row instead of the whole tree.
    .select("id, navn, dato, kamp!inner(id, kamp_spelar!inner(id, kamp_omgang!inner(id)))")
    .limit(1, { referencedTable: "kamp" })
    .limit(1, { referencedTable: "kamp.kamp_spelar" })
    .limit(1, { referencedTable: "kamp.kamp_spelar.kamp_omgang" })
    .order("dato", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(({ id, navn, dato }) => ({ id, navn, dato }));
}

async function fetchMatches(tournamentId: number): Promise<MatchRow[]> {
  const { data, error } = await supabase
    .from("kamp")
    .select(`
      id,
      fase,
      runde_nummer,
      runde_navn,
      gruppe_navn,
      bane_nummer,
      er_bekreftet,
      er_walkover,
      spelarar:kamp_spelar(
        kasterid,
        score_poeng,
        antall_ringer,
        kamp_plassering,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(omgang, score, antall_ringer)
      )
    `)
    .eq("stevneid", tournamentId)
    .order("runde_nummer")
    .order("id");
  if (error) throw error;

  const phaseRank = (fase: string): number => (fase === "innledende" ? 0 : 1);

  return (data ?? [])
    .map((m) => ({
      ...m,
      spelarar: m.spelarar.map((sp) => ({
        kasterid: sp.kasterid,
        navn: sp.kaster ? throwerName(sp.kaster) : `#${sp.kasterid}`,
        score_poeng: sp.score_poeng,
        antall_ringer: sp.antall_ringer,
        kamp_plassering: sp.kamp_plassering,
        omgangar: [...sp.omgangar].sort((a, b) => a.omgang - b.omgang),
      })),
    }))
    .filter((m) => m.spelarar.some((sp) => sp.omgangar.length > 0))
    .sort(
      (a, b) =>
        phaseRank(a.fase) - phaseRank(b.fase) || a.runde_nummer - b.runde_nummer || a.id - b.id,
    );
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function matchTitle(m: MatchRow): string {
  const parts = [
    m.runde_navn ?? `${m.fase} runde ${m.runde_nummer}`,
    m.gruppe_navn,
    m.bane_nummer != null ? `bane ${m.bane_nummer}` : null,
    m.er_walkover ? "walkover" : null,
    m.er_bekreftet ? null : "ikkje bekrefta",
  ].filter(Boolean);
  return `Kamp ${m.id} — ${parts.join(" · ")}`;
}

function matchHtml(m: MatchRow): string {
  const roundCount = Math.max(0, ...m.spelarar.map((sp) => sp.omgangar.length));
  const headers = Array.from({ length: roundCount }, (_, i) => `<th>${i + 1}</th>`).join("");

  const rows = m.spelarar
    .map((sp) => {
      let acc = 0;
      const cells = Array.from({ length: roundCount }, (_, i) => {
        const o = sp.omgangar[i];
        if (!o) return `<td class="text-muted">–</td>`;
        acc += o.score;
        return `<td>${o.score}<div class="small text-muted">${acc}</div></td>`;
      }).join("");
      const shoes = sp.omgangar.length * 2;
      const ringerPct = shoes > 0 ? `${((sp.antall_ringer / shoes) * 100).toFixed(1)}%` : "–";
      return `<tr>
        <td>${escHtml(sp.navn)}</td>${cells}
        <td class="fw-semibold">${sp.score_poeng}</td>
        <td>${sp.antall_ringer}</td>
        <td>${ringerPct}</td>
        <td>${sp.kamp_plassering ?? "–"}</td>
      </tr>`;
    })
    .join("");

  return `
    <div class="card mb-3">
      <div class="card-header py-1 small">${escHtml(matchTitle(m))}</div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered mb-0 align-middle text-center">
          <thead><tr><th class="text-start">Spelar</th>${headers}<th>Sum</th><th>Ring</th><th>Ring%</th><th>Pl.</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function filterMatches(matches: MatchRow[], playerId: number | null): MatchRow[] {
  if (playerId == null) return matches;
  return matches.filter((m) => m.spelarar.some((sp) => sp.kasterid === playerId));
}

/** Unique players across the tournament's matches, sorted by name. */
function playerOptions(matches: MatchRow[]): { id: number; label: string }[] {
  const byId = new Map<number, string>();
  for (const m of matches) for (const sp of m.spelarar) byId.set(sp.kasterid, sp.navn);
  return [...byId]
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "nb"));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState("Laster stevne…"));

  let tournaments: TournamentRow[];
  try {
    tournaments = await fetchTournaments();
  } catch (err) {
    logError("kampstatistikk.fetchTournaments", err);
    container.replaceChildren(createErrorBanner("Kunne ikkje laste stevne."));
    return;
  }

  if (!tournaments.length) {
    container.replaceChildren(createEmptyState("Ingen stevne funne."));
    return;
  }

  const fromUrl = Number(getHashQueryParam("stevneid"));
  state.tournamentId = tournaments.some((t) => t.id === fromUrl) ? fromUrl : tournaments[0]!.id;
  state.playerId = Number(getHashQueryParam("kasterid")) || null;

  container.innerHTML = `
    <div class="content-page">
      <h1 class="h4 mb-3">Kampstatistikk (test)</h1>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <select id="ks-stevne" class="form-select form-select-sm w-auto">
          ${tournaments
            .map(
              (t) =>
                `<option value="${t.id}"${t.id === state.tournamentId ? " selected" : ""}>${escHtml(t.dato)} — ${escHtml(t.navn)}</option>`,
            )
            .join("")}
        </select>
        <div id="ks-spelar" class="w-auto"></div>
      </div>
      <p id="ks-count" class="small text-muted"></p>
      <div id="ks-list"></div>
    </div>`;

  const list = container.querySelector<HTMLElement>("#ks-list")!;
  const count = container.querySelector<HTMLElement>("#ks-count")!;
  let matches: MatchRow[] = [];

  function draw(): void {
    const shown = filterMatches(matches, state.playerId);
    count.textContent = `${shown.length} av ${matches.length} kampar`;
    list.innerHTML = shown.length
      ? shown.map((m) => matchHtml(m)).join("")
      : `<p class="text-muted">Ingen kampar.</p>`;
  }

  const playerSlot = container.querySelector<HTMLElement>("#ks-spelar")!;

  // replaceState, not location.hash: a hashchange would re-render the whole page.
  function syncUrl(): void {
    const player = state.playerId == null ? "" : `&kasterid=${state.playerId}`;
    history.replaceState(
      history.state,
      "",
      `#/kampstatistikk?stevneid=${state.tournamentId}${player}`,
    );
  }

  // Rebuilt per tournament: the roster changes with it.
  function mountPlayerPicker(): void {
    const slot = document.createElement("span");
    playerSlot.replaceChildren(slot);
    createSearchSelect({
      slot,
      items: playerOptions(matches),
      value: state.playerId,
      placeholder: "Vel spelar…",
      clearLabel: "Alle spelarar",
      onSelect: (id) => {
        state.playerId = id;
        syncUrl();
        draw();
      },
    });
  }

  async function load(): Promise<void> {
    list.replaceChildren(createLoadingState("Laster kampar…"));
    count.textContent = "";
    try {
      matches = await fetchMatches(state.tournamentId);
      // The pick survives a tournament change, but only where that player competed.
      const roster = playerOptions(matches);
      if (!roster.some((p) => p.id === state.playerId)) state.playerId = null;
      mountPlayerPicker();
      syncUrl();
      draw();
    } catch (err) {
      logError("kampstatistikk.fetchMatches", err);
      list.replaceChildren(createErrorBanner("Kunne ikkje laste kampar."));
    }
  }

  container.querySelector<HTMLSelectElement>("#ks-stevne")!.addEventListener("change", (e) => {
    state.tournamentId = Number((e.target as HTMLSelectElement).value);
    void load();
  });

  await load();
}
