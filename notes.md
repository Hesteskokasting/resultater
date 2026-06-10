Bug: Swiss round 2+ court assignment ignores startnummer tiebreaker

genererNesteSwissRunde passes { kasterid, kamp_poeng, score_poeng } to sorterStilling but omits startnummer. Among equally-ranked players, court order is non-deterministic. Fix: fetch startnummer from resultat where stevneid = stevneid, build a kasteridToStartnr map, and add startnummer: kasteridToStartnr[kid] to each spelarar object before calling sorterStilling.


Prevent cup matches to be confirmed if not player has >2 lead. Should be done in pshase 5 instead

The object, object toast — Supabase's PostgrestError is a plain object, not an Error, so the err instanceof Error ? err.message : String(err) pattern degrades to [object Object]. New errorMessage() util in @/utils/errorMessage handles both shapes; parTab uses it now. Tech debt flag: that same broken pattern exists in ~10 other toast sites (stevne-deltakere, stevne-info, …) — worth a sweep in a separate commit.
