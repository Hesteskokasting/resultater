import type { QueryData } from "@supabase/supabase-js";
import type { Tables } from "@/types";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import { fetchAllRows } from "@/utils/fetchAllRows";
import { yearCache } from "@/utils/yearCache";

// ── Type-inferens-buildarar ───────────────────────────────────────────────────

const _resultaterQuery = supabase.from("resultat").select(`
    id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(id, navn),
    klasse:klasseid(id, navn)
  `);

export type ResultWithRelations = QueryData<typeof _resultaterQuery>[number];

const _stevneNcQuery = supabase
  .from("stevne")
  .select("id, navn, dato, stevnetype:stevnetypeid(id, navn)");

export type TournamentForNC = QueryData<typeof _stevneNcQuery>[number];

// ── Private ───────────────────────────────────────────────────────────────────

const NC_TYPER = ["NC", "SNC", "DNC"];

// ── Eksporterte funksjonar ────────────────────────────────────────────────────

export async function getRules(ar: number) {
  const { data, error } = await supabase
    .from("antallTellendeNc")
    .select("id, year, max_nc_total, max_snc_total, max_dnc_total, maxtotal, max_snc, max_dnc")
    .eq("year", ar)
    .maybeSingle();
  if (error) logError("getRules", error);
  return { data, error };
}

export async function getTournamentsAndResults(ar: number) {
  // A full season passes PostgREST's 1000-row cap, so this is paged, ordered on
  // the primary key to keep the pages from overlapping.
  const { data, error } = await fetchAllRows((from, to) =>
    supabase
      .from("resultat")
      .select(`
      id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn),
      klasse:klasseid(id, navn),
      stevne:stevneid!inner(id, navn, dato, stevnetype:stevnetypeid(id, navn))
    `)
      .gte("stevne.dato", `${ar}-01-01`)
      .lte("stevne.dato", `${ar}-12-31`)
      .not("nc_poeng", "is", null)
      .gt("nc_poeng", 0)
      .order("id")
      .range(from, to),
  );

  if (error) {
    logError("getTournamentsAndResults", error);
    return { stevner: [] as TournamentForNC[], resultater: [] as ResultWithRelations[], error };
  }

  const stevnerMap = new Map<number, TournamentForNC>();
  const resultater: ResultWithRelations[] = [];
  for (const { stevne, ...rest } of data) {
    if (!NC_TYPER.includes(stevne.stevnetype?.navn ?? "")) continue;
    if (!stevnerMap.has(stevne.id)) stevnerMap.set(stevne.id, stevne);
    resultater.push(rest);
  }

  return { stevner: [...stevnerMap.values()], resultater, error: null };
}

// ── Årsbuffer ─────────────────────────────────────────────────────────────────

export interface CupYear {
  rules: Tables<"antallTellendeNc"> | null;
  tournaments: TournamentForNC[];
  results: ResultWithRelations[];
}

const cache = yearCache<CupYear>(async (year) => {
  try {
    const [{ data: rules, error: e1 }, { stevner, resultater, error: e2 }] = await Promise.all([
      getRules(year),
      getTournamentsAndResults(year),
    ]);
    if (e1 || e2) return null;
    return { rules, tournaments: stevner, results: resultater };
  } catch (err) {
    logError("loadCupYear", err);
    return null;
  }
});

/** Drops the buffer so a fresh page mount refetches instead of reusing a stale season. */
export const clearCupYearCache = cache.clear;

/** Everything the Norgescup lists are built from, for one season. Null on failure. */
export const loadCupYear = cache.get;
