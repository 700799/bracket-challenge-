import { describe, it, expect } from "vitest";
import {
  scorePrediction,
  buildLeaderboard,
  resolveWinner,
  roundWeight,
  roundLabel,
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

describe("roundWeight", () => {
  it("preserves classic 16-team weights", () => {
    expect(roundWeight("R16", 16)).toBe(1);
    expect(roundWeight("R8", 16)).toBe(2); // QF
    expect(roundWeight("R4", 16)).toBe(3); // SF
    expect(roundWeight("R2", 16)).toBe(5); // Final
  });
  it("scales for other sizes", () => {
    expect(roundWeight("R8", 8)).toBe(1);
    expect(roundWeight("R4", 8)).toBe(2);
    expect(roundWeight("R2", 8)).toBe(4); // final = numRounds(3)+1
    expect(roundWeight("R32", 32)).toBe(1);
    expect(roundWeight("R2", 32)).toBe(6); // final = numRounds(5)+1
  });
  it("labels rounds by teams", () => {
    expect(roundLabel("R2")).toBe("Final");
    expect(roundLabel("R4")).toBe("Semi-finals");
    expect(roundLabel("R8")).toBe("Quarter-finals");
    expect(roundLabel("R16")).toBe("Round of 16");
    expect(roundLabel("R32")).toBe("Round of 32");
  });
});

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
      16,
    );
    expect(b.isExact).toBe(true);
    expect(b.correctWinner).toBe(true);
    expect(b.total).toBe(POINTS.WINNER + POINTS.EXACT); // 10
    expect(b.close).toBe(0);
  });

  it("correct winner, wrong score gets closeness credit", () => {
    const b = scorePrediction(
      { homeScore: 3, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null },
      base,
      16,
    );
    expect(b.correctWinner).toBe(true);
    expect(b.isExact).toBe(false);
    expect(b.total).toBe(POINTS.WINNER + 2); // 5 + 2
  });

  it("wrong winner far off scores zero", () => {
    const b = scorePrediction(
      { homeScore: 0, awayScore: 4, wentToPenalties: false, penaltyWinnerTeamId: null },
      base,
      16,
    );
    expect(b.total).toBe(0);
  });

  it("applies round weight for the final (R2)", () => {
    const b = scorePrediction(
      { homeScore: 2, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null },
      { ...base, round: "R2" },
      16,
    );
    expect(b.total).toBe((POINTS.WINNER + POINTS.EXACT) * 5); // 50
  });

  it("rewards a correctly-called penalty shootout (R8 weight 2)", () => {
    const result: MatchResult = {
      ...base,
      round: "R8",
      homeScore: 1,
      awayScore: 1,
      wentToPenalties: true,
      penaltyWinnerTeamId: "A",
    };
    const b = scorePrediction(
      { homeScore: 1, awayScore: 1, wentToPenalties: true, penaltyWinnerTeamId: "A" },
      result,
      16,
    );
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
      16,
    );
    expect(b.penalty).toBe(0);
    expect(b.correctWinner).toBe(false);
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
      { userId: "u1", result: base, prediction: { homeScore: 2, awayScore: 1, wentToPenalties: false, penaltyWinnerTeamId: null } },
      { userId: "u2", result: base, prediction: { homeScore: 3, awayScore: 0, wentToPenalties: false, penaltyWinnerTeamId: null } },
    ];
    const lb = buildLeaderboard(players, scored, 16);
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
    const lb = buildLeaderboard(players, scored, 16);
    expect(lb[0].rank).toBe(1);
    expect(lb[1].rank).toBe(1);
    expect(lb[2].rank).toBe(3);
    expect(lb[0].userId).toBe("u1");
  });
});
