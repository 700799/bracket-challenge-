import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { and, eq, inArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import { matches, predictions, profiles, memberships, tournaments } from "@/db/schema";
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

export interface TournamentScoring {
  entries: LeaderboardEntry[];
  scored: ScoredPrediction[];
  bracketSize: number;
}

/** Leaderboard entries only (thin wrapper over {@link collectScoring}). */
export async function collectLeaderboard(
  db: AnyDb,
  tournamentId: string,
): Promise<LeaderboardEntry[]> {
  return (await collectScoring(db, tournamentId)).entries;
}

/**
 * Collect every scored prediction over finalized matches and build the ranked
 * leaderboard, returning both the entries and the raw scored predictions (for
 * stats). Driver-agnostic so it can be unit-tested against a real SQLite db.
 * Members-only.
 */
export async function collectScoring(
  db: AnyDb,
  tournamentId: string,
): Promise<TournamentScoring> {
  const tourRows = await db
    .select({ bracketSize: tournaments.bracketSize })
    .from(tournaments)
    .where(eq(tournaments.id, tournamentId))
    .limit(1);
  const bracketSize = tourRows[0]?.bracketSize ?? 16;

  // Only members of this tournament appear on its leaderboard. Join time is the
  // membership time (tiebreak), falling back to profile creation.
  const playerRows = await db
    .select({
      userId: profiles.userId,
      username: profiles.username,
      mascotVariant: profiles.mascotVariant,
      joinedAt: memberships.joinedAt,
    })
    .from(memberships)
    .innerJoin(profiles, eq(profiles.userId, memberships.userId))
    .where(eq(memberships.tournamentId, tournamentId));
  const players: PlayerMeta[] = playerRows.map((p) => ({
    userId: p.userId,
    username: p.username,
    mascotVariant: p.mascotVariant,
    joinedAt: p.joinedAt.getTime(),
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

  return {
    entries: buildLeaderboard(players, scored, bracketSize),
    scored,
    bracketSize,
  };
}
