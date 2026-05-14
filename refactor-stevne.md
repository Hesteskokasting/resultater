# Stevne Architectural Restructuring

Tracked separately from the main refactor checklist because this involves moving files across folders
and changing routing — not just a JS→TS migration.

## Goal
- Public URL: `#/stevne/{id}` (replaces `/live/{tab?}`)
- Add "Sluttresultat" tab (content from resultat.js)
- Move stevne-*.js out of `src/organizer/` → `src/pages/stevne/`
- Move pamelding button + "Sjå påmeldingar" link into stevne-info
- Remove `#/resultat/{id}` route; update all 8 callers

## New structure
```
src/pages/
  stevne.ts               ← organizer/stevne-dashboard.js (renamed)
  stevne/
    stevne-info.ts        ← organizer/stevne-info.js
    stevne-deltakere.ts   ← organizer/stevne-deltakere.js
    stevne-innledende.ts  ← organizer/stevne-innledende.js
    stevne-avsluttende.ts ← organizer/stevne-avsluttende.js
    stevne-innstillinger.ts ← organizer/stevne-innstillinger.js
    stevne-resultat.ts    ← NEW (from pages/resultat.js)
```

## Steps

- [x] Create `src/pages/stevne/` folder
- [x] Create `src/services/resultatService.ts`
- [x] Create `src/pages/stevne/stevne-resultat.ts`
- [x] Migrate `stevne-info.ts` — add "Meld deg på" + "Sjå påmeldingar"
- [x] Migrate `stevne-deltakere.ts`
- [x] Migrate `stevne-innledende.ts` (thin wrapper + .d.ts bridge)
- [x] Migrate `stevne-avsluttende.ts` (thin wrapper + .d.ts bridge)
- [x] Migrate `stevne-innstillinger.ts`
- [x] Migrate `stevne-dashboard.js` → `src/pages/stevne.ts` (add resultat tab, update tab list)
- [x] Delete `src/organizer/stevne-dashboard.js`, `stevne-info.js`, `stevne-deltakere.js`, `stevne-innstillinger.js` and `src/pages/resultat.js`
- [x] Update `src/app.js`: remove `/live/{tab?}`, add `/{tab?}`, remove `/resultat/{id}`
- [x] Update 8 `#/resultat/` links in pages/home.ts, terminliste.ts, nmvinnere.ts, rekorder.ts, kastere.ts
- [x] `npm run typecheck` → 0 errors
- [ ] Manual test: public view, organizer view, sluttresultat tab, all former /resultat links

## Tab structure
Public: `info` | `innledende` | `avsluttande` | `resultat`
Organizer (admin only extra tabs): `spillere` | `innstillinger`
