// authService subscribes to auth changes at import time, so the stub needs that
// much of the client before the module will load at all.
vi.mock("@/supabase", () => ({ supabase: { auth: { onAuthStateChange: () => {} } } }));

import { signInErrorMessage } from "@/services/authService";

it("translates the opaque credentials error", () => {
  expect(signInErrorMessage({ message: "Invalid login credentials" })).toBe(
    "Feil e-post eller passord.",
  );
});

it("passes anything else through untouched", () => {
  expect(signInErrorMessage({ message: "Email not confirmed" })).toBe("Email not confirmed");
});
