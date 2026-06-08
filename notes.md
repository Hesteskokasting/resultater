Bug: Swiss round 2+ court assignment ignores startnummer tiebreaker

genererNesteSwissRunde passes { kasterid, kamp_poeng, score_poeng } to sorterStilling but omits startnummer. Among equally-ranked players, court order is non-deterministic. Fix: fetch startnummer from resultat where stevneid = stevneid, build a kasteridToStartnr map, and add startnummer: kasteridToStartnr[kid] to each spelarar object before calling sorterStilling.


Prevent cup matches to be confirmed if not player has >2 lead. Should be done in pshase 5 instead