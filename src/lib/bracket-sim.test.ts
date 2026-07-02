import { describe, it, expect } from "vitest";
import { buildBracket, advancementFor, championOf, type MatchLike } from "./bracket";
import { ROUNDS } from "./bracket";

const seedOf = (teamId: string) => Number(teamId.slice(1));

/**
 * Simulate an entire 16-team tournament where the lower seed number always wins.
 * Verifies bracket wiring end-to-end: every match fills, and seed 1 is champion.
 */
describe("full bracket simulation", () => {
  it("advances winners round-by-round to a single champion", () => {
    const teams = Array.from({ length: 16 }, (_, i) => `t${i + 1}`);
    let n = 0;
    const built = buildBracket(teams, () => `m${n++}`);

    const byId = new Map<string, MatchLike>(
      built.map((m) => [
        m.id,
        {
          ...m,
          homeScore: null,
          awayScore: null,
          wentToPenalties: false,
          penaltyWinnerTeamId: null,
          status: "scheduled" as const,
        },
      ]),
    );

    for (const round of ROUNDS) {
      const roundMatches = [...byId.values()].filter((m) => m.round === round);
      for (const m of roundMatches) {
        expect(m.homeTeamId).not.toBeNull();
        expect(m.awayTeamId).not.toBeNull();
        // Lower seed wins 2-0.
        const homeWins = seedOf(m.homeTeamId!) < seedOf(m.awayTeamId!);
        m.homeScore = homeWins ? 2 : 0;
        m.awayScore = homeWins ? 0 : 2;
        m.status = "final";

        const adv = advancementFor(m);
        if (adv) {
          const next = byId.get(adv.matchId)!;
          if (adv.side === "home") next.homeTeamId = adv.teamId;
          else next.awayTeamId = adv.teamId;
        }
      }
    }

    expect(championOf(byId)).toBe("t1");

    // Runner-up path check: seed 2 should reach the final (loses to seed 1).
    const final = [...byId.values()].find((m) => m.round === "FINAL")!;
    const finalists = [final.homeTeamId, final.awayTeamId].map((t) => seedOf(t!));
    expect(finalists).toContain(1);
    expect(finalists).toContain(2);
  });

  it("advances the penalty-shootout winner on a drawn match", () => {
    const teams = Array.from({ length: 16 }, (_, i) => `t${i + 1}`);
    let n = 0;
    const built = buildBracket(teams, () => `m${n++}`);
    const r16 = built.find((m) => m.round === "R16" && m.slot === 0)!;
    const match: MatchLike = {
      ...r16,
      homeScore: 1,
      awayScore: 1,
      wentToPenalties: true,
      penaltyWinnerTeamId: r16.awayTeamId,
      status: "final",
    };
    const adv = advancementFor(match);
    expect(adv?.teamId).toBe(r16.awayTeamId);
    expect(adv?.side).toBe("home"); // slot 0 feeds home side of QF 0
  });
});
