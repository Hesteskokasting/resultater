/**
 * Organizers (admin, klubbadmin) cannot be linked to a thrower, so Min side keeps
 * only their account tabs and sends them to the dashboard from everything else.
 */

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), replace: vi.fn() }));

vi.mock("@/services/authService", () => ({ getUser: mocks.getUser }));
vi.mock("@/components/LogoutButton", () => ({
  createLogoutButton: () => document.createElement("button"),
}));
vi.mock("@/pages/minside/minside-kampar", () => ({ render: vi.fn() }));
vi.mock("@/pages/minside/minside-pameldingar", () => ({ render: vi.fn() }));
vi.mock("@/pages/minside/minside-innstillingar", () => ({ render: vi.fn() }));
vi.mock("@/pages/minside/minside-konto", () => ({ render: vi.fn() }));

import { render } from "@/pages/minside";

function signInAs(role: string): void {
  mocks.getUser.mockResolvedValue({
    user: { id: "u1", email: "x@example.com" },
    profil: { role, kasterid: null, kobling_status: "ingen", kobling_kasterid: null },
    clubs: [],
  });
}

const tabs = (el: HTMLElement): (string | null)[] =>
  [...el.querySelectorAll(".mypage-nav a")].map((a) => a.getAttribute("href"));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(location, "replace").mockImplementation(mocks.replace);
});

describe("min side for organizers", () => {
  it.each(["admin", "klubbadmin"])(
    "sends a %s from the participant tabs to #/admin",
    async (role) => {
      signInAs(role);
      for (const tab of ["kampar", "pameldingar"]) {
        await render(document.createElement("div"), { tab });
      }
      expect(mocks.replace).toHaveBeenCalledTimes(2);
      expect(mocks.replace).toHaveBeenCalledWith("#/admin");
    },
  );

  it("keeps innstillingar and konto open to an organizer", async () => {
    signInAs("klubbadmin");
    const el = document.createElement("div");
    await render(el, { tab: "konto" });

    expect(mocks.replace).not.toHaveBeenCalled();
    expect(tabs(el)).toEqual(["#/minside/innstillingar", "#/minside/konto"]);
  });

  it("leaves a brukar on the full min side", async () => {
    signInAs("bruker");
    const el = document.createElement("div");
    await render(el, { tab: "kampar" });

    expect(mocks.replace).not.toHaveBeenCalled();
    expect(tabs(el)).toHaveLength(4);
  });
});
