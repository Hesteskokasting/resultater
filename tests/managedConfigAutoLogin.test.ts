/**
 * A kiosk tablet is enrolled in Intune, which pushes nothing but a device key. What
 * these tests hold in place is that the key alone decides whether the app signs
 * itself in: no key means the app behaves like any phone, and a device that already
 * has a session must not burn a fresh one-time token on every cold start.
 */

const mocks = vi.hoisted(() => ({
  getPlatform: vi.fn(() => "android"),
  getRestrictions: vi.fn(),
  getSession: vi.fn(),
  invoke: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: mocks.getPlatform },
  registerPlugin: () => ({ get: mocks.getRestrictions }),
}));
vi.mock("@/supabase", () => ({
  supabase: {
    auth: { getSession: mocks.getSession, verifyOtp: mocks.verifyOtp },
    functions: { invoke: mocks.invoke },
  },
}));
vi.mock("@/utils/logError", () => ({ logError: vi.fn() }));

import { autoLoginFromManagedConfig } from "@/services/managedConfigService";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getPlatform.mockReturnValue("android");
  mocks.getRestrictions.mockResolvedValue({ deviceKey: "bane-a-9921-abcdef" });
  mocks.getSession.mockResolvedValue({ data: { session: null } });
  mocks.invoke.mockResolvedValue({ data: { tokenHash: "token-hash" }, error: null });
  mocks.verifyOtp.mockResolvedValue({ error: null });
});

it("exchanges the pushed device key for a session", async () => {
  await autoLoginFromManagedConfig();

  expect(mocks.invoke).toHaveBeenCalledWith("device-login", {
    body: { deviceKey: "bane-a-9921-abcdef" },
  });
  expect(mocks.verifyOtp).toHaveBeenCalledWith({
    type: "magiclink",
    token_hash: "token-hash",
  });
});

it("does nothing on a device with no key pushed", async () => {
  mocks.getRestrictions.mockResolvedValue({});

  await autoLoginFromManagedConfig();

  expect(mocks.invoke).not.toHaveBeenCalled();
});

it("leaves an existing session alone", async () => {
  mocks.getSession.mockResolvedValue({ data: { session: { access_token: "x" } } });

  await autoLoginFromManagedConfig();

  expect(mocks.invoke).not.toHaveBeenCalled();
});

it("stays signed out when the device is unknown or deactivated", async () => {
  mocks.invoke.mockResolvedValue({ data: null, error: { message: "unknown device" } });

  await autoLoginFromManagedConfig();

  expect(mocks.verifyOtp).not.toHaveBeenCalled();
});

it("never reads restrictions off Android", async () => {
  mocks.getPlatform.mockReturnValue("ios");

  await autoLoginFromManagedConfig();

  expect(mocks.getRestrictions).not.toHaveBeenCalled();
  expect(mocks.invoke).not.toHaveBeenCalled();
});
