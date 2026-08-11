/**
 * The picker replaces a long <select>, so the two things it has to get right are
 * the id it hands a surrounding form and never leaving free text behind as a value.
 */
import { createSearchSelect } from "@/components/SearchSelect";

const ITEMS = [
  { id: 1, label: "Nordmann Kari", sublabel: "Førde HK" },
  { id: 2, label: "Torgersen Sondre", sublabel: "Gloppen HK" },
  { id: 3, label: "Torgersen Ola", sublabel: "Førde HK" },
];

function mount(extra: Record<string, unknown> = {}) {
  const form = document.createElement("form");
  document.body.replaceChildren(form);
  const picker = createSearchSelect({ items: ITEMS, name: "kasterid", ...extra });
  form.append(picker.el);

  const search = picker.el.querySelector<HTMLInputElement>('input[type="text"]')!;
  const type = (q: string): HTMLElement[] => {
    search.value = q;
    search.dispatchEvent(new Event("input"));
    return [...picker.el.querySelectorAll<HTMLElement>(".search-select__menu [data-id]")];
  };
  const key = (k: string): void => {
    search.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
  };
  const submitted = (): FormDataEntryValue | null => new FormData(form).get("kasterid");

  return { form, picker, search, type, key, submitted };
}

describe("createSearchSelect", () => {
  it("matches both name parts in any order, and the club", () => {
    const h = mount();
    expect(h.type("torgersen").map((r) => r.dataset["id"])).toEqual(["2", "3"]);
    expect(h.type("sondre torgersen").map((r) => r.dataset["id"])).toEqual(["2"]);
    expect(h.type("førde").map((r) => r.dataset["id"])).toEqual(["1", "3"]);
    expect(h.type("finnes ikkje")).toHaveLength(0);
  });

  it("writes the picked id to the form field and shows the label", () => {
    const onSelect = vi.fn();
    const h = mount({ onSelect });

    const [row] = h.type("sondre");
    row!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));

    expect(h.submitted()).toBe("2");
    expect(h.search.value).toBe("Torgersen Sondre");
    expect(onSelect).toHaveBeenCalledWith(2);
    expect(h.picker.el.querySelector(".search-select__menu")!.className).toContain("d-none");
  });

  it("selects with arrow keys and Enter", () => {
    const h = mount();
    h.type("torgersen");
    h.key("ArrowDown");
    h.key("ArrowDown");
    h.key("Enter");

    expect(h.submitted()).toBe("3");
  });

  it("keeps a preselected value and offers a row to clear it", () => {
    const onSelect = vi.fn();
    const h = mount({ value: 2, clearLabel: "— ingen —", onSelect });
    expect(h.search.value).toBe("Torgersen Sondre");
    expect(h.submitted()).toBe("2");

    const [clear] = h.type("");
    expect(clear!.dataset["id"]).toBe("");
    clear!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));

    expect(h.submitted()).toBe("");
    expect(h.search.value).toBe("");
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("never leaves free text behind as a value", () => {
    const h = mount({ value: 1 });
    h.type("noko heilt anna");
    h.search.dispatchEvent(new Event("blur"));

    expect(h.submitted()).toBe("1");
    expect(h.search.value).toBe("Nordmann Kari");
  });

  it("loads the list lazily on the first search", async () => {
    const loadItems = vi.fn().mockResolvedValue(ITEMS);
    const h = mount({ items: undefined, loadItems });

    // Under two characters the list is not even fetched.
    expect(h.type("t")).toHaveLength(0);
    expect(loadItems).not.toHaveBeenCalled();

    h.type("to");
    await vi.waitFor(() => expect(loadItems).toHaveBeenCalledTimes(1));
    expect(
      [...h.picker.el.querySelectorAll<HTMLElement>(".search-select__menu [data-id]")].map(
        (r) => r.dataset["id"],
      ),
    ).toEqual(["2", "3"]);

    h.type("kari");
    await vi.waitFor(() => expect(loadItems).toHaveBeenCalledTimes(1));
  });
});
