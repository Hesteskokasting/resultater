import { escHtml } from '@/utils/escHtml'

export type StevneCardStatus = 'live' | 'done' | 'upcoming'

export interface StevneCardProps {
  title: string
  /** Navigation target, e.g. "#/stevne/2310/resultat". The whole card links here. */
  href: string
  /** Preformatted display date. */
  date: string
  status: StevneCardStatus
  /** Secondary lines (Sted, Arrangør, Type). */
  meta?: string[]
  /** Optional pill text, e.g. "NM" or "Live". */
  badge?: string
  /**
   * When set, the trailing slot emits a `<span data-registration-slot>` placeholder
   * (hydrated later by `bindRegistrationSlots`) instead of the chevron.
   */
  registrationSlotId?: number
}

// Bootstrap Icons is not loaded in this app; use an inline SVG chevron (matches the
// existing inline-SVG convention, e.g. the theme switch in index.html).
const CHEVRON_SVG =
  '<svg class="stevne-kort__chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" ' +
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'

/**
 * Single reusable stevne card. The whole card is one tap target (a stretched link) that
 * navigates to `href`. A registration button, when present, is a sibling that sits above the
 * stretched link, so tapping it never triggers card navigation.
 */
export function createStevneCard(props: StevneCardProps): HTMLElement {
  const card = document.createElement('div')
  card.className = `stevne-kort stevne-kort--${props.status}`

  const liveDot = props.status === 'live' ? '<span class="live-prikk" aria-hidden="true"></span>' : ''
  const badge = props.badge ? `<span class="stevne-kort__badge">${escHtml(props.badge)}</span>` : ''
  const metaLines = (props.meta ?? [])
    .map(line => `<span class="stevne-kort__meta">${escHtml(line)}</span>`)
    .join('')

  const trailing =
    props.registrationSlotId !== undefined
      ? `<div class="stevne-kort__trailing stevne-kort__trailing--action"><span data-registration-slot="${props.registrationSlotId}"></span></div>`
      : `<div class="stevne-kort__trailing">${CHEVRON_SVG}</div>`

  card.innerHTML =
    `<span class="stevne-kort__stripe" aria-hidden="true"></span>` +
    `<a class="stevne-kort__link" href="${escHtml(props.href)}" aria-label="${escHtml(props.title)}, ${escHtml(props.date)}"></a>` +
    `<div class="stevne-kort__body">` +
    `<span class="stevne-kort__title-row">${liveDot}<span class="stevne-kort__title">${escHtml(props.title)}</span>${badge}</span>` +
    `<span class="stevne-kort__date">${escHtml(props.date)}</span>` +
    metaLines +
    `</div>` +
    trailing

  return card
}
