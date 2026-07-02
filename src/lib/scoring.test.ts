import { describe, it, expect } from "vitest";
import {
  scorePrediction,
  buildLeaderboard,
  resolveWinner,
  POINTS,
  type MatchResult,
} from "./scoring";

const base: MatchResult = {
  round: "R16",
  homeTeamId: "A",
  awayTeamId: "B",
  homeScore: 2,
  awayScore: 1,
  wentToPenalties: false,
  penaltyWinnerTeamId: null,
};

describe("resolveWinner", () => {
  it("higher score wins", () => {
    expect(resolveWinner(base)).toBe("A");
    expect(resolveWinner({ ...base, homeScore: 0, awayScore: 3 })).toBe("B");
  });
  it("draw with penalties uses shootout winner", () => {
    expect(
      resolveWinner({
        ...base,
        homeScore: 1,
        awayScore: 1,
        wentToPenalties: true,
        penaltyWinnerTeamId: "B",
      }),
    ).toBe("B");
  });
  it("draw without penalties has no winner", () => {
    expect(resolveWinner({ ...base, homeScore: 1, awayScore: 1 })).toBeNull();
  });
});

describe("scorePrediction", () => {
  it("exact score in R16: winner + exact, weight 1", () => {
    const b = scorePrediction(
      { homeScore: 2, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null },
      base,
    );
    expect(b.isExact).toBe(true);
    expect(b.correctWinner).toBe(true);
    expect(b.total).toBe(POINTS.WINNER + POINTS.EXACT); // 10
    expect(b.close).toBe(0);
  });

  it("correct winner, wrong score gets closeness credit", () => {
    // predicted 3-1 vs actual 2-1: goalError=1 → close = 3-1 = 2
    const b = scorePrediction(
      { homeScore: 3, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null },
      base,
    );
    expect(b.correctWinner).toBe(true);
    expect(b.isExact).toBe(false);
    expect(b.total).toBe(POINTS.WINNER + 2); // 5 + 2
  });

  it("wrong winner far off scores zero", () => {
    const b = scorePrediction(
      { homeScore: 0, awayScore: 4, wentToPenalties: false, penaltyWinnerTeamId: null },
      base,
    );
    expect(b.total).toBe(0);
  });

  it("applies round weight for the final", () => {
    const b = scorePrediction(
      { homeScore: 2, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null },
      { ...base, round: "FINAL" },
    );
    expect(b.total).toBe((POINTS.WINNER + POINTS.EXACT) * 5); // 50
  });

  it("rewards a correctly-called penalty shootout", () => {
    const result: MatchResult = {
      ...base,
      round: "QF",
      homeScore: 1,
      awayScore: 1,
      wentToPenalties: true,
      penaltyWinnerTeamId: "A",
    };
    const b = scorePrediction(
      { homeScore: 1, awayScore: 1, wentToPenalties: true, penaltyWinnerTeamId: "A" },
      result,
    );
    // winner(5) + exact(5) + penalty(2), all × QF weight 2 = 24
    expect(b.total).toBe((POINTS.WINNER + POINTS.EXACT + POINTS.PENALTY) * 2);
  });

  it("no penalty bonus when shootout winner is wrong", () => {
    const result: MatchResult = {
      ...base,
      homeScore: 1,
      awayScore: 1,
      wentToPenalties: true,
      penaltyWinnerTeamId: "A",
    };
    const b = scorePrediction(
      { homeScore: 1, awayScore: 1, wentToPenalties: true, penaltyWinnerTeamId: "B" },
      result,
    );
    expect(b.penalty).toBe(0);
    expect(b.correctWinner).toBe(false); // predicted B, actual A
  });
});

describe("buildLeaderboard", () => {
  const players = [
    { userId: "u1", username: "Ace", mascotVariant: "red", joinedAt: 100 },
    { userId: "u2", username: "Bolt", mascotVariant: "blue", joinedAt: 200 },
    { userId: "u3", username: "Cy", mascotVariant: "green", joinedAt: 300 },
  ];

  it("ranks by points, then exact count, then join time", () => {
    const scored = [
      // u1: exact 2-1 → 10 pts, 1 exact
      { userId: "u1", result: base, prediction: { homeScore: 2, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null } },
      // u2: correct winner only 3-0 → goalError 2 → close 1, winner 5 = 6
      { userId: "u2", result: base, prediction: { homeScore: 3, awayScore: 0, wentToPenalties: false, penaltyWinnerTeamId: null } },
      // u3: no prediction
    ];
    const lb = buildLeaderboard(players, scored);
    expect(lb.map((e) => e.userId)).toEqual(["u1", "u2", "u3"]);
    expect(lb[0].points).toBe(10);
    expect(lb[0].rank).toBe(1);
    expect(lb[2].points).toBe(0);
    expect(lb[2].rank).toBe(3);
  });

  it("ties share a rank; earlier join breaks the display order", () => {
    const scored = [
      { userId: "u1", result: base, prediction: { homeScore: 2, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null } },
      { userId: "u2", result: base, prediction: { homeScore: 2, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null } },
    ];
    const lb = buildLeaderboard(players, scored);
    expect(lb[0].points).toBe(10);
    expect(lb[1].points).toBe(10);
    expect(lb[0].rank).toBe(1);
    expect(lb[1].rank).toBe(1); // tie shares rank
    expect(lb[2].rank).toBe(3); // next rank skips
    expect(lb[0].userId).toBe("u1"); // earlier join first
  });
});
