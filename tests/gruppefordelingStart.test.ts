/**
 * Once the format is confirmed the button starts the cup, but any change to
 * split or format turns it back into a confirm, and undoing the change restores Start.
 */
import {
  bindGroupAssignment,
  renderGroupAssignment,
} from "@/pages/stevne/avsluttende/gruppefordelingUi";
import { calcValidGroupSizes, validRound1Setups } from "@/utils/kamp/cupStructure";

// Smallest field whose saved group A offers a second round-1 format to switch to
const n = [8, 10, 12, 14, 16, 18, 20, 24].find(
  (m) => validRound1Setups(calcValidGroupSizes(m)[0]!.nA).length > 1,
)!;
const standings = Array.from({ length: n }, (_, i) => ({ navn: `P${i + 1}` }));

function setup() {
  const [first, second] = calcValidGroupSizes(n);
  const nB = n - first!.nA;
  const saved = {
    nA: first!.nA,
    A: validRound1Setups(first!.nA)[0] ?? null,
    B: nB >= 2 ? (validRound1Setups(nB)[0] ?? null) : null,
  };
  const container = document.createElement("div");
  container.innerHTML = renderGroupAssignment(standings, { initNa: saved.nA, initFormat: saved });
  const onConfirm = vi.fn();
  const onStart = vi.fn();
  bindGroupAssignment(container, standings, onConfirm, { saved, onStart });
  const btn = container.querySelector<HTMLButtonElement>("#confirm-group-btn")!;
  // happy-dom matches :checked on the attribute, so move it like a browser would
  const pick = (input: HTMLInputElement) => {
    container
      .querySelectorAll(`input[name="${input.name}"]`)
      .forEach((r) => r.removeAttribute("checked"));
    input.setAttribute("checked", "");
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const split = (nA: number) =>
    container.querySelector<HTMLInputElement>(`input[name="group-split"][value="${nA}"]`)!;
  const formatsA = () => [
    ...container.querySelectorAll<HTMLInputElement>('input[name="round1-format-a"]'),
  ];
  return { btn, pick, split, formatsA, onConfirm, onStart, savedNa: saved.nA, otherNa: second!.nA };
}

describe("group assignment button", () => {
  it("shows Start for the saved format and starts on click", () => {
    const { btn, onStart, onConfirm } = setup();
    expect(btn.textContent).toBe("Start");
    btn.click();
    expect(onStart).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("reverts to Bekreft when the split changes, and back to Start when undone", () => {
    const { btn, pick, split, onConfirm, savedNa, otherNa } = setup();
    pick(split(otherNa));
    expect(btn.textContent).toBe("Bekreft gruppefordeling");
    btn.click();
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ nA: otherNa }));
    pick(split(savedNa));
    expect(btn.textContent).toBe("Start");
  });

  it("reverts to Bekreft when the format changes, and back to Start when undone", () => {
    const { btn, pick, formatsA } = setup();
    pick(formatsA()[1]!);
    expect(btn.textContent).toBe("Bekreft gruppefordeling");
    pick(formatsA()[0]!);
    expect(btn.textContent).toBe("Start");
  });
});
