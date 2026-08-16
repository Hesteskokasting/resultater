import { renderStandingTable } from "@/pages/stevne/faseView";
import type { StandingRow, StandingMatch } from "@/utils/stilling";

function parse(html: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.firstElementChild as HTMLElement;
}

function player(
  kasterid: number,
  naam: string | null = null,
  overrides: Partial<StandingRow> = {},
): StandingRow {
  return {
    kasterid,
    navn: naam ?? `Spelar ${kasterid}`,
    kamp_poeng: 0,
    score_poeng: 0,
    ...overrides,
  };
}

const NO_KAMPER: StandingMatch[] = [];
const NO_STARTNR: Record<number, number> = {};

describe("renderStandingTable", () => {
  describe("wrapper and heading", () => {
    it('renders an h6 heading with "Stilling" by default', () => {
      const el = parse(renderStandingTable([player(1)], NO_KAMPER, NO_STARTNR));
      expect(el.querySelector("h6")?.textContent).toBe("Stilling");
    });

    it('heading shows "N spelarar" when hasMatchCount is true', () => {
      const el = parse(
        renderStandingTable([player(1), player(2)], NO_KAMPER, NO_STARTNR, { hasMatchCount: true }),
      );
      expect(el.querySelector("h6")?.textContent).toBe("2 spelarar");
    });
  });

  describe("table identity", () => {
    it('table has the default id "standing-table"', () => {
      const el = parse(renderStandingTable([player(1)], NO_KAMPER, NO_STARTNR));
      expect(el.querySelector("table")?.id).toBe("standing-table");
    });

    it("uses the tableId option when provided", () => {
      const el = parse(
        renderStandingTable([player(1)], NO_KAMPER, NO_STARTNR, { tableId: "my-tabell" }),
      );
      expect(el.querySelector("table")?.id).toBe("my-tabell");
    });
  });

  describe("player rows", () => {
    it("renders one player row per stilling entry", () => {
      const el = parse(
        renderStandingTable([player(1), player(2), player(3)], NO_KAMPER, NO_STARTNR),
      );
      expect(el.querySelectorAll("tr.standing-player-row").length).toBe(3);
    });

    it("sets the correct data-kasterid on each player row", () => {
      const el = parse(renderStandingTable([player(42), player(7)], NO_KAMPER, NO_STARTNR));
      const ids = [...el.querySelectorAll("tr.standing-player-row")].map((tr) =>
        tr.getAttribute("data-kasterid"),
      );
      expect(ids).toEqual(["42", "7"]);
    });

    it("shows the player name in the row", () => {
      const el = parse(renderStandingTable([player(1, "Ola Normann")], NO_KAMPER, NO_STARTNR));
      expect(el.querySelector("tr.standing-player-row")?.textContent).toContain("Ola Normann");
    });

    it('falls back to "Spelar N" when navn is null', () => {
      const el = parse(renderStandingTable([{ kasterid: 5, navn: null }], NO_KAMPER, NO_STARTNR));
      expect(el.querySelector("tr.standing-player-row")?.textContent).toContain("Spelar 5");
    });

    it("# column shows sequential position within the group", () => {
      const el = parse(
        renderStandingTable([player(1), player(2), player(3)], NO_KAMPER, NO_STARTNR),
      );
      const positions = [...el.querySelectorAll("tr.standing-player-row")].map(
        (tr) => tr.querySelector("td")?.textContent,
      );
      expect(positions).toEqual(["1", "2", "3"]);
    });
  });

  describe("column headers", () => {
    it("always renders # NAMN KP SP headers", () => {
      const el = parse(renderStandingTable([player(1)], NO_KAMPER, NO_STARTNR));
      const headers = [...el.querySelectorAll("thead th")].map((th) => th.textContent);
      expect(headers).toContain("#");
      expect(headers).toContain("NAMN");
      expect(headers).toContain("KP");
      expect(headers).toContain("SP");
    });

    it("K header present when hasMatchCount is true", () => {
      const el = parse(
        renderStandingTable([player(1)], NO_KAMPER, NO_STARTNR, { hasMatchCount: true }),
      );
      const headers = [...el.querySelectorAll("thead th")].map((th) => th.textContent);
      expect(headers).toContain("K");
    });

    it("K header absent by default", () => {
      const el = parse(renderStandingTable([player(1)], NO_KAMPER, NO_STARTNR));
      const headers = [...el.querySelectorAll("thead th")].map((th) => th.textContent);
      expect(headers).not.toContain("K");
    });
  });

  describe("hasElimination", () => {
    it("adds final-elim-position class to the # cell of eliminated players", () => {
      const stilling = [player(1, "Aktiv"), player(2, "Ute", { runde_eliminert: 2 })];
      const el = parse(
        renderStandingTable(stilling, NO_KAMPER, NO_STARTNR, { hasElimination: true }),
      );
      const rows = [...el.querySelectorAll("tr.standing-player-row")];
      expect(rows[0]!.querySelector("td")?.classList.contains("final-elim-position")).toBe(false);
      expect(rows[1]!.querySelector("td")?.classList.contains("final-elim-position")).toBe(true);
    });

    it("final-elim-position is absent when hasElimination is false even for eliminated players", () => {
      const stilling = [player(1, "Ute", { runde_eliminert: 2 })];
      const el = parse(
        renderStandingTable(stilling, NO_KAMPER, NO_STARTNR, { hasElimination: false }),
      );
      expect(
        el.querySelector("tr.standing-player-row td")?.classList.contains("final-elim-position"),
      ).toBe(false);
    });
  });

  describe("hasGroups", () => {
    it("inserts a group header row for each named group", () => {
      const stilling = [
        player(1, "P1", { gruppe: { navn: "A" } }),
        player(2, "P2", { gruppe: { navn: "B" } }),
      ];
      const el = parse(renderStandingTable(stilling, NO_KAMPER, NO_STARTNR, { hasGroups: true }));
      const groupHeaders = el.querySelectorAll(".fw-semibold");
      expect(groupHeaders.length).toBe(2);
      expect(groupHeaders[0]!.textContent).toBe("Gruppe A");
      expect(groupHeaders[1]!.textContent).toBe("Gruppe B");
    });

    it("resets position counter within each group", () => {
      const stilling = [
        player(1, "A1", { gruppe: { navn: "A" } }),
        player(2, "A2", { gruppe: { navn: "A" } }),
        player(3, "B1", { gruppe: { navn: "B" } }),
      ];
      const el = parse(renderStandingTable(stilling, NO_KAMPER, NO_STARTNR, { hasGroups: true }));
      const rows = [...el.querySelectorAll("tr.standing-player-row")];
      const positions = rows.map((tr) => tr.querySelector("td")?.textContent);
      expect(positions).toEqual(["1", "2", "1"]);
    });
  });
});
