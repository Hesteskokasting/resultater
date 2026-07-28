import { escHtml } from '@/utils/escHtml'

export type StevneCardStatus = 'live' | 'done' | 'upcoming'

export interface StevneCardTypeBadge {
  /** Rendered heavier than `kategori`, e.g. "DNC" in "DNC Singel". */
  type: string
  kategori?: string
}

export interface StevneCardProps {
  title: string
  /** Navigation target, e.g. "#/stevne/2310/resultat". The whole card links here. */
  href: string
  /** Full display date text — used when `dateWeekday`/`dateDay` aren't set. */
  date: string
  /** ISO date (YYYY-MM-DD), used as the `<time datetime>` value. */
  dateIso?: string
  /** Full-length date text (e.g. including year) for the `<time>` title/tooltip and the card's aria-label. */
  dateFull?: string
  /** Short weekday abbreviation (e.g. "TIR") for the stacked date block. Pair with `dateDay`. */
  dateWeekday?: string
  /** Day-of-month number (e.g. "28") for the stacked date block. Pair with `dateWeekday`. */
  dateDay?: string
  status: StevneCardStatus
  /** Secondary line(s) (e.g. "Sted · Arrangør"). */
  meta?: string[]
  /** The one merged type+kategori pill, e.g. "DNC Singel". */
  typeBadge?: StevneCardTypeBadge
  /** Gold medal marker for NM stevner — the only NM indicator the card shows. */
  isNm?: boolean
  /** Marks the single nearest not-yet-started upcoming stevne: label text (e.g. "I DAG"/"NESTE") plus a light row tint. Unset means no marking. */
  nearestLabel?: string
  /**
   * When set, the trailing slot emits a `<span data-registration-slot>` placeholder
   * (hydrated later by `bindRegistrationSlots`) instead of the chevron.
   */
  registrationSlotId?: number
}

// Bootstrap Icons is not loaded in this app; use an inline SVG chevron (matches the
// existing inline-SVG convention, e.g. the theme switch in index.html).
export const CHEVRON_SVG =
  '<svg class="stevne-kort__chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" ' +
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'

const NM_LABEL = 'Noregsmeisterskap'

/**
 * Single reusable stevne card. The whole card is one tap target (a stretched link) that
 * navigates to `href`. A registration button, when present, is a sibling that sits above the
 * stretched link, so tapping it never triggers card navigation.
 */
export function createStevneCard(props: StevneCardProps): HTMLElement {
  const card = document.createElement('div')
  card.className = `stevne-kort stevne-kort--${props.status}${props.nearestLabel ? ' stevne-kort--nearest' : ''}`

  const liveDot = props.status === 'live' ? '<span class="live-prikk" aria-hidden="true"></span>' : ''
  const nmMedal = props.isNm
    ? `<span class="stevne-kort__nm" role="img" aria-label="${NM_LABEL}" title="${NM_LABEL}">🥇</span>`
    : ''
  const nearestPill = props.nearestLabel
    ? `<span class="stevne-kort__nearest-merke">${escHtml(props.nearestLabel)}</span>`
    : ''
  const typeBadgeHtml = props.typeBadge
    ? `<span class="stevne-kort__type-badge"><b>${escHtml(props.typeBadge.type)}</b>${props.typeBadge.kategori ? ' ' + escHtml(props.typeBadge.kategori) : ''}</span>`
    : ''
  const metaLines = (props.meta ?? [])
    .map(line => `<span class="stevne-kort__meta">${escHtml(line)}</span>`)
    .join('')

  const trailing =
    props.registrationSlotId !== undefined
      ? `<div class="stevne-kort__trailing stevne-kort__trailing--action"><span data-registration-slot="${props.registrationSlotId}"></span></div>`
      : `<div class="stevne-kort__trailing">${CHEVRON_SVG}</div>`

  const dateA11yText  = props.dateFull ?? props.date
  const dateIsoAttr   = props.dateIso ? ` datetime="${escHtml(props.dateIso)}"` : ''
  const dateTitleAttr = props.dateFull ? ` title="${escHtml(props.dateFull)}"` : ''

  // Two mutually exclusive date renderings: a left-side stacked weekday/day block
  // (terminliste's mobile card) or the plain inline line (every other caller).
  const hasDateBlock = props.dateWeekday !== undefined && props.dateDay !== undefined
  const dateBlockHtml = hasDateBlock
    ? `<time class="stevne-kort__datecol"${dateIsoAttr}${dateTitleAttr}>` +
      `<span class="stevne-kort__weekday">${escHtml(props.dateWeekday!)}</span>` +
      `<span class="stevne-kort__day">${escHtml(props.dateDay!)}</span>` +
      `</time>`
    : ''
  const inlineDateTag  = props.dateIso ? 'time' : 'span'
  const inlineDateHtml = hasDateBlock
    ? ''
    : `<${inlineDateTag} class="stevne-kort__date"${dateIsoAttr}${dateTitleAttr}>${escHtml(props.date)}</${inlineDateTag}>`

  card.innerHTML =
    `<span class="stevne-kort__stripe" aria-hidden="true"></span>` +
    `<a class="stevne-kort__link" href="${escHtml(props.href)}" aria-label="${escHtml(props.title)}, ${escHtml(dateA11yText)}"></a>` +
    dateBlockHtml +
    `<div class="stevne-kort__body">` +
    nearestPill +
    `<span class="stevne-kort__title-row">${liveDot}${nmMedal}<span class="stevne-kort__title">${escHtml(props.title)}</span></span>` +
    inlineDateHtml +
    typeBadgeHtml +
    metaLines +
    `</div>` +
    trailing

  return card
}
