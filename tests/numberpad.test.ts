/**
 * The three score pads share one shell (components/numberpad/numberpadUi.ts), so these
 * cover the parts that shell is responsible for: a close button on every pad,
 * the stage/step navigation, and each flow reaching its own save.
 */

import { beforeEach, describe, expect, it } from "vite-plus/test";
import { showNumberpad } from "@/components/numberpad/ScoreNumberpad";
import { showTotalNumberpad } from "@/components/numberpad/TotalNumberpad";
import { showXkastKongelagNumberpad } from "@/components/numberpad/XkastKongelagNumberpad";

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
      async (scores) => {
        saved.push(scores);
        return true;
      },
      { baneLabel: "Bane 3", rundeLabel: "Runde 2" },
    );

    expect(document.querySelector(".pad-bane")!.textContent).toBe("Bane 3");
    expect(document.querySelector(".pad-runde")!.textContent).toBe("Runde 2");
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

  it("lights a score key on press and lets go on release", () => {
    showNumberpad([{ name: "Lag A", score: 0 }], async () => true);

    const key = gridKeys()[0]!;
    key.dispatchEvent(new Event("pointerdown"));
    expect(key.classList).toContain("is-pressed");
    key.dispatchEvent(new Event("pointerup"));
    expect(key.classList).not.toContain("is-pressed");

    // The ring keys keep their own selected state instead.
    expect(document.querySelector(".pad-ring-btn")).toBeNull();
  });

  it("wipes the whole score on one press of the clear key", () => {
    showNumberpad([{ name: "Lag A", score: 0 }], async () => true);

    const keys = gridKeys();
    keys[0]!.click();
    keys[2]!.click();
    expect(document.querySelector(".pad-display-value")!.textContent).toBe("13");

    // The clear key sits where a backspace would, but takes the lot.
    keys[9]!.click();
    expect(document.querySelector(".pad-display-value")!.textContent).toBe("0");
    expect(document.querySelector(".pad-display-value")!.classList).toContain("tom");
  });

  it("blocks the footer action until the sides it covers have a score", () => {
    setViewport(true);
    showNumberpad(
      [
        { name: "Lag A", score: 0 },
        { name: "Lag B", score: 0 },
      ],
      async () => true,
    );

    const register = (): HTMLButtonElement =>
      document.querySelector<HTMLButtonElement>(".pad-register")!;

    expect(register().disabled).toBe(true);
    // A zero counts, but it has to be pressed.
    gridKeys()[10]!.click();
    expect(register().disabled).toBe(false);

    click(".pad-register");
    expect(registerLabel()).toBe("Lagre");
    expect(register().disabled).toBe(true);

    gridKeys()[3]!.click();
    expect(register().disabled).toBe(false);

    // Widening puts both sides on screen; clearing one blocks Lagre again.
    resizeTo(false);
    expect(register().disabled).toBe(false);
    gridKeys(0)[9]!.click();
    expect(register().disabled).toBe(true);
  });

  it("stays open with the typed scores when the save fails", async () => {
    showNumberpad([{ name: "Lag A", score: 0 }], async () => false);

    gridKeys()[4]!.click();
    click(".pad-register");
    await Promise.resolve();
    await Promise.resolve();

    expect(document.querySelector(".pad-overlay")).not.toBeNull();
    expect(document.querySelector(".pad-display-value")!.textContent).toBe("5");
    expect(document.querySelector<HTMLButtonElement>(".pad-register")!.disabled).toBe(false);
  });

  it("steps through the sides on a phone and can go back", () => {
    setViewport(true);
    showNumberpad(
      [
        { name: "Lag A", score: 3 },
        { name: "Lag B", score: 0 },
      ],
      async () => true,
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
      async () => true,
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

describe("showXkastKongelagNumberpad", () => {
  it("gates the digit stage until a poengsum is typed, then shows the ring keys", () => {
    showXkastKongelagNumberpad([
      {
        header: {
          baneLabel: "Bane 2",
          rundeLabel: "Runde 1 av 3",
          cellLabels: ["1", "2"],
          cellPoeng: [null, null],
          cellIndex: 0,
          totalPoeng: 0,
          totalRinger: 0,
          playerKey: "p1",
          rundeKey: "p1-r1",
        },
        playerName: "Kari",
        onSave: async () => true,
      },
    ]);

    expect(document.querySelector(".pad-name")!.textContent).toBe("Kari");
    expect(document.querySelector(".pad-total")!.textContent).toBe("0");
    // Two omgang cells, drawn in the same row the summary uses.
    expect(document.querySelectorAll(".pad-summary-kast").length).toBe(2);
    expect(document.querySelector<HTMLButtonElement>(".pad-key-action")!.disabled).toBe(true);
    // The arrow is captioned, so the key says what it does.
    expect(document.querySelector(".pad-key-action .pad-key-caption")!.textContent).toBe("Bekreft");

    gridKeys()[7]!.click();
    expect(document.querySelector(".pad-display-value")!.textContent).toBe("8");
    // The action key mirrors the typed figure, so it confirms what it shows.
    expect(document.querySelector(".pad-key-action .pad-key-value")!.textContent).toBe("8 p");

    click(".pad-key-action");
    expect(document.querySelectorAll(".pad-ring-btn").length).toBe(5);
    expect(document.querySelector(".pad-grid")).toBeNull();
    // Registering stays blocked until a ring count is picked, and the button
    // asks for one rather than naming a half-filled entry.
    expect(document.querySelector<HTMLButtonElement>(".pad-register")!.disabled).toBe(true);
    expect(registerLabel()).toBe("Vel antall ringer");

    const ring = [...document.querySelectorAll<HTMLButtonElement>(".pad-ring-btn")].find(
      (btn) => !btn.disabled,
    )!;
    const count = ring.textContent!.trim();
    ring.click();
    expect(document.querySelector<HTMLButtonElement>(".pad-register")!.disabled).toBe(false);
    // The label carries both figures being saved, each with its unit.
    const unit = count === "1" ? "ring" : "ringar";
    expect(registerLabel()).toBe(`Registrer 8 p – ${count} ${unit} ✓`);
  });

  it("summarises the runder before the pad moves to the next player", async () => {
    /** Types one omgang: poengsum, then the first allowed ring count. */
    async function enter(poeng: number): Promise<void> {
      for (const digit of String(poeng))
        gridKeys()[Number(digit) === 0 ? 10 : Number(digit) - 1]!.click();
      click(".pad-key-action");
      [...document.querySelectorAll<HTMLButtonElement>(".pad-ring-btn")]
        .find((btn) => !btn.disabled)!
        .click();
      click(".pad-register");
      await Promise.resolve();
      await Promise.resolve();
    }

    const step = (pid: number, playerName: string, cellIndex: number) => ({
      header: {
        baneLabel: "Bane 1",
        rundeLabel: "Runde 1 av 1",
        cellLabels: ["1", "2"],
        cellPoeng: [null, null],
        cellIndex,
        totalPoeng: 0,
        totalRinger: 0,
        playerKey: `p${pid}`,
        rundeKey: `p${pid}-r1`,
        summary: {
          rows: [
            {
              label: "1",
              rundeKey: `p${pid}-r1`,
              cellPoeng: [null, null],
              cellRinger: [null, null],
            },
          ],
        },
      },
      playerName,
      onSave: async () => true,
    });

    showXkastKongelagNumberpad([step(1, "Kari", 0), step(1, "Kari", 1), step(2, "Ola", 0)]);

    // The entry screen reads the runde back with the kast being entered marked.
    expect(document.querySelectorAll(".pad-summary-row").length).toBe(1);
    expect(document.querySelector(".pad-summary-kast.current .pad-summary-key")!.textContent).toBe(
      "1",
    );

    await enter(12);
    expect(document.querySelector(".pad-summary-list")).toBeNull();
    // The ring badge tracks what has been saved, on the entry screen too.
    expect(document.querySelector(".pad-total-sub")!.textContent).not.toBe("0");
    await enter(9);

    // Kari's runder are read back instead of Ola's keys.
    expect(document.querySelector(".pad-name")!.textContent).toBe("Kari");
    expect(document.querySelector(".pad-grid")).toBeNull();
    expect(document.querySelector(".pad-total")!.textContent).toBe("21");
    expect(document.querySelectorAll(".pad-summary-row").length).toBe(1);
    expect(document.querySelector(".pad-summary-sum .pad-summary-value")!.textContent).toBe("21");
    expect(document.querySelector(".pad-runde")!.textContent).toBe("Alle 1 runder fullført");
    expect(registerLabel()).toBe("Neste spiller: Ola");

    click(".pad-register");
    expect(document.querySelector(".pad-name")!.textContent).toBe("Ola");
    expect(document.querySelector(".pad-grid")).not.toBeNull();
  });
});
