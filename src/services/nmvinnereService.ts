import type { QueryData } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NMCategoryConfig {
  id: number;
  name: string;
  genderFilter: "historical" | "always" | false;
  fromYear: number;
  openFromYear?: number;
  note?: string;
}

export type NMGender = "open" | "all" | "men" | "women";

const _nmResultatQuery = supabase
  .from("resultat")
  .select(
    "id, klasseid, kaster:kasterid(id, fornavn, etternavn), klubb:klubbid(id, navn), stevne:stevneid(id, dato)",
  );

export type NMResultRow = QueryData<typeof _nmResultatQuery>[number];

// ── Caches ────────────────────────────────────────────────────────────────────

const _dataCache = new Map<string, { data: NMResultRow[]; error: unknown }>();
let _genderCache: { id: number; navn: string }[] | null = null;
let _nmClassCache: number[] | null = null;

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Only some classes are ever a championship — a B-cup or a Rekrutt winner is not
 * a Norgesmester. `klasse.har_nm_vinnere` is the authority; asking the database
 * keeps this list in one place instead of a hardcoded copy per caller.
 */
async function getNMClassIds(): Promise<number[]> {
  if (_nmClassCache) return _nmClassCache;
  const { data, error } = await supabase.from("klasse").select("id").eq("har_nm_vinnere", true);
  if (error) {
    // Not cached, so the next category retries instead of serving an empty list forever.
    logError("getNMClassIds", error);
    return [];
  }
  _nmClassCache = data.map((k) => k.id);
  return _nmClassCache;
}

async function getGenderIds(): Promise<{ id: number; navn: string }[]> {
  if (_genderCache) return _genderCache;
  const { data, error } = await supabase.from("kjonn").select("id, navn");
  if (error) logError("getGenderIds", error);
  _genderCache = data ?? [];
  return _genderCache;
}

/** `kjonn.navn` holds the single-letter code M/K, not a spelled-out label. */
function findGenderId(
  genderList: { id: number; navn: string }[],
  gender: NMGender,
): number | undefined {
  const code = gender === "women" ? "k" : "m";
  return genderList.find((k) => k.navn.trim().toLowerCase() === code)?.id;
}

// ── Exported function ─────────────────────────────────────────────────────────

export async function getNMData(
  category: NMCategoryConfig,
  gender: NMGender,
): Promise<{ data: NMResultRow[]; error: unknown }> {
  const cacheKey = `${category.id}-${gender}`;
  if (_dataCache.has(cacheKey)) return _dataCache.get(cacheKey)!;

  let stevneQuery = supabase
    .from("stevne")
    .select("id, dato")
    .eq("ernm", true)
    .eq("kategoriid", category.id);

  if (category.genderFilter === "historical" && category.openFromYear != null) {
    if (gender === "open") {
      stevneQuery = stevneQuery.gte("dato", `${category.openFromYear}-01-01`);
    } else {
      stevneQuery = stevneQuery.lt("dato", `${category.openFromYear}-01-01`);
    }
  }

  const { data: stevner, error: e1 } = await stevneQuery;
  if (e1) {
    logError("getNMData.stevner", e1);
    return { data: [], error: e1 };
  }

  const ids = (stevner ?? []).map((s) => s.id);
  if (!ids.length) {
    const empty = { data: [] as NMResultRow[], error: null };
    _dataCache.set(cacheKey, empty);
    return empty;
  }

  const filterByGender =
    (category.genderFilter === "historical" && gender !== "open") ||
    (category.genderFilter === "always" && gender !== "all");

  const kasterJoin = filterByGender
    ? "kaster:kasterid!inner(id, fornavn, etternavn)"
    : "kaster:kasterid(id, fornavn, etternavn)";

  let resultatQuery = supabase
    .from("resultat")
    .select(`id, klasseid, ${kasterJoin}, klubb:klubbid(id, navn), stevne:stevneid(id, dato)`)
    .eq("plassering", 1)
    .in("stevneid", ids)
    .in("klasseid", await getNMClassIds())
    // gruppe 2 is B — a B-final winner is not a Norgesmester. No flag on `gruppe`
    // to lean on the way klasse.har_nm_vinnere does, so the id stays hardcoded.
    .or("gruppeid.is.null,gruppeid.neq.2");

  if (filterByGender) {
    const genderId = findGenderId(await getGenderIds(), gender);
    // Skipping the filter on a miss silently listed both genders under a
    // gendered heading. An error is better than a wrong list.
    if (genderId == null) {
      const err = new Error(`Fann ingen kjønns-id for "${gender}"`);
      logError("getNMData.gender", err);
      return { data: [], error: err };
    }
    resultatQuery = resultatQuery.eq("kaster.kjonnid", genderId);
  }

  if (category.genderFilter === "historical" && gender === "open") {
    resultatQuery = resultatQuery.eq("klasseid", 1);
  }

  const { data: rader, error: e2 } = await resultatQuery;
  if (e2) {
    logError("getNMData.resultater", e2);
    return { data: [], error: e2 };
  }

  const entry = { data: (rader ?? []) as NMResultRow[], error: null };
  _dataCache.set(cacheKey, entry);
  return entry;
}
