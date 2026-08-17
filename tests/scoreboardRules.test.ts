/**
 * The scoring rules the scoreboard runs on, tested without a DOM or a service:
 * when a match is won, which player is finished in a 3-player match, and which
 * point buttons an omgang locks once someone has scored.
 */
import { hasWon, matchIsDecided, findFinishedPlayer, pointButtonLocks } from "@/utils/kamp";

const POINTS = [1, 2, 3, 4, 6];

const locks = (values: (number | null)[], active?: number[]) =>
  pointButtonLocks(values, POINTS, active).map((s) => [...s].sort((a, b) => a - b));

describe("hasWon", () => {
  it("needs the target score either way", () => {
    expect(hasWon(20, 0, false)).toBe(false);
    expect(hasWon(21, 0, false)).toBe(true);
  });

  it("accepts a one-point lead when two ahead is not required", () => {
    expect(hasWon(21, 20, false)).toBe(true);
  });

  it("requires two clear points when it is", () => {
    expect(hasWon(21, 20, true)).toBe(false);
    expect(hasWon(22, 20, true)).toBe(true);
  });
});

describe("matchIsDecided", () => {
  it("ends innledende at 21 regardless of the margin", () => {
    expect(matchIsDecided(21, 20, "innledende")).toBe(true);
  });

  it("plays on past 21 in avsluttende until someone is two ahead", () => {
    expect(matchIsDecided(21, 20, "avsluttende")).toBe(false);
    expect(matchIsDecided(23, 21, "avsluttende")).toBe(true);
  });

  it("treats a missing fase as needing two ahead", () => {
    expect(matchIsDecided(21, 20, null)).toBe(false);
  });

  it("decides on either side", () => {
    expect(matchIsDecided(5, 21, "innledende")).toBe(true);
  });
});

describe("findFinishedPlayer", () => {
  it("returns nobody while everyone is short of the target", () => {
    expect(findFinishedPlayer([0, 1, 2], [20, 10, 5])).toBe(null);
  });

  it("returns the player who reached the target two ahead of the weakest", () => {
    expect(findFinishedPlayer([0, 1, 2], [21, 19, 5])).toBe(0);
  });

  it("holds back a player who is not two ahead of the weakest", () => {
    expect(findFinishedPlayer([0, 1, 2], [21, 20, 20])).toBe(null);
  });

  it("ignores players already taken out of the active set", () => {
    expect(findFinishedPlayer([1, 2], [30, 21, 5])).toBe(1);
  });

  it("never finishes the last player standing", () => {
    expect(findFinishedPlayer([2], [0, 0, 30])).toBe(null);
  });
});

describe("pointButtonLocks", () => {
  it("locks nothing before anyone has scored", () => {
    expect(locks([null, null])).toEqual([[], []]);
  });

  it("leaves a player's own score pressable so it can be undone", () => {
    expect(locks([3, null])[0]).toEqual([1, 2, 4, 6]);
  });

  it("closes the omgang for the opponent when the score came without a ringer", () => {
    expect(locks([1, null])[1]).toEqual([1, 2, 3, 4, 6]);
  });

  it("lets the opponent answer a ringer with a ringer", () => {
    expect(locks([3, null])[1]).toEqual([1, 2, 4]);
  });

  it("locks both sides to their own score once both have answered", () => {
    expect(locks([3, 6])).toEqual([
      [1, 2, 4, 6],
      [1, 2, 3, 4],
    ]);
  });

  it("scales past two players", () => {
    expect(locks([6, null, null])).toEqual([
      [1, 2, 3, 4],
      [1, 2, 4],
      [1, 2, 4],
    ]);
  });

  it("leaves inactive players unlocked and out of the reckoning", () => {
    // Player 2 is finished and off the board: their 1 must not close the omgang
    // for the two still playing.
    expect(locks([null, null, 1], [0, 1])).toEqual([[], [], []]);
  });
});
