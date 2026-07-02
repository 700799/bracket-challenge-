import { describe, it, expect } from "vitest";
import { computeStats } from "./stats";
import type { LeaderboardEntry, ScoredPrediction, MatchResult } from "./scoring";

function entry(userId: string, points: number, rank: number): LeaderboardEntry {
  return {
    userId,
    username: userId.toUpperCase(),
    mascotVariant: "red",
    points,
    exactCount: 0,
    correctWinners: 0,
    joinedAt: rank,
    rank,
  };
}

const R16 = (over: Partial<MatchResult> = {}): MatchResult => ({
  round: "R16",
  homeTeamId: "A",
  awayTeamId: "B",
  homeScore: 2,
  awayScore: 1,
  wentToPenalties: false,
  penaltyWinnerTeamId: null,
  ...over,
});

describe("computeStats", () => {
  const entries = [entry("u1", 20, 1), entry("u2", 10, 2), entry("u3", 0, 3)];
  const scored: ScoredPrediction[] = [
    // u1 exact 2-1 → 10 pts (winner+exact)
    { userId: "u1", result: R16(), prediction: { homeScore: 2, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null } },
    // u1 another exact → 10 pts
    { userId: "u1", result: R16({ homeTeamId: "C", awayTeamId: "D", homeScore: 1, awayScore: 0 }), prediction: { homeScore: 1, awayScore: 0, wentToPenalties: false, penaltyWinnerTeamId: null } },
    // u2 correct winner, close → 5+? on 3-0 vs 2-1 (goalErr2 → close1) = 6
    { userId: "u2", result: R16(), prediction: { homeScore: 3, awayScore: 0, wentToPenalties: false, penaltyWinnerTeamId: null } },
    // u2 wrong winner → 0
    { userId: "u2", result: R16(), prediction: { homeScore: 0, awayScore: 3, wentToPenalties: false, penaltyWinnerTeamId: null } },
  ];

  it("computes average, median, and top", () => {
    const s = computeStats(entries, scored, 16);
    expect(s.memberCount).toBe(3);
    expect(s.averagePoints).toBe(10); // (20+10+0)/3
    expect(s.medianPoints).toBe(10);
    expect(s.topPoints).toBe(20);
  });

  it("tracks per-player win/loss records", () => {
    const s = computeStats(entries, scored, 16);
    const u1 = s.records.find((r) => r.userId === "u1")!;
    expect(u1.picks).toBe(2);
    expect(u1.correctWinners).toBe(2);
    expect(u1.wrongWinners).toBe(0);
    expect(u1.exact).toBe(2);
    const u2 = s.records.find((r) => r.userId === "u2")!;
    expect(u2.picks).toBe(2);
    expect(u2.correctWinners).toBe(1);
    expect(u2.wrongWinners).toBe(1);
  });

  it("ranks biggest single-prediction hauls", () => {
    const s = computeStats(entries, scored, 16);
    expect(s.biggestDeltas.length).toBeGreaterThan(0);
    expect(s.biggestDeltas[0].points).toBe(10);
    // sorted descending
    for (let i = 1; i < s.biggestDeltas.length; i++) {
      expect(s.biggestDeltas[i - 1].points).toBeGreaterThanOrEqual(s.biggestDeltas[i].points);
    }
  });

  it("reports the viewer's rank and percentile", () => {
    const s = computeStats(entries, scored, 16, "u1");
    expect(s.viewer).toEqual({ rank: 1, points: 20, percentile: 100 });
    const last = computeStats(entries, scored, 16, "u3");
    expect(last.viewer?.rank).toBe(3);
    expect(last.viewer?.percentile).toBe(0);
  });

  it("ignores non-members in deltas/records", () => {
    const s = computeStats(entries, [
      ...scored,
      { userId: "ghost", result: R16(), prediction: { homeScore: 2, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null } },
    ], 16);
    expect(s.records.find((r) => r.userId === "ghost")).toBeUndefined();
    expect(s.biggestDeltas.every((d) => d.userId !== "ghost")).toBe(true);
  });
});
