import { describe, it, expect } from "vitest";
import {
  buildBracket,
  feedTarget,
  matchWinner,
  nextRound,
  roundsForSize,
  seedOrder,
  roundMatchCount,
  isSupportedSize,
} from "./bracket";
import { parseYouTubeId, youTubeEmbedUrl, punishmentSlotLabel, ordinal } from "./youtube";

describe("bracket structure", () => {
  it("rounds are generic R{n} codes largest→smallest", () => {
    expect(roundsForSize(16)).toEqual(["R16", "R8", "R4", "R2"]);
    expect(roundsForSize(8)).toEqual(["R8", "R4", "R2"]);
    expect(roundsForSize(32)).toEqual(["R32", "R16", "R8", "R4", "R2"]);
  });

  it("nextRound walks R16→R8→R4→R2→null", () => {
    expect(nextRound("R16")).toBe("R8");
    expect(nextRound("R8")).toBe("R4");
    expect(nextRound("R4")).toBe("R2");
    expect(nextRound("R2")).toBeNull();
  });

  it("feedTarget maps slots to next round home/away", () => {
    expect(feedTarget("R16", 0)).toEqual({ round: "R8", slot: 0, side: "home" });
    expect(feedTarget("R16", 1)).toEqual({ round: "R8", slot: 0, side: "away" });
    expect(feedTarget("R16", 7)).toEqual({ round: "R8", slot: 3, side: "away" });
    expect(feedTarget("R2", 0)).toBeNull();
  });

  it("seedOrder keeps top seeds apart (1 & 2 in opposite halves)", () => {
    const o16 = seedOrder(16);
    expect(o16).toHaveLength(16);
    expect(o16[0]).toBe(1); // slot 0 home = seed 1
    expect(o16[1]).toBe(16); // slot 0 away = seed 16
    // seed 2 lives in the second half of the draw
    expect(o16.indexOf(2)).toBeGreaterThanOrEqual(8);
    expect(new Set(o16).size).toBe(16); // all seeds present once
  });

  it.each([8, 16, 32, 64])("buildBracket(%i) wires a complete bracket", (size) => {
    expect(isSupportedSize(size)).toBe(true);
    const teams = Array.from({ length: size }, (_, i) => `t${i + 1}`);
    let n = 0;
    const matches = buildBracket(teams, size, () => `m${n++}`);
    expect(matches).toHaveLength(size - 1);

    const first = matches.filter((m) => m.round === `R${size}`);
    expect(first).toHaveLength(size / 2);
    expect(first[0].homeTeamId).toBe("t1");
    expect(first[0].awayTeamId).toBe(`t${size}`);

    const final = matches.find((m) => m.round === "R2")!;
    expect(final.feedsIntoMatchId).toBeNull();
    for (const m of matches.filter((x) => x.round !== "R2")) {
      expect(m.feedsIntoMatchId).not.toBeNull();
    }
    expect(first[0].feedsIntoMatchId).toBe(first[1].feedsIntoMatchId);
    expect(first[0].feedsIntoSide).toBe("home");
    expect(first[1].feedsIntoSide).toBe("away");
    expect(roundMatchCount(`R${size}`)).toBe(size / 2);
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
