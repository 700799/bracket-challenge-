import { getDb } from "@/db";
import {
  tournaments,
  teams,
  matches,
  predictions,
  profiles,
  punishments,
  users,
  memberships,
  announcements,
  type Tournament,
  type Team,
  type Match,
  type Prediction,
  type Punishment,
  type Announcement,
} from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { LeaderboardEntry } from "@/lib/scoring";
import {
  collectLeaderboard,
  collectScoring,
  type TournamentScoring,
} from "@/lib/leaderboard-query";

/** The public default tournament: featured & visible → else newest visible. */
export async function getFeaturedTournament(): Promise<Tournament | null> {
  const db = getDb();
  const featured = await db
    .select()
    .from(tournaments)
    .where(and(eq(tournaments.featured, true), eq(tournaments.visible, true)))
    .limit(1);
  if (featured[0]) return featured[0];
  const pool = await db
    .select()
    .from(tournaments)
    .where(and(eq(tournaments.isGeneralPool, true), eq(tournaments.visible, true)))
    .limit(1);
  if (pool[0]) return pool[0];
  const latest = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.visible, true))
    .orderBy(desc(tournaments.createdAt))
    .limit(1);
  return latest[0] ?? null;
}

/** Tournaments shown in the public switcher. */
export async function getVisibleTournaments(): Promise<Tournament[]> {
  const db = getDb();
  return db
    .select()
    .from(tournaments)
    .where(eq(tournaments.visible, true))
    .orderBy(desc(tournaments.featured), desc(tournaments.createdAt));
}

/** Every tournament (admin only). */
export async function getAllTournaments(): Promise<Tournament[]> {
  const db = getDb();
  return db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
}

/** Member counts per tournament (admin list). */
export async function getMemberCounts(): Promise<Map<string, number>> {
  const db = getDb();
  const rows = await db
    .select({
      tournamentId: memberships.tournamentId,
      count: sql<number>`count(*)`,
    })
    .from(memberships)
    .groupBy(memberships.tournamentId);
  return new Map(rows.map((r) => [r.tournamentId, Number(r.count)]));
}

export async function getTournamentById(
  id: string,
): Promise<Tournament | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** The set of tournament ids a user has joined. */
export async function getUserMembershipIds(
  userId: string,
): Promise<Set<string>> {
  const db = getDb();
  const rows = await db
    .select({ tournamentId: memberships.tournamentId })
    .from(memberships)
    .where(eq(memberships.userId, userId));
  return new Set(rows.map((r) => r.tournamentId));
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

/** Build the ranked leaderboard from finalized matches (members only). */
export async function getLeaderboard(
  tournamentId: string,
): Promise<LeaderboardEntry[]> {
  return collectLeaderboard(getDb(), tournamentId);
}

/** Leaderboard entries + raw scored predictions (for the stats section). */
export async function getScoring(
  tournamentId: string,
): Promise<TournamentScoring> {
  return collectScoring(getDb(), tournamentId);
}

/** Announcements for a tournament, newest first. */
export async function getAnnouncements(
  tournamentId: string,
): Promise<Announcement[]> {
  const db = getDb();
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.tournamentId, tournamentId))
    .orderBy(desc(announcements.createdAt));
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

/** Members of a tournament with their real identity (admin only). */
export async function getSignups(tournamentId: string): Promise<Signup[]> {
  const db = getDb();
  const rows = await db
    .select({
      userId: profiles.userId,
      username: profiles.username,
      mascotVariant: profiles.mascotVariant,
      joinedAt: memberships.joinedAt,
      name: users.name,
      email: users.email,
    })
    .from(memberships)
    .innerJoin(profiles, eq(profiles.userId, memberships.userId))
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.tournamentId, tournamentId))
    .orderBy(desc(memberships.joinedAt));
  return rows.map((r) => ({
    userId: r.userId,
    username: r.username,
    mascotVariant: r.mascotVariant,
    name: r.name,
    email: r.email,
    joinedAt: r.joinedAt,
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
