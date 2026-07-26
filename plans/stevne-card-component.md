# Plan: single reusable StevneCard component

Replace the per-page stevne/result card markup with ONE reusable component, used on:
Forside (Siste resultat + Kommande), Terminliste (mobile cards), Minside (Påmeldingar).

## Decisions locked in

- **Terminliste:** keep the sortable desktop `<table>`; only the mobile card renderer moves
  to the new component.
- **Registration action:** reuse the existing stateful `createRegistrationButton`
  (`PameldingKnapp.ts`) via the existing `data-registration-slot` + `bindRegistrationSlots`
  seam. The card emits the placeholder; binding hydrates it. No generic `action:{label,onClick}`.
- **Minside Påmeldingar:** converts from a Bootstrap `<table>` to a card list.

## Deviations from the written spec (with rationale)

1. **CSS tokens.** Spec names (`--text-primary`, `--fill-accent`, `--on-accent`,
   `--border-danger`, `--text-danger`) do not exist. Map to real theme tokens:
   - title → `var(--tekst)` weight 500
   - secondary (date/meta) → `var(--tekst-2)`
   - accent button → bg `var(--primaer)`, text `var(--primaer-text)`
   - danger outline → border/text `var(--feil)`, transparent bg
   - live red → `var(--live-prikk)`
   - neutral stripe (done/upcoming) → `var(--kant-2)`
2. **No `<button>` inside `<a>`** (invalid HTML). Use the **stretched-link pattern**: the
   card is a positioned container; `.stevne-kort__link::after { inset:0 }` stretches the
   anchor hit-area over the whole card; the registration button is a **sibling** with a
   higher `z-index`. Whole-card tap navigates; button click lands on the button. Because the
   button is not a descendant of the anchor, `stopPropagation`/`preventDefault` are not
   needed structurally (spec asked for them to defeat nesting we no longer have).
3. **Chevron via inline SVG**, not `bi-chevron-right` — Bootstrap Icons is not loaded and
   is not worth adding as a dependency. Matches the existing inline-SVG convention.

## Component API — `src/components/StevneCard.ts`

```ts
export type StevneCardStatus = 'live' | 'done' | 'upcoming'

export interface StevneCardProps {
  title: string
  href: string                 // e.g. "#/stevne/2310/resultat"
  date: string                 // preformatted display date
  status: StevneCardStatus
  meta?: string[]              // secondary lines: Sted, Arrangør, Type
  badge?: string               // pill text, e.g. "NM"
  invitationUrl?: string       // external innbydelse PDF (upcoming/terminliste); secondary sibling link
  registrationSlotId?: number  // when set → trailing slot emits <span data-registration-slot="id">;
                               // hydrated later by bindRegistrationSlots. No chevron in this case.
}
```

`createStevneCard(props): HTMLElement` returns a `<div class="stevne-kort stevne-kort--{status}">`:
- `<span class="stevne-kort__stripe">` — 3px inner colored left stripe (overflow:hidden on card).
- `<a class="stevne-kort__link" href aria-label="${title}, ${date}">` wrapping title + date;
  `::after` stretches over the whole card.
- title `.stevne-kort__title` (var(--tekst), 500), date `.stevne-kort__date` (var(--tekst-2)),
  optional `.stevne-kort__meta` lines, optional `.stevne-kort__badge` pill, optional live dot
  via `livePillHtml()`.
- Trailing slot precedence: registration placeholder → chevron SVG (default).
- Invitation link, when present, is a small secondary sibling link (z-index above overlay).
- All user strings escaped with `escHtml`.

## Step-by-step checklist (one commit per step)

1. **Component + CSS.** Create `StevneCard.ts`; add `.stevne-kort` BEM rules to `styles.css`
   (12px radius, padding, ≥44px tap target, stripe child, statuses, stretched link, chevron,
   badge, meta). Reuse `livePillHtml()` + `--live-prikk`. No new dependency.
2. **Home.** Replace the result + upcoming card string builders with `createStevneCard`.
   Remove the "Vis resultat" link (`done` card = whole-card tap + chevron). Live hero banner
   stays untouched. Keep the registration-slot binding for upcoming cards.
3. **Terminliste.** Replace the mobile `.tl-kort` renderer with `createStevneCard`
   (meta = Sted/Arrangør/Type, badge = NM, invitationUrl = innbydelseurl). Keep the desktop
   table. Unify the mobile date to `formatDateLong`.
4. **Minside Påmeldingar.** Convert the table to a `createStevneCard` list. Card body →
   `#/stevne/:id/info` (spec update; was `/pamelding`). Trailing = registration slot.
5. **Cleanup + verify.** Remove now-dead CSS (`.tournament-card`, `.tl-kort`,
   `.tournament-link`, `.tournament-name`, `.tournament-date` if unreferenced). Run
   `npm run typecheck && npm run typecheck:test && npm run test:run`. Manual: `npm run build
   && npm run preview` — verify all three lists, keyboard focus/Enter, middle-click, and that
   tapping Meld på/av does not navigate.

## Open item for step 2 review

Invitation (`innbydelseurl`) link: proposed as a small secondary sibling link above the
stretch overlay so it stays a distinct, clearly-secondary action rather than reintroducing a
second blue element competing with the title. Confirm styling when we get there.
