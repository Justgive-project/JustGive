import { describe, expect, it } from "vitest";
import { rankContributors } from "../src/lib/leaderboard";

const people = [
  { id: "a", amountPaise: 500, displayName: "A", photoUrl: null, biography: null, consent: true },
  { id: "b", amountPaise: 500, displayName: "B", photoUrl: null, biography: null, consent: true },
  { id: "c", amountPaise: 200, displayName: "C", photoUrl: null, biography: null, consent: true },
  { id: "private", amountPaise: 900, displayName: "Private", photoUrl: null, biography: null, consent: false },
];

describe("leaderboard ranking", () => {
  it("gives tied amounts equal ranks and skips the next rank", () => {
    expect(rankContributors(people).map(({ id, rank }) => [id, rank])).toEqual([["a", 1], ["b", 1], ["c", 3]]);
  });
  it("excludes contributors without public consent", () => {
    expect(rankContributors(people).some(({ id }) => id === "private")).toBe(false);
  });
  it("returns one consistent ordered set for the garden and Top 20", () => {
    const topTwenty = rankContributors(Array.from({ length: 22 }, (_, index) => ({ ...people[2], id: String(index), amountPaise: 2200 - index, consent: true })));
    expect(rankContributors(topTwenty, 10).map(({ id }) => id)).toEqual(topTwenty.slice(0, 10).map(({ id }) => id));
    expect(topTwenty).toHaveLength(20);
  });
});
