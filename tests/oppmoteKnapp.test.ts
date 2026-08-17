/**
 * The locked attendance button unlocking itself. Everything else about the
 * button is covered by the pure rules in oppmote.test.ts — this is only about
 * the timer, which no test could reach before it existed.
 */

const mocks = vi.hoisted(() => ({ setRegistrationConfirmedForThrower: vi.fn() }));

vi.mock("@/supabase", () => ({ supabase: {} }));
vi.mock("@/services/pameldingService", () => ({
  setRegistrationConfirmedForThrower: mocks.setRegistrationConfirmedForThrower,
}));

import { createOppmoteButton } from "@/components/OppmoteKnapp";

/** Local-time ISO date/time strings, matching how a stevne stores dato and tid. */
function stevneAt(start: Date): { dato: string; tid: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dato: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    tid: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
  };
}

function mount(startsInMs: number) {
  const { dato, tid } = stevneAt(new Date(Date.now() + startsInMs));
  const handle = createOppmoteButton({
    tournamentId: 1,
    throwerId: 2,
    dato,
    tid,
    confirmed: false,
    confirmedAt: null,
  });
  document.body.replaceChildren(handle.element);
  return handle;
}

const button = (el: HTMLElement) => el.querySelector<HTMLButtonElement>(".oppmote-btn");

const HOUR = 60 * 60 * 1000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-07T08:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

it("unlocks itself when the window opens, without anything else redrawing", () => {
  // Starts in 3 hours, so the window opens in 1.
  const { element } = mount(3 * HOUR);
  expect(button(element)?.disabled).toBe(true);

  vi.advanceTimersByTime(HOUR);

  expect(button(element)?.disabled).toBe(false);
  expect(element.querySelector(".oppmote-hint")).toBe(null);
});

it("stays locked until the window actually opens", () => {
  const { element } = mount(3 * HOUR);

  vi.advanceTimersByTime(HOUR - 1000);

  expect(button(element)?.disabled).toBe(true);
});

it("arms no timer for a stevne further out than setTimeout can hold", () => {
  mount(400 * 24 * HOUR);
  expect(vi.getTimerCount()).toBe(0);
});

it("stops the timer once the button is detached", () => {
  const { element } = mount(3 * HOUR);
  document.body.replaceChildren();

  vi.advanceTimersByTime(HOUR);

  expect(button(element)?.disabled).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});
