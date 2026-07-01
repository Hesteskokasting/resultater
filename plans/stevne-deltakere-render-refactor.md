# Refactor plan: reduce complexity of `render` in stevne-deltakere.ts

## Context

`npx fallow health` flagged `render` in `src/pages/stevne/stevne-deltakere.ts` as the single worst complexity offender in the codebase (cyclomatic 29, cognitive 30, 224 lines, CRAP score 870 — the highest of any function in the project). This is pure refactor work: no behavior change, no new feature. The function currently does everything inline — data fetching/validation, registration-map bookkeeping, and building two deeply-nested UI columns (available throwers / registered throwers with confirm/remove/print-cell logic) — in one 224-line function body. The goal is to bring it under fallow's default thresholds (cyclomatic <20, cognitive <15) by extracting well-scoped, single-responsibility pieces, without touching the actual behavior.

## Where new code goes

- **`src/pages/stevne/_deltakereColumns.ts`** (new) — the two DOM-building column factories. This follows an existing project convention for page-local, non-reusable helper files (leading underscore, precedent: `src/pages/_kastereListe.ts`, `src/pages/_kastereDetalj.ts`, `src/pages/stevne/avsluttende/_avslCupGenererRundeDialog.ts`). Not a `create<Name>()` component in `src/components/` because this UI isn't reused elsewhere (`parTab.ts`'s similar-looking left column has different drag-and-drop semantics — merging them would be scope creep).
- **`src/utils/registrationLookup.ts`** (new) — pure `registeredMap`/`pairedIds` builder, since `utils/` must stay Supabase/DOM-free and this qualifies. Gets a unit test per the project's extract-then-test convention.
- Everything else (phase/permission booleans, try/catch, final wiring) stays in `stevne-deltakere.ts`.

Verified against the actual codebase: `RegistrationStatusRow` (pameldingService.ts:14) and `TournamentHeaderRow` (stevneService.ts:258) are already exported types — no new interfaces need to be hand-rolled for these.

## Step 1 — `src/utils/registrationLookup.ts`

```ts
import type { RegistrationStatusRow } from '@/services/pameldingService'

export interface RegistrationLookup {
  registeredMap: Map<number, boolean>
  pairedIds: Set<number>
}

export function buildRegistrationLookup(rows: RegistrationStatusRow[]): RegistrationLookup {
  const registeredMap = new Map<number, boolean>()
  const pairedIds = new Set<number>()
  for (const p of rows) {
    if (p.kasterid != null) {
      registeredMap.set(p.kasterid, p.er_bekreftet ?? false)
      if (p.lag_id != null) pairedIds.add(p.kasterid)
    }
  }
  return { registeredMap, pairedIds }
}
```

Moves lines 84-91 of the current file. Call site: `const { registeredMap, pairedIds } = buildRegistrationLookup(registrationRes.data)` — both remain `render`-local, mutated in place downstream exactly as today.

**Test** (`tests/registrationLookup.test.ts`): kasterid null → skipped; er_bekreftet null → false; lag_id present → paired; lag_id null → not paired; empty array.

**Risk:** none — pure, no closures.

## Step 2 — `loadDeltakereData` (same-file private helper)

```ts
interface DeltakereData {
  stevne: TournamentHeaderRow
  throwers: ThrowerListRow[]
  registration: RegistrationStatusRow[]
  isGloppen: boolean
}

async function loadDeltakereData(id: number): Promise<
  { data: DeltakereData; error: null } | { data: null; error: string }
> {
  const [stevneRes, throwersRes, registrationRes, methodRes] = await Promise.all([
    getTournamentHeader(id),
    getActiveThrowerList(),
    getRegistrationStatusForTournament(id),
    getInitialMethodName(id),
  ])

  if (stevneRes.error || !stevneRes.data) return { data: null, error: 'Stevne ikkje funne.' }
  if (throwersRes.error) return { data: null, error: 'Kunne ikkje laste kasterliste.' }

  return {
    data: {
      stevne: stevneRes.data,
      throwers: throwersRes.data,
      registration: registrationRes.data,
      isGloppen: !methodRes.error && methodRes.navn.includes('gloppen'),
    },
    error: null,
  }
}
```

Call site:
```ts
const { data, error } = await loadDeltakereData(id)
if (error) { container.replaceChildren(createErrorBanner(error)); return }
const { stevne, throwers: allThrowers, registration, isGloppen } = data
```

**Risk:** low — preserve exact error-precedence order (stevne checked before throwers); no side effects on shared state.

## Step 3 — phase/permission booleans: SKIP

Only ~4 short-circuit/ternary derivations — not worth extracting on its own (premature abstraction for a handful of complexity points). Fallback only: if steps 1/2/4/5 don't bring the function comfortably under threshold, revisit as a same-file `deriveTournamentFlags(stevne, isAdmin, methodResult)` helper (not utils/, since it's single-call-site).

## Step 4 — `createAvailableColumn` (left column) in `_deltakereColumns.ts`

```ts
export interface AvailableColumnHandle {
  element: HTMLElement
  searchInput: HTMLInputElement
  table: PlayerTableHandle
}

export interface AvailableColumnProps {
  canEdit: boolean
  tournamentId: number
  onRegistered: (kasterid: number) => void   // map mutation + dirty flag + banner invalidation, owned by caller
  refreshLists: () => void                   // re-render both tables after a change
}

export function createAvailableColumn(props: AvailableColumnProps): AvailableColumnHandle {
  const { canEdit, tournamentId, onRegistered, refreshLists } = props

  const leftWrapper = document.createElement('div')
  leftWrapper.className = 'col-md-6 d-flex flex-column participant-column'

  const searchInput = document.createElement('input')
  searchInput.type = 'text'
  searchInput.placeholder = 'Søk etter navn eller klubb…'
  searchInput.className = 'form-control mb-2'

  const table = createPlayerTable({
    formatTitle: () => 'Tilgjengelege spelarar',
    emptyText: 'Ingen spelarar funne',
    clubFallback: 'Ingen klubb',
    onRowClick: canEdit
      ? async s => {
          const { error } = await addRegistrationAdmin(tournamentId, s.id)
          if (error) { showToast('Feil ved innmelding: ' + errorMessage(error), 'error'); return }
          onRegistered(s.id)
          refreshLists()
        }
      : undefined,
  })

  leftWrapper.appendChild(searchInput)
  leftWrapper.appendChild(table.element)
  return { element: leftWrapper, searchInput, table }
}
```

Moves lines 117-148 (the `!isStarted` left-column block contents; the `if` guard and `layout.appendChild` stay in `render`). The original click handler's four side effects (`registeredMap.set`, `pairTabDirty = true`, `printerBanner?.invalidateMatchData()`, both re-renders) split into caller-supplied `onRegistered` (map/flag/banner) + `refreshLists` (both re-renders) — keeps this file ignorant of `pairTabDirty`/`printerBanner` internals.

Call site in `render`:
```ts
let leftColumn: AvailableColumnHandle | null = null
if (!isStarted) {
  leftColumn = createAvailableColumn({
    canEdit,
    tournamentId: id,
    onRegistered: kasterid => {
      registeredMap.set(kasterid, false)
      pairTabDirty = true
      printerBanner?.invalidateMatchData()
    },
    refreshLists: () => { renderRegisteredList(); renderAvailableList() },
  })
  layout.appendChild(leftColumn.element)
}
```

**Risk: medium.** Confirm `onRegistered` then `refreshLists` stay strictly synchronous with no `await` in between (matches today's ordering). Drop `registeredMap` from `AvailableColumnProps` if it turns out unused inside the factory (filtering lives in `renderAvailableList`, not here).

## Step 5 — `createRegisteredColumn` (right column) in `_deltakereColumns.ts`

```ts
export interface RegisteredColumnHandle {
  element: HTMLElement
  table: PlayerTableHandle
}

export interface RegisteredColumnProps {
  isStarted: boolean
  canEdit: boolean
  tournamentId: number
  registeredMap: Map<number, boolean>
  pairedIds: Set<number>
  printerBanner: PrinterBanner | undefined
  onConfirmed: (kasterid: number) => void
  onRemoved: (kasterid: number) => void
  refreshRegisteredList: () => void
  refreshBothLists: () => void
}

export function createRegisteredColumn(props: RegisteredColumnProps): RegisteredColumnHandle {
  const {
    isStarted, canEdit, tournamentId, registeredMap, pairedIds,
    printerBanner, onConfirmed, onRemoved, refreshRegisteredList, refreshBothLists,
  } = props

  const rightWrapper = document.createElement('div')
  rightWrapper.className = (isStarted ? 'col-12' : 'col-md-6') + ' d-flex flex-column participant-column'

  if (!isStarted) {
    const searchSpacer = document.createElement('input')
    searchSpacer.type = 'text'
    searchSpacer.className = 'form-control mb-2 participant-search-spacer'
    searchSpacer.tabIndex = -1
    searchSpacer.disabled = true
    rightWrapper.appendChild(searchSpacer)
  }

  const renderPrintCell = printerBanner
    ? (sp: ThrowerListRow): HTMLElement | null => {
        const handler = printerBanner.getPrintHandler()
        if (!handler) return null
        const printBtn = document.createElement('button')
        printBtn.textContent = '🖨'
        printBtn.className = 'btn btn-outline-secondary btn-sm p-0 lh-1 participant-print-btn'
        printBtn.title = 'Skriv ut startkort'
        printBtn.addEventListener('click', e => { e.stopPropagation(); handler(sp) })
        return printBtn
      }
    : null

  const table = createPlayerTable({
    formatTitle: n => `Påmelde spelarar: ${n}`,
    emptyText: 'Ingen spelarar påmelde',
    renderLeading: sp => {
      if (registeredMap.get(sp.id) ?? false) {
        const checkmark = document.createElement('span')
        checkmark.className = 'text-success fw-bold'
        checkmark.textContent = '✓'
        return checkmark
      }
      if (!canEdit) return null
      const confirmBtn = document.createElement('button')
      confirmBtn.textContent = '✓'
      confirmBtn.className = 'btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 participant-confirm-btn'
      confirmBtn.title = 'Bekreft spelar'
      confirmBtn.addEventListener('click', async e => {
        e.stopPropagation()
        const { error } = await confirmRegistrationForThrower(tournamentId, sp.id)
        if (error) { showToast('Feil ved bekreftelse: ' + errorMessage(error), 'error'); return }
        onConfirmed(sp.id)
        refreshRegisteredList()
      })
      return confirmBtn
    },
    renderTrailing: [
      sp => canEdit
        ? createRemoveButton({
            title: 'Fjern spelar',
            onClick: async () => {
              if (pairedIds.has(sp.id)) { showToast('Kan ikkje fjerne spelar som er i eit par. Slett paret fyrst.', 'error'); return }
              const { error } = await removeRegistrationForThrower(tournamentId, sp.id)
              if (error) { showToast('Feil ved fjerning: ' + errorMessage(error), 'error'); return }
              onRemoved(sp.id)
              refreshBothLists()
            },
          })
        : null,
      ...(renderPrintCell ? [renderPrintCell] : []),
    ],
  })
  rightWrapper.appendChild(table.element)
  return { element: rightWrapper, table }
}
```

Moves lines 152-222. Same `onX` + `refreshY` split pattern as Step 4.

Call site in `render`:
```ts
const registeredColumn = createRegisteredColumn({
  isStarted, canEdit, tournamentId: id, registeredMap, pairedIds, printerBanner,
  onConfirmed: kasterid => registeredMap.set(kasterid, true),
  onRemoved: kasterid => {
    registeredMap.delete(kasterid)
    pairTabDirty = true
    printerBanner?.invalidateMatchData()
  },
  refreshRegisteredList: () => renderRegisteredList(),
  refreshBothLists: () => { renderRegisteredList(); renderAvailableList() },
})
layout.appendChild(registeredColumn.element)
```

**This is the single biggest complexity win** — the right column has the deepest nesting in the whole function.

**Risk: medium.**
1. `printerBanner` is captured once at `createRegisteredColumn` call time; confirm it's never reassigned after that point in `render` (it isn't — `let printerBanner` is set at most once, before `layout` is built).
2. `pairedIds` is passed by reference and later mutated in place by the pair-tab's `onPairsChanged` (`.clear()`/`.add()`) — confirm the remove-button guard reads it live (same object, not cloned), so pair-tab changes still take effect without rebuilding the column.

## Step 6 — Rewire `renderRegisteredList`/`renderAvailableList`

```ts
function renderRegisteredList(): void {
  registeredColumn.table.setPlayers(sortThrowers(allThrowers.filter(p => registeredMap.has(p.id))))
}

function renderAvailableList(): void {
  if (!leftColumn) return
  leftColumn.table.setPlayers(sortThrowers(filterAvailable(allThrowers, leftColumn.searchInput.value, registeredMap)))
}
```

The old two-variable guard (`if (!searchInput || !availableTable) return`) collapses to `if (!leftColumn) return` — safe, since both were always set together in the original `if (!isStarted)` block. Also update the final wiring: `leftColumn?.searchInput.addEventListener('input', renderAvailableList)`.

## Expected result

Rough budget from 29 cyclomatic / 30 cognitive: Step 1 (-3/-4) → Step 2 (-2/-2) → Step 4 (-1/-2) → Step 5 (-8/-12) → **~15 cyclomatic / ~10 cognitive**, comfortably under fallow's 20/15 thresholds. `render` itself drops from 224 to roughly 90-110 lines.

If still over threshold after all steps, the fallback is Step 3's `deriveTournamentFlags`, not further fragmenting Steps 4/5 (would be premature abstraction for page-specific, non-reused UI).

## Import changes

- `stevne-deltakere.ts`: remove `createRemoveButton` (only used inside the extracted right column now); add `createAvailableColumn`/`createRegisteredColumn` (from `./_deltakereColumns`), `buildRegistrationLookup` (from `@/utils/registrationLookup`).
- `_deltakereColumns.ts`: `createPlayerTable`/`PlayerTableHandle`, `createRemoveButton`, `showToast`, `errorMessage`, `addRegistrationAdmin`/`confirmRegistrationForThrower`/`removeRegistrationForThrower`, `ThrowerListRow`, `PrinterBanner` type.
- `registrationLookup.ts`: `RegistrationStatusRow` type only.

## Verification

1. `npm run typecheck && npm run typecheck:test && npm run test:run` after each step.
2. Re-run `npx fallow health` on the file to confirm `render` drops under threshold.
3. **Manual browser verification** (required for UI changes per project convention) — start the dev server and check, for a real tournament in each state:
   - **Admin add/remove/confirm, not started, individual category**: search filters correctly; clicking an available thrower moves them to registered instantly; confirm checkmark flips without reordering unrelated rows; remove moves them back to available; error toasts show exact expected text on a forced failure.
   - **Non-admin / read-only**: no confirm/remove buttons; no row-click side effects; verify both "not started, non-admin" and "started" (no left column at all).
   - **Gloppen + printer banner** (`isAdmin`, `isGloppen`, `isStarted`): banner renders above the layout; right column is full-width with no spacer; print button present/absent tracks printer connection live; a roster change invalidates cached match data (verify a freshly printed start card reflects it).
   - **Team/pair tab lazy refresh** (`isTeam`): switching to "Administrer par" first time fetches; switching away and back without a roster change does not re-fetch; a roster change in between forces a re-fetch; removing a paired thrower is blocked with the correct toast; creating/deleting a pair updates the remove-guard live.
   - **Tournament already started**: left column and its search input are absent from the DOM; right column is full-width with no spacer; list is fully read-only regardless of `isAdmin` (since `canEdit` is false once started).

### Critical files
- `src/pages/stevne/stevne-deltakere.ts` (edit)
- `src/pages/stevne/_deltakereColumns.ts` (new)
- `src/utils/registrationLookup.ts` (new)
- `tests/registrationLookup.test.ts` (new)
- `src/components/PlayerTable.ts`, `src/pages/stevne/PrinterBanner.ts`, `src/services/pameldingService.ts` (reference only)
