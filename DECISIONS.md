# Decision Log

Architectural decisions that aren't obvious from the code or git history.

---

## Innledende-phase deduplication: shared base + thin variant files

**Files:** `src/pages/stevne/innledende/_innledendeBase.ts`, `gloppen.ts`, `nordhordland.ts`

**Why the split exists:**
`gloppen.ts` and `nordhordland.ts` implement the same innledende-phase UI but differ in 5 ways:
- Gloppen has a startkort print button; Nordhordland does not
- Nordhordland uses Swiss-system round generation (`genererNesteSwissRunde`); Gloppen does not
- Nordhordland shows only the latest round by default and has a toggle to reveal earlier rounds; Gloppen always shows all rounds
- The realtime channel name is variant-specific (prevents cross-tournament signal crosstalk)
- Error logging prefixes differ for observability

Rather than one file with branching conditionals, the shared logic lives in `_innledendeBase.ts`
and each kastemetode file is ~30-50 lines of config. No conditionals in the base.

**Pattern for future kastemetoder:**
If `xkast.ts` or another variant is implemented, it should call `createInnledendeRenderer(variant)`
from `_innledendeBase.ts` with its own config. A pure single-round variant (no Swiss, no startkort)
needs only `channelName`, `logPrefix`, `erSwiss: false`, and empty `getBannerExtra`/`bindBannerExtra`.

---

## Service layer placement for test/dev utilities

**File:** `src/services/testDataService.ts`

The `autoFullforInnledendeKamper`, `slettKamperForFase`, and `nullstillStevne` functions are
admin-only test-data utilities, not regular application operations. They were given their own
service file rather than being merged into `adminService.ts` because their scope is clearly
test/setup-only and keeping them separate makes it obvious they should never be called in
production flows.

---

## DB decisions deferred from this refactor

These are intentionally out of scope for the `refactor/cleanup` branch:
- Nullable column audit
- Unique constraints (`kaster.fornavn` + `etternavn`)
- Integer → UUID migration
- Norwegian → English naming in schema and code
