/**
 * The info tooltip. It opens on click rather than hover, so the parts worth
 * pinning down are the ones a touch user depends on: it closes when they tap
 * elsewhere or press Escape, and it stops listening once its page is gone.
 */

import { beforeEach, describe, expect, it } from "vite-plus/test";
import { createInfoTooltip } from "@/components/InfoTooltip";

function mount(html = "<p>Forklaring</p>"): {
  wrapper: HTMLElement;
  button: HTMLButtonElement;
  panel: HTMLElement;
  tip: ReturnType<typeof createInfoTooltip>;
} {
  const host = document.createElement("div");
  host.innerHTML = `<h1>Tittel<span id="slot"></span></h1><p id="utanfor">annan tekst</p>`;
  document.body.replaceChildren(host);

  const tip = createInfoTooltip({ slot: host.querySelector("#slot")!, label: "Om lista", html });
  // Reached the way a page reaches it: the tooltip replaced the slot in place.
  const wrapper = host.querySelector<HTMLElement>(".info-tip")!;
  return {
    wrapper,
    button: wrapper.querySelector("button")!,
    panel: wrapper.querySelector<HTMLElement>(".info-tip__panel")!,
    tip,
  };
}

beforeEach(() => document.body.replaceChildren());

describe("createInfoTooltip", () => {
  it("replaces the slot and starts closed", () => {
    const { wrapper, button, panel } = mount();
    expect(document.querySelector("#slot")).toBeNull();
    expect(wrapper.isConnected).toBe(true);
    expect(panel.hidden).toBe(true);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-label")).toBe("Om lista");
    expect(button.getAttribute("aria-controls")).toBe(panel.id);
  });

  it("toggles on the button", () => {
    const { button, panel } = mount();
    button.click();
    expect(panel.hidden).toBe(false);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    button.click();
    expect(panel.hidden).toBe(true);
  });

  it("renders the html it was given", () => {
    const { panel } = mount("<p><strong>5</strong> beste</p>");
    expect(panel.querySelector("strong")?.textContent).toBe("5");
  });

  it("stays open on a click inside itself", () => {
    const { button, panel } = mount();
    button.click();
    panel.click();
    expect(panel.hidden).toBe(false);
  });

  it("closes on a click elsewhere on the page", () => {
    const { button, panel } = mount();
    button.click();
    document.querySelector<HTMLElement>("#utanfor")!.click();
    expect(panel.hidden).toBe(true);
  });

  it("closes on Escape", () => {
    const { button, panel } = mount();
    button.click();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(panel.hidden).toBe(true);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("gives ids of its own so two tooltips do not collide", () => {
    const a = mount();
    const b = mount();
    expect(a.panel.id).not.toBe(b.panel.id);
  });

  it("swaps its contents through setHtml", () => {
    const { panel, tip } = mount();
    tip.setHtml("<p>Ny tekst</p>");
    expect(panel.textContent).toContain("Ny tekst");
  });

  it("stops listening once its page has been replaced", () => {
    const { button, panel } = mount();
    button.click();
    document.body.replaceChildren();

    // Nothing to assert on the detached panel beyond it being left alone — the
    // point is that the document listeners drop themselves rather than throw.
    expect(() => document.body.click()).not.toThrow();
    expect(panel.hidden).toBe(false);
  });
});
