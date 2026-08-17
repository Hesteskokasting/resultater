/**
 * A card with no registration button and no explanation reads as "registration
 * doesn't exist here", so every state that cannot register has to say why.
 */
import { registrationCtaLink } from "@/components/StevneCard";
import type { AuthUser, LinkStatus } from "@/types";
import type { User } from "@supabase/supabase-js";

function authWith(status: LinkStatus, kasterid: number | null): AuthUser {
  return {
    user: { id: "u1" } as User,
    profil: { role: "bruker", kasterid, kobling_status: status, kobling_kasterid: null },
    clubs: [],
  };
}

describe("registrationCtaLink", () => {
  it("sends a signed-out visitor to logg inn and back to the stevne afterwards", () => {
    const link = registrationCtaLink(77, null)!;
    expect(link.label).toBe("Logg inn");
    expect(link.href).toBe("#/logginn?redirect=%2Fstevne%2F77%2Finfo");
  });

  it("yields to the real registration button once the thrower link is approved", () => {
    expect(registrationCtaLink(77, authWith("godkjent", 5))).toBeUndefined();
  });

  it("points an unlinked account at min side, where the link request lives", () => {
    const link = registrationCtaLink(77, authWith("ingen", null))!;
    expect(link.label).toBe("Koble profil");
    expect(link.href).toBe("#/minside/kampar");
  });

  it("reports the wait instead of asking again when a request is already pending", () => {
    expect(registrationCtaLink(77, authWith("venter", null))!.label).toBe("Ventar");
  });

  it("treats a rejected request as unlinked, so a new one can be sent", () => {
    expect(registrationCtaLink(77, authWith("avvist", null))!.label).toBe("Koble profil");
  });

  it("treats an approved status carrying no kasterid as unlinked", () => {
    expect(registrationCtaLink(77, authWith("godkjent", null))!.label).toBe("Koble profil");
  });

  it("carries a title everywhere, since the trailing slot only fits a word or two", () => {
    for (const auth of [null, authWith("ingen", null), authWith("venter", null)]) {
      expect(registrationCtaLink(77, auth)!.title).toBeTruthy();
    }
  });
});
