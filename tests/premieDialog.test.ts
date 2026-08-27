/**
 * The prize-draw dialog resolves to exactly one of the two answers — a percentage
 * or an exact count — so the draw never has to guess which the admin meant.
 */

import { describe, expect, it } from "vite-plus/test";
import { premieDialog } from "@/components/dialog/PremieDialog";

function field(id: string): HTMLInputElement {
  return document.querySelector<HTMLInputElement>(`#${id}`)!;
}

function click(id: string): void {
  document.querySelector<HTMLButtonElement>(`#${id}`)!.click();
}

function pickMode(value: "prosent" | "antal"): void {
  const radio = document.querySelector<HTMLInputElement>(
    `input[name="premie-modus"][value="${value}"]`,
  )!;
  radio.checked = true;
  radio.dispatchEvent(new Event("change"));
}

describe("premieDialog", () => {
  it("defaults to a percentage, and suggests a tenth as the exact count", async () => {
    const answer = premieDialog({ deltakarar: 67 });
    expect(field("premie-prosent").value).toBe("10");
    expect(field("premie-prosent").disabled).toBe(false);
    expect(field("premie-antal").value).toBe("6");
    expect(field("premie-antal").disabled).toBe(true);

    click("premie-confirm");
    expect(await answer).toEqual({ prosent: 10 });
  });

  it("returns the exact count once that mode is picked, and nothing else", async () => {
    const answer = premieDialog({ deltakarar: 67 });
    pickMode("antal");
    expect(field("premie-prosent").disabled).toBe(true);
    field("premie-antal").value = "8";

    click("premie-confirm");
    expect(await answer).toEqual({ antal: 8 });
  });

  it("resolves to null when cancelled", async () => {
    const answer = premieDialog({ deltakarar: 67 });
    click("premie-cancel");
    expect(await answer).toBeNull();
  });

  it("refuses to resolve on a value outside the allowed range", async () => {
    const answer = premieDialog({ deltakarar: 67 });
    let settled = false;
    void answer.then(() => (settled = true));

    field("premie-prosent").value = "150";
    click("premie-confirm");
    await Promise.resolve();
    expect(settled).toBe(false);

    field("premie-prosent").value = "25";
    click("premie-confirm");
    expect(await answer).toEqual({ prosent: 25 });
  });

  it("reopens on the percentage mode after the count was used", async () => {
    const first = premieDialog({ deltakarar: 40 });
    pickMode("antal");
    click("premie-confirm");
    await first;

    const second = premieDialog({ deltakarar: 40 });
    expect(field("premie-prosent").disabled).toBe(false);
    expect(field("premie-antal").disabled).toBe(true);
    click("premie-confirm");
    expect(await second).toEqual({ prosent: 10 });
  });
});
