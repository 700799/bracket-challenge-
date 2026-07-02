import { describe, it, expect } from "vitest";
import { predictionSchema, usernameSchema } from "./validation";

describe("predictionSchema", () => {
  it("accepts a normal score", () => {
    const r = predictionSchema.safeParse({
      matchId: "m1",
      homeScore: 2,
      awayScore: 1,
      wentToPenalties: false,
    });
    expect(r.success).toBe(true);
  });

  it("coerces string scores from form data", () => {
    const r = predictionSchema.safeParse({
      matchId: "m1",
      homeScore: "3",
      awayScore: "0",
      wentToPenalties: "",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.homeScore).toBe(3);
      expect(r.data.wentToPenalties).toBe(false);
    }
  });

  it("rejects penalties when scores differ", () => {
    const r = predictionSchema.safeParse({
      matchId: "m1",
      homeScore: 2,
      awayScore: 1,
      wentToPenalties: true,
      penaltyWinnerTeamId: "A",
    });
    expect(r.success).toBe(false);
  });

  it("requires a shootout winner when penalties are set", () => {
    const r = predictionSchema.safeParse({
      matchId: "m1",
      homeScore: 1,
      awayScore: 1,
      wentToPenalties: true,
      penaltyWinnerTeamId: null,
    });
    expect(r.success).toBe(false);
  });

  it("accepts a valid penalty prediction", () => {
    const r = predictionSchema.safeParse({
      matchId: "m1",
      homeScore: 1,
      awayScore: 1,
      wentToPenalties: true,
      penaltyWinnerTeamId: "A",
    });
    expect(r.success).toBe(true);
  });

  it("rejects out-of-range and negative scores", () => {
    expect(
      predictionSchema.safeParse({ matchId: "m", homeScore: -1, awayScore: 0, wentToPenalties: false }).success,
    ).toBe(false);
    expect(
      predictionSchema.safeParse({ matchId: "m", homeScore: 99, awayScore: 0, wentToPenalties: false }).success,
    ).toBe(false);
  });
});

describe("usernameSchema", () => {
  it("accepts valid handles", () => {
    expect(usernameSchema.safeParse("Speedy_99").success).toBe(true);
  });
  it("rejects short, long, and illegal characters", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
    expect(usernameSchema.safeParse("x".repeat(21)).success).toBe(false);
    expect(usernameSchema.safeParse("has space").success).toBe(false);
    expect(usernameSchema.safeParse("emoji😀").success).toBe(false);
  });
  it("trims surrounding whitespace", () => {
    const r = usernameSchema.safeParse("  racer  ");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("racer");
  });
});
