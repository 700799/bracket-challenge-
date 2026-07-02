import { describe, it, expect } from "vitest";
import { buildBracket, feedTarget, matchWinner, nextRound } from "./bracket";
import { parseYouTubeId, youTubeEmbedUrl, punishmentSlotLabel, ordinal } from "./youtube";

describe("bracket structure", () => {
  it("nextRound walks R16→QF→SF→FINAL→null", () => {
    expect(nextRound("R16")).toBe("QF");
    expect(nextRound("QF")).toBe("SF");
    expect(nextRound("SF")).toBe("FINAL");
    expect(nextRound("FINAL")).toBeNull();
  });

  it("feedTarget maps slots to next round home/away", () => {
    expect(feedTarget("R16", 0)).toEqual({ round: "QF", slot: 0, side: "home" });
    expect(feedTarget("R16", 1)).toEqual({ round: "QF", slot: 0, side: "away" });
    expect(feedTarget("R16", 7)).toEqual({ round: "QF", slot: 3, side: "away" });
    expect(feedTarget("FINAL", 0)).toBeNull();
  });

  it("buildBracket creates 15 wired matches with seeded R16", () => {
    const teams = Array.from({ length: 16 }, (_, i) => `t${i + 1}`);
    let n = 0;
    const matches = buildBracket(teams, () => `m${n++}`);
    expect(matches).toHaveLength(15);

    const r16 = matches.filter((m) => m.round === "R16");
    expect(r16).toHaveLength(8);
    // Slot 0 pairs seed 1 (t1) vs seed 16 (t16) per SEED_ORDER.
    expect(r16[0].homeTeamId).toBe("t1");
    expect(r16[0].awayTeamId).toBe("t16");

    // Every non-final match feeds somewhere; final feeds nowhere.
    const final = matches.find((m) => m.round === "FINAL")!;
    expect(final.feedsIntoMatchId).toBeNull();
    for (const m of matches.filter((x) => x.round !== "FINAL")) {
      expect(m.feedsIntoMatchId).not.toBeNull();
    }

    // R16 slot 0 and 1 feed the same QF match, opposite sides.
    expect(r16[0].feedsIntoMatchId).toBe(r16[1].feedsIntoMatchId);
    expect(r16[0].feedsIntoSide).toBe("home");
    expect(r16[1].feedsIntoSide).toBe("away");
  });

  it("matchWinner respects scores and penalties", () => {
    expect(
      matchWinner({ homeScore: 2, awayScore: 0, wentToPenalties: false, penaltyWinnerTeamId: null, homeTeamId: "A", awayTeamId: "B" }),
    ).toBe("A");
    expect(
      matchWinner({ homeScore: 1, awayScore: 1, wentToPenalties: true, penaltyWinnerTeamId: "B", homeTeamId: "A", awayTeamId: "B" }),
    ).toBe("B");
    expect(
      matchWinner({ homeScore: 1, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null, homeTeamId: "A", awayTeamId: "B" }),
    ).toBeNull();
  });
});

describe("youtube helpers", () => {
  it("parses every common URL shape", () => {
    const id = "dQw4w9WgXcQ";
    expect(parseYouTubeId(`https://www.youtube.com/watch?v=${id}`)).toBe(id);
    expect(parseYouTubeId(`https://youtu.be/${id}`)).toBe(id);
    expect(parseYouTubeId(`https://www.youtube.com/embed/${id}`)).toBe(id);
    expect(parseYouTubeId(`https://www.youtube.com/shorts/${id}`)).toBe(id);
    expect(parseYouTubeId(id)).toBe(id);
  });
  it("rejects junk", () => {
    expect(parseYouTubeId("not a url")).toBeNull();
    expect(parseYouTubeId("https://example.com/watch?v=abc")).toBeNull();
  });
  it("builds an embed url", () => {
    expect(youTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });
  it("labels punishment slots", () => {
    expect(punishmentSlotLabel(1, null)).toBe("Last place");
    expect(punishmentSlotLabel(4, null)).toBe("4th from last");
    expect(punishmentSlotLabel(null, 1)).toBe("1st place");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
    expect(ordinal(11)).toBe("11th");
  });
});
