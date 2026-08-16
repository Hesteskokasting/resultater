/**
 * Every caller pastes the result into a sentence the user reads
 * ("Kunne ikkje melde på: …"), so the fallback matters as much as the happy path:
 * nothing here may leak "null", "undefined" or "[object Object]" into the UI.
 */

import { errorMessage } from "@/utils/errorMessage";

describe("errorMessage", () => {
  it("reads .message off both an Error and a PostgrestError-shaped object", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
    expect(errorMessage({ message: "denied", code: "42501" })).toBe("denied");
  });

  it("passes a thrown string through", () => {
    expect(errorMessage("boom")).toBe("boom");
  });

  it("falls back to a readable phrase instead of stringifying the value", () => {
    for (const value of [null, undefined, {}, { message: null }, 42, [], "   "]) {
      expect(errorMessage(value)).toBe("Ukjend feil");
    }
  });

  it("treats a blank message as no message", () => {
    expect(errorMessage(new Error(""))).toBe("Ukjend feil");
    expect(errorMessage({ message: "  " })).toBe("Ukjend feil");
  });
});
