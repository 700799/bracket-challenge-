import { describe, it, expect } from "vitest";
import { resolvePunishmentTargets, punishmentsForUser } from "./punishments";
import type { LeaderboardEntry } from "./scoring";

function entry(userId: string, rank: number): LeaderboardEntry {
  return {
    userId,
    username: userId,
    mascotVariant: "red",
    points: 100 - rank,
    exactCount: 0,
    correctWinners: 0,
    joinedAt: rank,
    rank,
  };
}

const board: LeaderboardEntry[] = [
  entry("u1", 1),
  entry("u2", 2),
  entry("u3", 3),
  entry("u4", 4),
  entry("u5", 5),
];

describe("resolvePunishmentTargets", () => {
  it("maps 'from last' to the correct player", () => {
    const [last, fourthFromLast] = resolvePunishmentTargets(board, [
      { id: "p1", fromBottom: 1, absoluteRank: null, youtubeUrl: "y", label: null },
      { id: "p2", fromBottom: 4, absoluteRank: null, youtubeUrl: "y", label: null },
    ]);
    expect(last.entry?.userId).toBe("u5"); // last place
    expect(last.slotLabel).toBe("Last place");
    expect(fourthFromLast.entry?.userId).toBe("u2"); // 5 - 4 = index 1
    expect(fourthFromLast.slotLabel).toBe("4th from last");
  });

  it("maps absolute rank from the top", () => {
    const [first] = resolvePunishmentTargets(board, [
      { id: "p", fromBottom: null, absoluteRank: 1, youtubeUrl: "y", label: null },
    ]);
    expect(first.entry?.userId).toBe("u1");
    expect(first.slotLabel).toBe("1st place");
  });

  it("returns null entry when the spot is out of range", () => {
    const [r] = resolvePunishmentTargets(board, [
      { id: "p", fromBottom: 99, absoluteRank: null, youtubeUrl: "y", label: null },
    ]);
    expect(r.entry).toBeNull();
  });

  it("handles an empty leaderboard", () => {
    const [r] = resolvePunishmentTargets([], [
      { id: "p", fromBottom: 1, absoluteRank: null, youtubeUrl: "y", label: null },
    ]);
    expect(r.entry).toBeNull();
  });
});

describe("punishmentsForUser", () => {
  it("filters resolved punishments to a user", () => {
    const resolved = resolvePunishmentTargets(board, [
      { id: "p1", fromBottom: 1, absoluteRank: null, youtubeUrl: "y", label: null }, // u5
      { id: "p2", fromBottom: null, absoluteRank: 1, youtubeUrl: "y", label: null }, // u1
    ]);
    expect(punishmentsForUser(resolved, "u5").map((r) => r.punishment.id)).toEqual(["p1"]);
    expect(punishmentsForUser(resolved, "u1").map((r) => r.punishment.id)).toEqual(["p2"]);
    expect(punishmentsForUser(resolved, "u3")).toHaveLength(0);
  });
});
