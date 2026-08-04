import type { StevneCardActionLink } from "@/components/StevneCard";

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
