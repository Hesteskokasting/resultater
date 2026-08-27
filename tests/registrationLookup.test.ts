import { buildRegistrationLookup } from "@/utils/stevne/registrationLookup";
import type { RegistrationStatusRow } from "@/services/pameldingService";

function row(overrides: Partial<RegistrationStatusRow>): RegistrationStatusRow {
  return { id: 1, kasterid: 1, er_bekreftet: false, lag_id: null, ...overrides };
}

describe("buildRegistrationLookup", () => {
  it("skips rows with no kasterid", () => {
    const { registeredMap, pairedIds } = buildRegistrationLookup([row({ kasterid: undefined })]);
    expect(registeredMap.size).toBe(0);
    expect(pairedIds.size).toBe(0);
  });

  it("defaults er_bekreftet to false when unset", () => {
    const { registeredMap } = buildRegistrationLookup([
      row({ kasterid: 5, er_bekreftet: undefined }),
    ]);
    expect(registeredMap.get(5)).toBe(false);
  });

  it("records the confirmed status as-is when present", () => {
    const { registeredMap } = buildRegistrationLookup([row({ kasterid: 5, er_bekreftet: true })]);
    expect(registeredMap.get(5)).toBe(true);
  });

  it("adds kasterid to pairedIds when lag_id is set", () => {
    const { pairedIds } = buildRegistrationLookup([row({ kasterid: 5, lag_id: 42 })]);
    expect(pairedIds.has(5)).toBe(true);
  });

  it("leaves pairedIds empty when lag_id is null", () => {
    const { pairedIds } = buildRegistrationLookup([row({ kasterid: 5, lag_id: null })]);
    expect(pairedIds.has(5)).toBe(false);
  });

  it("returns empty results for an empty input", () => {
    const { registeredMap, pairedIds } = buildRegistrationLookup([]);
    expect(registeredMap.size).toBe(0);
    expect(pairedIds.size).toBe(0);
  });
});
