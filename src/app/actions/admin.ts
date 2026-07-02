"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  tournaments,
  teams,
  matches,
  punishments,
} from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { buildBracket, advancementFor, type MatchLike } from "@/lib/bracket";
import { isValidYouTubeUrl } from "@/lib/youtube";
import { revalidatePath } from "next/cache";

export type AdminResult = { ok: true; id?: string } | { ok: false; error: string };

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
/* Create a tournament with 16 teams and a fully-wired bracket.      */
/* ---------------------------------------------------------------- */
const createSchema = z.object({
  name: z.string().trim().min(1).max(60),
  teamNames: z.array(z.string().trim().min(1).max(40)).length(16),
  picksDeadline: z.number().int().nullable().optional(),
});

export async function createTournament(input: unknown): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a name and exactly 16 team names." };
  }
  const { name, teamNames, picksDeadline } = parsed.data;

  const db = getDb();
  const tournamentId = crypto.randomUUID();

  // Any previously-active tournament becomes archived (only one active).
  await db
    .update(tournaments)
    .set({ status: "complete" })
    .where(eq(tournaments.status, "active"));

  await db.insert(tournaments).values({
    id: tournamentId,
    name,
    status: "active",
    currentRound: "R16",
    picksDeadline: picksDeadline != null ? new Date(picksDeadline) : null,
  });

  // Teams, seeded 1..16 in the order provided.
  const teamIds: string[] = [];
  for (let i = 0; i < 16; i++) {
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

  // Bracket matches (R16 seeded, later rounds empty), winner-wiring included.
  const built = buildBracket(teamIds);
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
  return { ok: true, id: tournamentId };
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
  } else if (match.round === "FINAL" && winnerId) {
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
