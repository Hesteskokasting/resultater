/**
 * The three score pads share one shell (components/numberpadUi.ts), so these
 * cover the parts that shell is responsible for: a close button on every pad,
 * the stage/step navigation, and each flow reaching its own save.
 */

import { beforeEach, describe, expect, it } from "vite-plus/test";
import { showNumberpad } from "@/components/ScoreNumberpad";
import { showTotalNumberpad } from "@/components/TotalNumberpad";
import { showOmgangNumberpad } from "@/components/OmgangNumberpad";

/** Live matchMedia fake: `narrow` flips and every open pad hears about it. */
let narrow = false;
let mqListeners: Array<() => void> = [];

function setViewport(isNarrow: boolean): void {
  narrow = isNarrow;
  mqListeners = [];
  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() {
      return narrow;
    },
    addEventListener: (_: string, cb: () => void) => void mqListeners.push(cb),
    removeEventListener: (_: string, cb: () => void) => {
      mqListeners = mqListeners.filter((listener) => listener !== cb);
    },
  })) as never;
}

function resizeTo(isNarrow: boolean): void {
  narrow = isNarrow;
  for (const listener of mqListeners) listener();
}

function click(selector: string): void {
  document.querySelector<HTMLButtonElement>(selector)!.click();
}

function label(): string {
  return document.querySelector(".pad-display-label")!.textContent ?? "";
}

function names(): string[] {
  return [...document.querySelectorAll(".pad-name")].map((el) => el.textContent ?? "");
}

function registerLabel(): string {
  return document.querySelector(".pad-footer .pad-register")!.textContent ?? "";
}

function gridKeys(colIndex = 0): HTMLButtonElement[] {
  const col = document.querySelectorAll<HTMLElement>(".pad-col")[colIndex]!;
  return [...col.querySelectorAll<HTMLButtonElement>(".pad-grid .pad-key")];
}

beforeEach(() => {
  document.body.innerHTML = "";
  setViewport(false);
});

describe("showNumberpad", () => {
  it("shows one column per side on a wide screen and saves every score", async () => {
    const saved: number[][] = [];
    showNumberpad(
      [
        { name: "Lag A", score: 0 },
        { name: "Lag B", score: 7 },
      ],
      async (scores) => void saved.push(scores),
    );

    expect(document.querySelectorAll(".pad-col").length).toBe(2);
    expect(document.querySelectorAll(".pad-close").length).toBe(1);
    expect(names()).toEqual(["Lag A", "Lag B"]);
    expect(registerLabel()).toBe("Lagre");
    // The stage action lives in the footer, never as a key.
    expect(document.querySelector(".pad-key-action")).toBeNull();

    const keys = gridKeys(0);
    keys[0]!.click();
    keys[1]!.click();
    click(".pad-register");
    await Promise.resolve();

    expect(saved[0]).toEqual([12, 7]);
  });

  it("steps through the sides on a phone and can go back", () => {
    setViewport(true);
    showNumberpad(
      [
        { name: "Lag A", score: 3 },
        { name: "Lag B", score: 0 },
      ],
      async () => {},
    );

    expect(document.querySelectorAll(".pad-col").length).toBe(1);
    expect(document.querySelectorAll(".pad-progress-seg").length).toBe(2);
    expect(names()).toEqual(["Lag A"]);
    expect(label()).toBe("Poengsum");
    expect(document.querySelector(".pad-back")!.classList).toContain("pad-back-skjult");

    // The footer advances while a side is still unentered, then turns into Lagre.
    expect(registerLabel()).toContain("Lag B");
    click(".pad-register");
    expect(names()).toEqual(["Lag B"]);
    expect(registerLabel()).toBe("Lagre");

    click(".pad-back");
    expect(names()).toEqual(["Lag A"]);

    click(".pad-close");
    expect(document.querySelector(".pad-overlay")).toBeNull();
  });

  it("follows the viewport across the layout threshold while open", () => {
    setViewport(true);
    showNumberpad(
      [
        { name: "Lag A", score: 1 },
        { name: "Lag B", score: 2 },
      ],
      async () => {},
    );
    expect(document.querySelectorAll(".pad-col").length).toBe(1);

    resizeTo(false);
    expect(document.querySelectorAll(".pad-col").length).toBe(2);
    expect(document.querySelector(".pad-register")).not.toBeNull();

    resizeTo(true);
    expect(document.querySelectorAll(".pad-col").length).toBe(1);

    // Closing drops the listener, so a later resize can't touch a dead pad.
    click(".pad-close");
    resizeTo(false);
    expect(document.querySelector(".pad-overlay")).toBeNull();
  });
});

describe("showTotalNumberpad", () => {
  it("walks poeng → ringere and back", () => {
    showTotalNumberpad({
      contextLabel: "Bane 1 · Totalsum",
      playerName: "Ola",
      antallOmganger: 10,
      onSave: async () => true,
    });

    expect(document.querySelector(".pad-context")!.textContent).toBe("Bane 1 · Totalsum");
    expect(label()).toContain("Poengsum");

    click(".pad-key-action");
    expect(label()).toContain("Ringere");
    expect(document.querySelectorAll(".pad-progress-seg.active").length).toBe(2);

    click(".pad-back");
    expect(label()).toContain("Poengsum");
  });
});

describe("showOmgangNumberpad", () => {
  it("gates the digit stage until a poengsum is typed, then shows the ring keys", () => {
    showOmgangNumberpad([
      {
        header: {
          baneLabel: "Bane 2",
          rundeLabel: "Runde 1 av 3",
          cellLabels: ["1", "2"],
          cellPoeng: [null, null],
          cellIndex: 0,
          totalPoeng: 0,
          playerKey: "p1",
          rundeKey: "p1-r1",
        },
        playerName: "Kari",
        onSave: async () => true,
      },
    ]);

    expect(document.querySelector(".pad-name")!.textContent).toBe("Kari");
    expect(document.querySelector(".pad-total")!.textContent).toBe("0");
    // Two omgang cells plus the SUM cell.
    expect(document.querySelectorAll(".pad-strip-cell").length).toBe(3);
    expect(document.querySelector<HTMLButtonElement>(".pad-key-action")!.disabled).toBe(true);

    gridKeys()[7]!.click();
    expect(document.querySelector(".pad-display-value")!.textContent).toBe("8");

    click(".pad-key-action");
    expect(document.querySelectorAll(".pad-ring-btn").length).toBe(5);
    expect(document.querySelector(".pad-grid")).toBeNull();
    // Registering stays blocked until a ring count is picked.
    expect(document.querySelector<HTMLButtonElement>(".pad-register")!.disabled).toBe(true);

    const ring = [...document.querySelectorAll<HTMLButtonElement>(".pad-ring-btn")].find(
      (btn) => !btn.disabled,
    )!;
    ring.click();
    expect(document.querySelector<HTMLButtonElement>(".pad-register")!.disabled).toBe(false);
  });
});
