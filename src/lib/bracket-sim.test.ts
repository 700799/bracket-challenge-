import { describe, it, expect } from "vitest";
import {
  buildBracket,
  advancementFor,
  championOf,
  roundsForSize,
  type MatchLike,
} from "./bracket";

const seedOf = (teamId: string) => Number(teamId.slice(1));

/**
 * Simulate an entire tournament where the lower seed number always wins.
 * Verifies bracket wiring end-to-end for every supported size: all matches
 * fill and seed 1 is champion, with seed 2 reaching the final.
 */
describe("full bracket simulation", () => {
  it.each([8, 16, 32, 64])("size %i advances to a single champion", (size) => {
    const teams = Array.from({ length: size }, (_, i) => `t${i + 1}`);
    let n = 0;
    const built = buildBracket(teams, size, () => `m${n++}`);

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

    for (const round of roundsForSize(size)) {
      for (const m of [...byId.values()].filter((x) => x.round === round)) {
        expect(m.homeTeamId).not.toBeNull();
        expect(m.awayTeamId).not.toBeNull();
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
    const final = [...byId.values()].find((m) => m.round === "R2")!;
    const finalists = [final.homeTeamId, final.awayTeamId].map((t) => seedOf(t!));
    expect(finalists).toContain(1);
    expect(finalists).toContain(2);
  });

  it("advances the penalty-shootout winner on a drawn match", () => {
    const teams = Array.from({ length: 16 }, (_, i) => `t${i + 1}`);
    let n = 0;
    const built = buildBracket(teams, 16, () => `m${n++}`);
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
    expect(adv?.side).toBe("home"); // slot 0 feeds home side of R8 slot 0
  });
});
