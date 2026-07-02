import { getDb } from "@/db";
import {
  tournaments,
  teams,
  matches,
  predictions,
  profiles,
  punishments,
  users,
  type Tournament,
  type Team,
  type Match,
  type Prediction,
  type Punishment,
} from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { LeaderboardEntry } from "@/lib/scoring";
import { collectLeaderboard } from "@/lib/leaderboard-query";

/** The tournament the app is currently showing (active first, else newest). */
export async function getActiveTournament(): Promise<Tournament | null> {
  const db = getDb();
  const active = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, "active"))
    .limit(1);
  if (active[0]) return active[0];
  const latest = await db
    .select()
    .from(tournaments)
    .orderBy(desc(tournaments.createdAt))
    .limit(1);
  return latest[0] ?? null;
}

export interface BracketData {
  tournament: Tournament;
  teams: Team[];
  teamsById: Map<string, Team>;
  matches: Match[];
}

export async function getBracketData(
  tournamentId: string,
): Promise<Omit<BracketData, "tournament">> {
  const db = getDb();
  const [teamRows, matchRows] = await Promise.all([
    db.select().from(teams).where(eq(teams.tournamentId, tournamentId)),
    db.select().from(matches).where(eq(matches.tournamentId, tournamentId)),
  ]);
  const teamsById = new Map(teamRows.map((t) => [t.id, t]));
  // Stable order for layout: by round then slot handled at render time.
  return { teams: teamRows, teamsById, matches: matchRows };
}

/** A user's predictions for a tournament, keyed by matchId. */
export async function getUserPredictions(
  userId: string,
  tournamentId: string,
): Promise<Map<string, Prediction>> {
  const db = getDb();
  const matchIds = (
    await db
      .select({ id: matches.id })
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
  ).map((m) => m.id);
  if (matchIds.length === 0) return new Map();
  const rows = await db
    .select()
    .from(predictions)
    .where(
      and(
        eq(predictions.userId, userId),
        inArray(predictions.matchId, matchIds),
      ),
    );
  return new Map(rows.map((p) => [p.matchId, p]));
}

/** Have picks locked globally (deadline passed)? */
export function picksDeadlinePassed(t: Tournament): boolean {
  return t.picksDeadline != null && t.picksDeadline.getTime() <= Date.now();
}

/** A single match is locked when the deadline passed or it already kicked off. */
export function isMatchLocked(t: Tournament, m: Match): boolean {
  return picksDeadlinePassed(t) || m.status !== "scheduled";
}

/** Build the ranked leaderboard from finalized matches. */
export async function getLeaderboard(
  tournamentId: string,
): Promise<LeaderboardEntry[]> {
  return collectLeaderboard(getDb(), tournamentId);
}

export async function getPunishments(
  tournamentId: string,
): Promise<Punishment[]> {
  const db = getDb();
  return db
    .select()
    .from(punishments)
    .where(eq(punishments.tournamentId, tournamentId));
}

/** Admin view: players with their real identity (name/email) + counts. */
export interface Signup {
  userId: string;
  username: string;
  mascotVariant: string;
  name: string | null;
  email: string | null;
  joinedAt: Date;
}

export async function getSignups(): Promise<Signup[]> {
  const db = getDb();
  const rows = await db
    .select({
      userId: profiles.userId,
      username: profiles.username,
      mascotVariant: profiles.mascotVariant,
      createdAt: profiles.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .orderBy(desc(profiles.createdAt));
  return rows.map((r) => ({
    userId: r.userId,
    username: r.username,
    mascotVariant: r.mascotVariant,
    name: r.name,
    email: r.email,
    joinedAt: r.createdAt,
  }));
}

/** Is this username taken by someone other than `exceptUserId`? */
export async function usernameTaken(
  username: string,
  exceptUserId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);
  return rows.length > 0 && rows[0].userId !== exceptUserId;
}
