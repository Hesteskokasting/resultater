import { escHtml } from "@/utils/escHtml";
import { liveDotHtml } from "@/components/LivePill";
import { linkedThrowerId } from "@/utils/kaster";
import {
  formatDateLong,
  formatDateWeekday,
  formatWeekdayShort,
  formatDayOfMonth,
} from "@/utils/shared";
import type { AuthUser } from "@/types";

export type StevneCardStatus = "live" | "done" | "upcoming";

export interface StevneCardTypeBadge {
  /** Rendered heavier than `kategori`, e.g. "DNC" in "DNC Singel". */
  type: string;
  kategori?: string;
}

export interface StevneCardActionLink {
  href: string;
  label: string;
  /** "secondary" reports a state the thrower is already in; "primary" (default) invites the action. */
  variant?: "primary" | "secondary";
  /** Explains a label the trailing slot is too narrow to spell out. */
  title?: string;
}

/** Shared by the card's trailing slot and terminliste's desktop table cell. */
export function actionLinkHtml(link: StevneCardActionLink): string {
  const variantClass = link.variant === "secondary" ? "btn-outline-secondary" : "btn-primary";
  const titleAttr = link.title ? ` title="${escHtml(link.title)}"` : "";
  return `<a class="btn btn-sm ${variantClass}" href="${escHtml(link.href)}"${titleAttr}>${escHtml(link.label)}</a>`;
}

/**
 * A pamelding always names a local stevne, never the umbrella, so the umbrella's
 * button can never register anyone — it can only report status and send the thrower
 * to the page that lists the locals.
 */
export function sncUmbrellaActionLink(
  tournamentId: number,
  isRegistered: boolean,
): StevneCardActionLink {
  const href = `#/stevne/${tournamentId}/info`;
  return isRegistered
    ? { href, label: "Påmeldt", variant: "secondary" }
    : { href, label: "Meld på" };
}

/**
 * Stands in for the registration button when the account cannot register yet, so
 * the card says what is missing instead of showing nothing at all. Returns
 * undefined once the thrower link is approved — the real button belongs there.
 */
export function registrationCtaLink(
  tournamentId: number,
  auth: AuthUser | null,
): StevneCardActionLink | undefined {
  if (linkedThrowerId(auth) !== null) return undefined;
  if (!auth) {
    return {
      href: `#/logginn?redirect=${encodeURIComponent(`/stevne/${tournamentId}/info`)}`,
      label: "Logg inn for å melde på",
      title: "Logg inn for å melde på",
      variant: "secondary",
    };
  }
  if (auth.profil?.kobling_status === "venter") {
    return {
      href: "#/minside/kampar",
      label: "Ventar på godkjenning",
      title: "Koblingforespørselen din ventar på godkjenning",
      variant: "secondary",
    };
  }
  return {
    href: "#/minside/kampar",
    label: "Koble profil for å melde på",
    title: "Koble profil for å melde på",
    variant: "secondary",
  };
}

export interface StevneCardProps {
  title: string;
  /** Navigation target, e.g. "#/stevne/2310/resultat". The whole card links here. */
  href: string;
  /** Full display date text — used when `dateWeekday`/`dateDay` aren't set. */
  date: string;
  /** ISO date (YYYY-MM-DD), used as the `<time datetime>` value. */
  dateIso?: string;
  /** Full-length date text (e.g. including year) for the `<time>` title/tooltip and the card's aria-label. */
  dateFull?: string;
  /** Short weekday abbreviation (e.g. "TIR") for the stacked date block. Pair with `dateDay`. */
  dateWeekday?: string;
  /** Day-of-month number (e.g. "28") for the stacked date block. Pair with `dateWeekday`. */
  dateDay?: string;
  status: StevneCardStatus;
  /** Secondary line(s) (e.g. "Sted · Arrangør"). */
  meta?: string[];
  /** The one merged type+kategori pill, e.g. "DNC Singel". */
  typeBadge?: StevneCardTypeBadge;
  /** Gold medal marker for NM stevner — the only NM indicator the card shows. */
  isNm?: boolean;
  /** Marks the single nearest not-yet-started upcoming stevne with a small label (e.g. "I DAG"/"NESTE"). Unset means no marking. */
  nearestLabel?: string;
  /**
   * When set, the trailing slot emits a `<span data-registration-slot>` placeholder
   * (hydrated later by `bindRegistrationSlots`) instead of the chevron.
   */
  registrationSlotId?: number;
  /**
   * A link rendered as a button in the trailing slot, for actions that navigate
   * rather than write. Ignored when `registrationSlotId` is set.
   */
  actionLink?: StevneCardActionLink;
  /**
   * Emits `<span data-action-slot>` in the trailing slot for the caller to swap
   * for its own control. Ignored when `registrationSlotId` or `actionLink` is set.
   */
  actionSlot?: boolean;
}

// Bootstrap Icons is not loaded in this app; use an inline SVG chevron (matches the
// existing inline-SVG convention, e.g. the theme switch in index.html).
const CHEVRON_SVG =
  '<svg class="stevne-kort__chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" ' +
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

const NM_LABEL = "Noregsmeisterskap";

/**
 * Single reusable stevne card. The whole card is one tap target (a stretched link) that
 * navigates to `href`. A registration button, when present, is a sibling that sits above the
 * stretched link, so tapping it never triggers card navigation.
 */
export function createStevneCard(props: StevneCardProps): HTMLElement {
  const card = document.createElement("div");
  card.className = `stevne-kort stevne-kort--${props.status}`;

  const liveDot = props.status === "live" ? liveDotHtml() : "";
  const nmMedal = props.isNm
    ? `<span class="stevne-kort__nm" role="img" aria-label="${NM_LABEL}" title="${NM_LABEL}">🥇</span>`
    : "";
  const nearestPill = props.nearestLabel
    ? `<span class="stevne-kort__nearest-merke">${escHtml(props.nearestLabel)}</span>`
    : "";
  const typeBadgeHtml = props.typeBadge
    ? `<span class="stevne-kort__type-badge"><b>${escHtml(props.typeBadge.type)}</b>${props.typeBadge.kategori ? " " + escHtml(props.typeBadge.kategori) : ""}</span>`
    : "";
  const metaLines = (props.meta ?? [])
    .map((line) => `<span class="stevne-kort__meta">${escHtml(line)}</span>`)
    .join("");

  const trailing =
    props.registrationSlotId !== undefined
      ? `<div class="stevne-kort__trailing stevne-kort__trailing--action"><span data-registration-slot="${props.registrationSlotId}"></span></div>`
      : props.actionLink
        ? `<div class="stevne-kort__trailing stevne-kort__trailing--action">${actionLinkHtml(props.actionLink)}</div>`
        : props.actionSlot
          ? `<div class="stevne-kort__trailing stevne-kort__trailing--action"><span data-action-slot></span></div>`
          : `<div class="stevne-kort__trailing">${CHEVRON_SVG}</div>`;

  const dateA11yText = props.dateFull ?? props.date;
  const dateIsoAttr = props.dateIso ? ` datetime="${escHtml(props.dateIso)}"` : "";
  const dateTitleAttr = props.dateFull ? ` title="${escHtml(props.dateFull)}"` : "";

  // Two mutually exclusive date renderings: a left-side stacked weekday/day block
  // (terminliste's mobile card) or the plain inline line (every other caller).
  const hasDateBlock = props.dateWeekday !== undefined && props.dateDay !== undefined;
  const dateBlockHtml = hasDateBlock
    ? `<time class="stevne-kort__datecol"${dateIsoAttr}${dateTitleAttr}>` +
      `<span class="stevne-kort__weekday">${escHtml(props.dateWeekday!)}</span>` +
      `<span class="stevne-kort__day">${escHtml(props.dateDay!)}</span>` +
      `</time>`
    : "";
  const inlineDateTag = props.dateIso ? "time" : "span";
  const inlineDateHtml = hasDateBlock
    ? ""
    : `<${inlineDateTag} class="stevne-kort__date"${dateIsoAttr}${dateTitleAttr}>${escHtml(props.date)}</${inlineDateTag}>`;

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
    trailing;

  return card;
}

/** The stevne fields the schedule card reads — a structural subset of ScheduleTournamentRow. */
export interface TournamentCardRow {
  navn?: string | null;
  dato?: string | null;
  sted?: string | null;
  erfullfort?: boolean | null;
  stevne_fase?: string | null;
  ernm?: boolean | null;
  klubb?: { navn?: string | null } | null;
  stevnetype?: { navn?: string | null } | null;
  kategori?: { navn?: string | null } | null;
}

export interface TournamentCardOptions {
  href: string;
  /** Replaces `sted` in the meta line — terminliste puts its SNC local count here. */
  placeOverride?: string | null;
  nearestLabel?: string;
  registrationSlotId?: number;
  actionLink?: StevneCardActionLink;
}

/**
 * The stevne card as terminliste's mobile list renders it: stacked weekday/day
 * block, live/upcoming/done status, NM medal, merged type+kategori pill and a
 * "Sted · Arrangør" meta line. Every view that lists stevner builds its cards
 * here, so they stay identical.
 */
export function createTournamentCard(
  s: TournamentCardRow,
  opts: TournamentCardOptions,
): HTMLElement {
  const isDone = s.erfullfort === true;
  const isLive = (s.stevne_fase === "innledende" || s.stevne_fase === "avsluttende") && !isDone;
  const isUpcoming = !isDone && !!s.dato && new Date(s.dato + "T12:00:00") > new Date();

  const place = opts.placeOverride ?? s.sted;
  const placeAndOrganizer = [place, s.klubb?.navn]
    .filter((v): v is string => Boolean(v))
    .join(" · ");

  return createStevneCard({
    title: s.navn ?? "",
    href: opts.href,
    date: formatDateWeekday(s.dato),
    dateIso: s.dato ?? undefined,
    dateFull: formatDateLong(s.dato),
    dateWeekday: formatWeekdayShort(s.dato),
    dateDay: formatDayOfMonth(s.dato),
    status: isLive ? "live" : isUpcoming ? "upcoming" : "done",
    meta: placeAndOrganizer ? [placeAndOrganizer] : [],
    typeBadge: s.stevnetype?.navn
      ? { type: s.stevnetype.navn, kategori: s.kategori?.navn ?? undefined }
      : undefined,
    isNm: s.ernm ?? false,
    nearestLabel: opts.nearestLabel,
    registrationSlotId: opts.registrationSlotId,
    actionLink: opts.actionLink,
  });
}
