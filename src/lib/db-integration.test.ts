import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import * as schema from "@/db/schema";
import { collectLeaderboard } from "@/lib/leaderboard-query";
import { buildBracket } from "@/lib/bracket";

/** Fresh in-memory D1-shaped DB built by applying every real migration in order. */
function makeDb() {
  const sqlite = new Database(":memory:");
  const dir = resolve("src/db/migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const f of files) {
    const sql = readFileSync(resolve(dir, f), "utf8").replaceAll(
      "--> statement-breakpoint",
      ";",
    );
    sqlite.exec(sql);
  }
  return drizzle(sqlite, { schema });
}

describe("DB integration: schema + leaderboard pipeline", () => {
  it("applies the migration and scores a real tournament end-to-end", async () => {
    const db = makeDb();
    const T = "t_int";

    await db.insert(schema.tournaments).values({
      id: T,
      name: "Integration Cup",
      status: "active",
      currentRound: "R16",
      picksDeadline: new Date(Date.now() + 86_400_000),
      createdAt: new Date(1000),
    });

    const teamIds = Array.from({ length: 16 }, (_, i) => `t${i + 1}`);
    for (let i = 0; i < 16; i++) {
      await db.insert(schema.teams).values({
        id: teamIds[i],
        tournamentId: T,
        name: `Team ${i + 1}`,
        seed: i + 1,
      });
    }

    // Real bracket wiring.
    let n = 0;
    const built = buildBracket(teamIds, 16, () => `m${n++}`);
    for (const m of built) {
      await db.insert(schema.matches).values({
        id: m.id,
        tournamentId: T,
        round: m.round,
        slot: m.slot,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        feedsIntoMatchId: m.feedsIntoMatchId,
        feedsIntoSide: m.feedsIntoSide,
      });
    }

    // Three players.
    const players = [
      { id: "u_alice", name: "Alice", handle: "alice", joined: 100 },
      { id: "u_bob", name: "Bob", handle: "bob", joined: 200 },
      { id: "u_carol", name: "Carol", handle: "carol", joined: 300 },
    ];
    for (const p of players) {
      await db.insert(schema.users).values({ id: p.id, name: p.name, email: `${p.handle}@x.com` });
      await db.insert(schema.profiles).values({
        userId: p.id,
        username: p.handle,
        mascotVariant: "red",
        createdAt: new Date(p.joined),
      });
      await db.insert(schema.memberships).values({
        userId: p.id,
        tournamentId: T,
        joinedAt: new Date(p.joined),
      });
    }

    // A non-member who somehow has a prediction must NOT appear on the board.
    await db.insert(schema.users).values({ id: "u_ghost", name: "Ghost", email: "ghost@x.com" });
    await db.insert(schema.profiles).values({ userId: "u_ghost", username: "ghost", mascotVariant: "red", createdAt: new Date(50) });

    const r16s0 = built.find((m) => m.round === "R16" && m.slot === 0)!;
    const qf0 = built.find((m) => m.round === "R8" && m.slot === 0)!;

    // Finalize an R16 match 2-1 (home wins), weight 1.
    await db
      .update(schema.matches)
      .set({ homeScore: 2, awayScore: 1, status: "final" })
      .where(eq(schema.matches.id, r16s0.id));

    // Finalize a QF match 3-0 (home wins), weight 2 — assign teams first.
    await db
      .update(schema.matches)
      .set({
        homeTeamId: "t1",
        awayTeamId: "t8",
        homeScore: 3,
        awayScore: 0,
        status: "final",
      })
      .where(eq(schema.matches.id, qf0.id));

    // Predictions.
    const preds = [
      // Alice: exact on both → R16 (5+5)*1=10, QF (5+5)*2=20 → 30
      { userId: "u_alice", matchId: r16s0.id, h: 2, a: 1 },
      { userId: "u_alice", matchId: qf0.id, h: 3, a: 0 },
      // Bob: R16 right winner, off by 1 goal → 5 + (3-1)=7
      { userId: "u_bob", matchId: r16s0.id, h: 3, a: 1 },
      // Carol: R16 wrong winner far → 0
      { userId: "u_carol", matchId: r16s0.id, h: 0, a: 3 },
      // Ghost (non-member): a perfect pick that must be ignored by the board.
      { userId: "u_ghost", matchId: r16s0.id, h: 2, a: 1 },
    ];
    for (const p of preds) {
      await db.insert(schema.predictions).values({
        userId: p.userId,
        matchId: p.matchId,
        homeScore: p.h,
        awayScore: p.a,
        updatedAt: new Date(),
      });
    }

    const lb = await collectLeaderboard(db, T);

    // Only members appear — ghost is excluded despite a perfect prediction.
    expect(lb.map((e) => e.username)).toEqual(["alice", "bob", "carol"]);
    expect(lb.some((e) => e.username === "ghost")).toBe(false);
    expect(lb[0].points).toBe(30);
    expect(lb[0].exactCount).toBe(2);
    expect(lb[0].rank).toBe(1);
    expect(lb[1].points).toBe(7);
    expect(lb[1].rank).toBe(2);
    expect(lb[2].points).toBe(0);
    expect(lb[2].rank).toBe(3);
  });

  it("enforces the unique (userId, matchId) prediction constraint", async () => {
    const db = makeDb();
    await db.insert(schema.tournaments).values({ id: "t2", name: "C", createdAt: new Date(1) });
    await db.insert(schema.matches).values({ id: "mm", tournamentId: "t2", round: "R16", slot: 0 });
    await db.insert(schema.users).values({ id: "uu", email: "u@x.com" });
    await db.insert(schema.predictions).values({ userId: "uu", matchId: "mm", homeScore: 1, awayScore: 0, updatedAt: new Date() });

    await expect(
      db.insert(schema.predictions).values({ userId: "uu", matchId: "mm", homeScore: 2, awayScore: 2, updatedAt: new Date() }),
    ).rejects.toThrow();
  });
});
