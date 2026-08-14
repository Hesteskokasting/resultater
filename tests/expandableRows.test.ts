/**
 * The shared expand mechanics, and the one caller whose behaviour goes beyond
 * them: the live stilling, which addresses its detail by kasterid rather than by
 * adjacency and has to reopen the same rows after every re-render.
 */

import { beforeEach, describe, expect, it } from "vite-plus/test";
import { bindExpandableRows, makeRowsFocusable } from "@/utils/expandableRows";
import { bindStandingDetails } from "@/organizer/org-shared";

function host(html: string): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.replaceChildren(el);
  return el;
}

function press(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

beforeEach(() => document.body.replaceChildren());

describe("bindExpandableRows", () => {
  function simple(): HTMLElement {
    const el = host(`
      <div class="row"><button class="trig">A</button><div class="panel" hidden>a</div></div>
      <div class="row"><button class="trig">B</button><div class="panel" hidden>b</div></div>`);
    bindExpandableRows(el, {
      trigger: ".trig",
      panel: (t) => t.closest(".row")?.querySelector<HTMLElement>(".panel") ?? null,
    });
    return el;
  }

  it("toggles the panel and mirrors it in aria-expanded", () => {
    const el = simple();
    const btn = el.querySelector<HTMLElement>(".trig")!;
    const panel = el.querySelector<HTMLElement>(".panel")!;

    expect(btn.getAttribute("aria-expanded")).toBeNull();
    btn.click();
    expect(panel.hidden).toBe(false);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    btn.click();
    expect(panel.hidden).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("leaves the other rows alone", () => {
    const el = simple();
    el.querySelectorAll<HTMLElement>(".trig")[0]!.click();
    expect(el.querySelectorAll<HTMLElement>(".panel")[1]!.hidden).toBe(true);
  });

  it("fires a click from inside the trigger too", () => {
    const el = host(`
      <div class="row">
        <button class="trig"><span class="label">A</span></button>
        <div class="panel" hidden>a</div>
      </div>`);
    bindExpandableRows(el, {
      trigger: ".trig",
      panel: (t) => t.closest(".row")?.querySelector<HTMLElement>(".panel") ?? null,
    });
    el.querySelector<HTMLElement>(".label")!.click();
    expect(el.querySelector<HTMLElement>(".panel")!.hidden).toBe(false);
  });

  it("does not act twice on a button, which already turns Enter into a click", () => {
    const el = simple();
    const btn = el.querySelector<HTMLElement>(".trig")!;
    btn.click();
    press(btn, "Enter");
    expect(el.querySelector<HTMLElement>(".panel")!.hidden).toBe(false);
  });

  it("opens a non-button trigger from Enter and Space", () => {
    const el = host(`<tr class="trig"></tr><div class="panel" hidden>a</div>`);
    const trig = document.createElement("div");
    trig.className = "trig";
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.hidden = true;
    el.replaceChildren(trig, panel);
    bindExpandableRows(el, { trigger: ".trig", panel: () => panel });

    press(trig, "Enter");
    expect(panel.hidden).toBe(false);
    press(trig, " ");
    expect(panel.hidden).toBe(true);
  });

  it("ignores a trigger whose panel cannot be found", () => {
    const el = simple();
    bindExpandableRows(el, { trigger: ".trig", panel: () => null });
    const btn = el.querySelectorAll<HTMLElement>(".trig")[1]!;
    expect(() => btn.click()).not.toThrow();
  });

  it("reports the new state to onToggle", () => {
    const el = host(`
      <div class="row"><button class="trig">A</button><div class="panel" hidden>a</div></div>`);
    const seen: boolean[] = [];
    bindExpandableRows(el, {
      trigger: ".trig",
      panel: (t) => t.closest(".row")?.querySelector<HTMLElement>(".panel") ?? null,
      onToggle: (_, open) => seen.push(open),
    });
    const btn = el.querySelector<HTMLElement>(".trig")!;
    btn.click();
    btn.click();
    expect(seen).toEqual([true, false]);
  });
});

describe("makeRowsFocusable", () => {
  it("gives the rows a tab stop and a starting state", () => {
    const el = host(`<div class="r"></div><div class="r" aria-expanded="true"></div>`);
    makeRowsFocusable(el, ".r");
    const rows = [...el.querySelectorAll(".r")];
    expect(rows.map((r) => r.getAttribute("tabindex"))).toEqual(["0", "0"]);
    expect(rows.map((r) => r.getAttribute("aria-expanded"))).toEqual(["false", "true"]);
  });
});

describe("bindStandingDetails", () => {
  function standing(): HTMLElement {
    return host(`
      <table id="standing-initial">
        <tbody>
          <tr class="standing-player-row" data-kasterid="7"><td>Ada</td></tr>
          <tr class="standing-detail" data-kasterid="7" hidden><td>detalj 7</td></tr>
          <tr class="standing-player-row" data-kasterid="9"><td>Bo</td></tr>
          <tr class="standing-detail" data-kasterid="9" hidden><td>detalj 9</td></tr>
        </tbody>
      </table>`);
  }

  it("opens the detail belonging to the clicked kasterid", () => {
    const el = standing();
    bindStandingDetails(el, "standing-initial");
    const row = el.querySelector<HTMLElement>('tr.standing-player-row[data-kasterid="9"]')!;
    row.click();

    expect(el.querySelector<HTMLElement>('tr.standing-detail[data-kasterid="9"]')!.hidden).toBe(
      false,
    );
    expect(el.querySelector<HTMLElement>('tr.standing-detail[data-kasterid="7"]')!.hidden).toBe(
      true,
    );
    expect(row.classList.contains("standing-active")).toBe(true);
    expect(row.getAttribute("aria-expanded")).toBe("true");
  });

  it("records and drops the open rows as they are toggled", () => {
    const el = standing();
    const open = new Set<string>();
    bindStandingDetails(el, "standing-initial", open);
    const row = el.querySelector<HTMLElement>('tr.standing-player-row[data-kasterid="7"]')!;

    row.click();
    expect([...open]).toEqual(["7"]);
    row.click();
    expect([...open]).toEqual([]);
  });

  it("reopens what was open before the re-render", () => {
    const el = standing();
    bindStandingDetails(el, "standing-initial", new Set(["9"]));

    expect(el.querySelector<HTMLElement>('tr.standing-detail[data-kasterid="9"]')!.hidden).toBe(
      false,
    );
    const row = el.querySelector<HTMLElement>('tr.standing-player-row[data-kasterid="9"]')!;
    expect(row.classList.contains("standing-active")).toBe(true);
    expect(row.getAttribute("aria-expanded")).toBe("true");
  });

  it("opens a row from the keyboard", () => {
    const el = standing();
    bindStandingDetails(el, "standing-initial");
    const row = el.querySelector<HTMLElement>('tr.standing-player-row[data-kasterid="7"]')!;
    expect(row.getAttribute("tabindex")).toBe("0");

    press(row, "Enter");
    expect(el.querySelector<HTMLElement>('tr.standing-detail[data-kasterid="7"]')!.hidden).toBe(
      false,
    );
  });

  it("does nothing when the table is not there", () => {
    const el = standing();
    expect(() => bindStandingDetails(el, "standing-missing")).not.toThrow();
  });
});
