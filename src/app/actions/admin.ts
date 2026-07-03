"use server";

import { z } from "zod";
import { eq, ne } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import {
  tournaments,
  teams,
  matches,
  punishments,
  memberships,
  announcements,
  users,
} from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import {
  buildBracket,
  advancementFor,
  isSupportedSize,
  roundsForSize,
  FINAL_ROUND,
  SUPPORTED_SIZES,
  type MatchLike,
} from "@/lib/bracket";
import { isValidYouTubeUrl } from "@/lib/youtube";
import { generateCode } from "@/lib/code";
import { sendBulkEmail } from "@/lib/email";
import { fetchTeamsFromUrl } from "@/lib/import";
import {
  fetchApiSportsTeams,
  worldCupSampleTeams,
} from "@/lib/apisports";
import { revalidatePath } from "next/cache";

export type ImportResult =
  | { ok: true; teams: string[] }
  | { ok: false; error: string };

export type AdminResult =
  | { ok: true; id?: string; code?: string; emailed?: number }
  | { ok: false; error: string };

const TEAM_COLORS = ["#E5322D", "#1B4DE4", "#33C14E", "#F5C518", "#7A3CF0"];

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in required." };
  if (!user.isAdmin) return { ok: false, error: "Admins only." };
  return { ok: true };
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin");
}

/* ---------------------------------------------------------------- */
/* Create a tournament of any supported size with a wired bracket.   */
/* ---------------------------------------------------------------- */
const createSchema = z.object({
  name: z.string().trim().min(1).max(60),
  teamNames: z.array(z.string().trim().min(1).max(40)).min(8).max(64),
  picksDeadline: z.number().int().nullable().optional(),
  joinPolicy: z.enum(["open", "code"]).optional(),
});

export async function createTournament(input: unknown): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a name and team list." };
  }
  const { name, teamNames, picksDeadline, joinPolicy } = parsed.data;

  const size = teamNames.length;
  if (!isSupportedSize(size)) {
    return {
      ok: false,
      error: `Need exactly ${SUPPORTED_SIZES.join(", ")} teams — got ${size}.`,
    };
  }

  const db = getDb();
  const tournamentId = crypto.randomUUID();

  // Feature this one only if nothing is featured yet (keeps a public default).
  const featuredRows = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.featured, true))
    .limit(1);
  const featured = featuredRows.length === 0;

  const usesCode = joinPolicy === "code";
  const code = usesCode ? await freshCode(db) : null;

  await db.insert(tournaments).values({
    id: tournamentId,
    name,
    status: "active",
    bracketSize: size,
    currentRound: roundsForSize(size)[0],
    picksDeadline: picksDeadline != null ? new Date(picksDeadline) : null,
    visible: true,
    featured,
    joinPolicy: usesCode ? "code" : "open",
    joinCode: code,
  });

  const teamIds: string[] = [];
  for (let i = 0; i < size; i++) {
    const id = crypto.randomUUID();
    teamIds.push(id);
    await db.insert(teams).values({
      id,
      tournamentId,
      name: teamNames[i],
      seed: i + 1,
      colorHint: TEAM_COLORS[i % TEAM_COLORS.length],
    });
  }

  const built = buildBracket(teamIds, size);
  for (const m of built) {
    await db.insert(matches).values({
      id: m.id,
      tournamentId,
      round: m.round,
      slot: m.slot,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      feedsIntoMatchId: m.feedsIntoMatchId,
      feedsIntoSide: m.feedsIntoSide,
    });
  }

  revalidateAll();
  return { ok: true, id: tournamentId, code: code ?? undefined };
}

/** Fetch a team list from an external URL (admin-gated; SSRF-guarded). */
export async function importFromUrl(url: string): Promise<ImportResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  try {
    const { teams } = await fetchTeamsFromUrl(url);
    return { ok: true, teams: teams.map((t) => t.name) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Import failed." };
  }
}

/** Import teams from api-sports.io (API-Football). Requires APISPORTS_KEY. */
export async function importFromApiSports(input: {
  leagueId: number;
  season: number;
  round?: string | null;
}): Promise<ImportResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  try {
    const { env } = getCloudflareContext();
    const teams = await fetchApiSportsTeams(env, {
      leagueId: input.leagueId,
      season: input.season,
      round: input.round ?? undefined,
    });
    return { ok: true, teams: teams.map((t) => t.name) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Import failed." };
  }
}

/** Load the bundled 2022 World Cup Round-of-16 sample (no key needed). */
export async function importWorldCupSample(): Promise<ImportResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  return { ok: true, teams: worldCupSampleTeams().map((t) => t.name) };
}

/** Clone a tournament's teams + size into a brand new tournament. */
export async function cloneTournament(input: {
  sourceId: string;
  name?: string;
}): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const db = getDb();

  const src = (
    await db.select().from(tournaments).where(eq(tournaments.id, input.sourceId)).limit(1)
  )[0];
  if (!src) return { ok: false, error: "Source tournament not found." };

  const srcTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.tournamentId, src.id));
  const ordered = srcTeams.sort((a, b) => a.seed - b.seed).map((t) => t.name);

  return createTournament({
    name: input.name?.trim() || `${src.name} (copy)`,
    teamNames: ordered,
    joinPolicy: "open",
  });
}

/* ---------------------------------------------------------------- */
/* Update tournament settings (name / deadline / status).           */
/* ---------------------------------------------------------------- */
const settingsSchema = z.object({
  tournamentId: z.string().min(1),
  name: z.string().trim().min(1).max(60).optional(),
  picksDeadline: z.number().int().nullable().optional(),
  status: z.enum(["setup", "active", "complete"]).optional(),
});

export async function updateTournamentSettings(
  input: unknown,
): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid settings." };
  const { tournamentId, name, picksDeadline, status } = parsed.data;

  const db = getDb();
  const set: Record<string, unknown> = {};
  if (name !== undefined) set.name = name;
  if (status !== undefined) set.status = status;
  if (picksDeadline !== undefined)
    set.picksDeadline = picksDeadline != null ? new Date(picksDeadline) : null;
  if (Object.keys(set).length === 0) return { ok: true };

  await db.update(tournaments).set(set).where(eq(tournaments.id, tournamentId));
  revalidateAll();
  return { ok: true };
}

export async function renameTeam(input: {
  teamId: string;
  name: string;
}): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const name = z.string().trim().min(1).max(40).safeParse(input.name);
  if (!name.success) return { ok: false, error: "Invalid team name." };
  const db = getDb();
  await db.update(teams).set({ name: name.data }).where(eq(teams.id, input.teamId));
  revalidateAll();
  return { ok: true };
}

/* ---------------------------------------------------------------- */
/* Record a match result → finalize + advance the winner.           */
/* ---------------------------------------------------------------- */
const resultSchema = z
  .object({
    matchId: z.string().min(1),
    homeScore: z.number().int().min(0).max(30),
    awayScore: z.number().int().min(0).max(30),
    wentToPenalties: z.boolean(),
    penaltyWinnerTeamId: z.string().nullable().optional(),
  })
  .refine((v) => v.homeScore !== v.awayScore || v.wentToPenalties, {
    message: "A knockout match can't end level — record penalties.",
    path: ["wentToPenalties"],
  })
  .refine((v) => !v.wentToPenalties || !!v.penaltyWinnerTeamId, {
    message: "Pick the shootout winner.",
    path: ["penaltyWinnerTeamId"],
  });

export async function recordResult(input: unknown): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const parsed = resultSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid result." };
  }
  const data = parsed.data;

  const db = getDb();
  const rows = await db.select().from(matches).where(eq(matches.id, data.matchId)).limit(1);
  const match = rows[0];
  if (!match) return { ok: false, error: "Match not found." };
  if (!match.homeTeamId || !match.awayTeamId) {
    return { ok: false, error: "Both teams must be set before recording a result." };
  }

  const penaltyWinner = data.wentToPenalties ? (data.penaltyWinnerTeamId ?? null) : null;
  if (
    penaltyWinner &&
    penaltyWinner !== match.homeTeamId &&
    penaltyWinner !== match.awayTeamId
  ) {
    return { ok: false, error: "Shootout winner must be one of the two teams." };
  }

  await db
    .update(matches)
    .set({
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      wentToPenalties: data.wentToPenalties,
      penaltyWinnerTeamId: penaltyWinner,
      status: "final",
    })
    .where(eq(matches.id, match.id));

  const finalized: MatchLike = {
    ...match,
    homeScore: data.homeScore,
    awayScore: data.awayScore,
    wentToPenalties: data.wentToPenalties,
    penaltyWinnerTeamId: penaltyWinner,
    status: "final",
  };

  const winnerId =
    finalized.homeScore! > finalized.awayScore!
      ? match.homeTeamId
      : finalized.awayScore! > finalized.homeScore!
        ? match.awayTeamId
        : penaltyWinner;
  const loserId = winnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;

  // Eliminate the loser, keep winner alive.
  if (loserId) await db.update(teams).set({ eliminated: true }).where(eq(teams.id, loserId));
  if (winnerId) await db.update(teams).set({ eliminated: false }).where(eq(teams.id, winnerId));

  // Advance the winner into the next round (or crown the champion).
  const adv = advancementFor(finalized);
  if (adv) {
    await db
      .update(matches)
      .set(adv.side === "home" ? { homeTeamId: adv.teamId } : { awayTeamId: adv.teamId })
      .where(eq(matches.id, adv.matchId));
  } else if (match.round === FINAL_ROUND && winnerId) {
    await db
      .update(tournaments)
      .set({ championTeamId: winnerId, status: "complete" })
      .where(eq(tournaments.id, match.tournamentId));
  }

  revalidateAll();
  return { ok: true };
}

/* ---------------------------------------------------------------- */
/* Punishments.                                                      */
/* ---------------------------------------------------------------- */
const punishmentSchema = z
  .object({
    tournamentId: z.string().min(1),
    mode: z.enum(["fromBottom", "absolute"]),
    value: z.number().int().min(1).max(64),
    youtubeUrl: z.string().min(1),
    label: z.string().trim().max(60).optional(),
  })
  .refine((v) => isValidYouTubeUrl(v.youtubeUrl), {
    message: "Enter a valid YouTube link.",
    path: ["youtubeUrl"],
  });

export async function createPunishment(input: unknown): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const parsed = punishmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid punishment." };
  }
  const { tournamentId, mode, value, youtubeUrl, label } = parsed.data;

  const db = getDb();
  await db.insert(punishments).values({
    tournamentId,
    fromBottom: mode === "fromBottom" ? value : null,
    absoluteRank: mode === "absolute" ? value : null,
    youtubeUrl,
    label: label || null,
  });
  revalidateAll();
  return { ok: true };
}

export async function deletePunishment(input: { id: string }): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const db = getDb();
  await db.delete(punishments).where(eq(punishments.id, input.id));
  revalidateAll();
  return { ok: true };
}

/* ---------------------------------------------------------------- */
/* Visibility, featuring & join codes.                              */
/* ---------------------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function freshCode(db: any): Promise<string> {
  for (let i = 0; i < 12; i++) {
    const code = generateCode();
    const clash = await db
      .select({ id: tournaments.id })
      .from(tournaments)
      .where(eq(tournaments.joinCode, code))
      .limit(1);
    if (clash.length === 0) return code;
  }
  return generateCode(undefined, 6);
}

export async function setTournamentVisibility(input: {
  tournamentId: string;
  visible: boolean;
}): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const db = getDb();
  await db
    .update(tournaments)
    .set({ visible: input.visible })
    .where(eq(tournaments.id, input.tournamentId));
  revalidateAll();
  return { ok: true };
}

/** Feature exactly one tournament (the public home default). */
export async function setFeatured(input: {
  tournamentId: string;
}): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const db = getDb();
  await db
    .update(tournaments)
    .set({ featured: false })
    .where(ne(tournaments.id, input.tournamentId));
  await db
    .update(tournaments)
    .set({ featured: true, visible: true })
    .where(eq(tournaments.id, input.tournamentId));
  revalidateAll();
  return { ok: true };
}

/** Generate (or regenerate) a join code and switch the tournament to code-join. */
export async function generateJoinCode(input: {
  tournamentId: string;
}): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const db = getDb();
  const code = await freshCode(db);
  await db
    .update(tournaments)
    .set({ joinCode: code, joinPolicy: "code" })
    .where(eq(tournaments.id, input.tournamentId));
  revalidateAll();
  return { ok: true, code };
}

export async function setJoinPolicy(input: {
  tournamentId: string;
  joinPolicy: "open" | "code";
}): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const db = getDb();
  if (input.joinPolicy === "code") {
    const t = (
      await db.select().from(tournaments).where(eq(tournaments.id, input.tournamentId)).limit(1)
    )[0];
    const code = t?.joinCode ?? (await freshCode(db));
    await db
      .update(tournaments)
      .set({ joinPolicy: "code", joinCode: code })
      .where(eq(tournaments.id, input.tournamentId));
    return { ok: true, code };
  }
  await db
    .update(tournaments)
    .set({ joinPolicy: "open" })
    .where(eq(tournaments.id, input.tournamentId));
  revalidateAll();
  return { ok: true };
}

/* ---------------------------------------------------------------- */
/* Announcements (optionally emailed to members).                   */
/* ---------------------------------------------------------------- */
const announceSchema = z.object({
  tournamentId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
  sendEmail: z.boolean().optional(),
});

export async function postAnnouncement(input: unknown): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const parsed = announceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Write a message first." };
  const { tournamentId, body, sendEmail } = parsed.data;

  const db = getDb();
  const tour = (
    await db.select().from(tournaments).where(eq(tournaments.id, tournamentId)).limit(1)
  )[0];
  if (!tour) return { ok: false, error: "Tournament not found." };

  let emailed = 0;
  if (sendEmail) {
    const rows = await db
      .select({ email: users.email })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.tournamentId, tournamentId));
    const recipients = rows
      .map((r) => r.email)
      .filter((e): e is string => !!e);
    const { env } = getCloudflareContext();
    emailed = await sendBulkEmail(env, {
      recipients,
      subject: `📣 ${tour.name}`,
      text: body,
    });
  }

  await db.insert(announcements).values({ tournamentId, body, emailedCount: emailed });
  revalidateAll();
  return { ok: true, emailed };
}
