/**
 * A card with no registration button and no explanation reads as "registration
 * doesn't exist here", so every state that cannot register has to say why.
 */
import { registrationCtaLink } from "@/components/StevneCard";
import type { AuthUser, LinkStatus, Role } from "@/types";
import type { User } from "@supabase/supabase-js";

function authWith(status: LinkStatus, kasterid: number | null, role: Role = "bruker"): AuthUser {
  return {
    user: { id: "u1" } as User,
    profil: { role, kasterid, kobling_status: status, kobling_kasterid: null },
    clubs: [],
  };
}

describe("registrationCtaLink", () => {
  it("sends a signed-out visitor to logg inn and back to the stevne afterwards", () => {
    const link = registrationCtaLink(77, null)!;
    expect(link.label).toBe("Logg inn for å melde på");
    expect(link.href).toBe("#/logginn?redirect=%2Fstevne%2F77%2Finfo");
  });

  it("yields to the real registration button once the thrower link is approved", () => {
    expect(registrationCtaLink(77, authWith("godkjent", 5))).toBeUndefined();
  });

  it("points an unlinked account at min side, where the link request lives", () => {
    const link = registrationCtaLink(77, authWith("ingen", null))!;
    expect(link.label).toBe("Koble profil for å melde på");
    expect(link.href).toBe("#/minside/kampar");
  });

  it("reports the wait instead of asking again when a request is already pending", () => {
    expect(registrationCtaLink(77, authWith("venter", null))!.label).toBe("Ventar på godkjenning");
  });

  it("treats a rejected request as unlinked, so a new one can be sent", () => {
    expect(registrationCtaLink(77, authWith("avvist", null))!.label).toBe(
      "Koble profil for å melde på",
    );
  });

  it("treats an approved status carrying no kasterid as unlinked", () => {
    expect(registrationCtaLink(77, authWith("godkjent", null))!.label).toBe(
      "Koble profil for å melde på",
    );
  });

  it("stays quiet for an admin, who runs stevner rather than entering them", () => {
    expect(registrationCtaLink(77, authWith("ingen", null, "admin"))).toBeUndefined();
    expect(registrationCtaLink(77, authWith("venter", null, "admin"))).toBeUndefined();
  });

  it("still nudges an unlinked klubbadmin, who is usually a thrower too", () => {
    expect(registrationCtaLink(77, authWith("ingen", null, "klubbadmin"))!.label).toBe(
      "Koble profil for å melde på",
    );
  });

  it("gives every state a tooltip that adds to the label rather than repeating it", () => {
    for (const auth of [null, authWith("ingen", null), authWith("venter", null)]) {
      const link = registrationCtaLink(77, auth)!;
      expect(link.title).toBeTruthy();
      expect(link.title).not.toBe(link.label);
      // The tooltip is the only place that says what following the link does.
      expect(link.title).toContain("Klikk for");
    }
  });
});
