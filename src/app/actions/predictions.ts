"use server";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { matches, predictions, profiles, tournaments, memberships } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { isMatchLocked } from "@/lib/queries";
import { predictionSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export type PredictionResult = { ok: true } | { ok: false; error: string };

export async function submitPrediction(
  input: unknown,
): Promise<PredictionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to make picks." };

  const parsed = predictionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid pick." };
  }
  const data = parsed.data;

  const db = getDb();

  // Username is required before making picks.
  const profile = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (!profile[0]) {
    return { ok: false, error: "Choose a username first (My Hero)." };
  }

  const matchRows = await db
    .select()
    .from(matches)
    .where(eq(matches.id, data.matchId))
    .limit(1);
  const match = matchRows[0];
  if (!match) return { ok: false, error: "Match not found." };

  const tourRows = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.id, match.tournamentId))
    .limit(1);
  const tournament = tourRows[0];
  if (!tournament) return { ok: false, error: "Tournament not found." };

  // Must be a member of this tournament to make picks in it.
  const member = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, user.id),
        eq(memberships.tournamentId, tournament.id),
      ),
    )
    .limit(1);
  if (!member[0]) {
    return { ok: false, error: "Join this tournament to make picks." };
  }

  if (isMatchLocked(tournament, match)) {
    return { ok: false, error: "Picks are locked for this match." };
  }

  // Penalty winner must be one of the two teams (when the teams are known).
  const penaltyWinner = data.wentToPenalties
    ? (data.penaltyWinnerTeamId ?? null)
    : null;
  if (
    penaltyWinner &&
    match.homeTeamId &&
    match.awayTeamId &&
    penaltyWinner !== match.homeTeamId &&
    penaltyWinner !== match.awayTeamId
  ) {
    return { ok: false, error: "Penalty winner must be one of the two teams." };
  }

  await db
    .insert(predictions)
    .values({
      userId: user.id,
      matchId: data.matchId,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      wentToPenalties: data.wentToPenalties,
      penaltyWinnerTeamId: penaltyWinner,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [predictions.userId, predictions.matchId],
      set: {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        wentToPenalties: data.wentToPenalties,
        penaltyWinnerTeamId: penaltyWinner,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/");
  return { ok: true };
}
