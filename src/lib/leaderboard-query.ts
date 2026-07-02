import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { and, eq, inArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import { matches, predictions, profiles } from "@/db/schema";
import {
  buildLeaderboard,
  type LeaderboardEntry,
  type MatchResult,
  type PlayerMeta,
  type ScoredPrediction,
} from "@/lib/scoring";

/** Any SQLite Drizzle db bound to our schema (D1 in prod, better-sqlite3 in tests). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDb = BaseSQLiteDatabase<any, any, typeof schema>;

/**
 * Collect every scored prediction over finalized matches and build the ranked
 * leaderboard. Driver-agnostic so it can be unit-tested against a real SQLite db.
 */
export async function collectLeaderboard(
  db: AnyDb,
  tournamentId: string,
): Promise<LeaderboardEntry[]> {
  const playerRows = await db
    .select({
      userId: profiles.userId,
      username: profiles.username,
      mascotVariant: profiles.mascotVariant,
      createdAt: profiles.createdAt,
    })
    .from(profiles);
  const players: PlayerMeta[] = playerRows.map((p) => ({
    userId: p.userId,
    username: p.username,
    mascotVariant: p.mascotVariant,
    joinedAt: p.createdAt.getTime(),
  }));

  const finalMatches = await db
    .select()
    .from(matches)
    .where(
      and(eq(matches.tournamentId, tournamentId), eq(matches.status, "final")),
    );

  const scored: ScoredPrediction[] = [];
  if (finalMatches.length > 0) {
    const matchById = new Map(finalMatches.map((m) => [m.id, m]));
    const preds = await db
      .select()
      .from(predictions)
      .where(
        inArray(
          predictions.matchId,
          finalMatches.map((m) => m.id),
        ),
      );
    for (const p of preds) {
      const m = matchById.get(p.matchId);
      if (!m || m.homeTeamId == null || m.awayTeamId == null) continue;
      const result: MatchResult = {
        round: m.round,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeScore: m.homeScore ?? 0,
        awayScore: m.awayScore ?? 0,
        wentToPenalties: m.wentToPenalties,
        penaltyWinnerTeamId: m.penaltyWinnerTeamId,
      };
      scored.push({
        userId: p.userId,
        result,
        prediction: {
          homeScore: p.homeScore,
          awayScore: p.awayScore,
          wentToPenalties: p.wentToPenalties,
          penaltyWinnerTeamId: p.penaltyWinnerTeamId,
        },
      });
    }
  }

  return buildLeaderboard(players, scored);
}
