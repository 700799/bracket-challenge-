"use server";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { tournaments, memberships, profiles } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { normalizeCode } from "@/lib/code";
import { revalidatePath } from "next/cache";

export type JoinResult =
  | { ok: true; tournamentId: string; name: string }
  | { ok: false; error: string };

async function requirePlayer(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to join." };
  const db = getDb();
  const p = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (!p[0]) return { ok: false, error: "Choose a username first (My Hero)." };
  return { ok: true, userId: user.id };
}

async function addMember(userId: string, tournamentId: string) {
  const db = getDb();
  await db
    .insert(memberships)
    .values({ userId, tournamentId })
    .onConflictDoNothing({
      target: [memberships.userId, memberships.tournamentId],
    });
  revalidatePath("/");
}

/** Join a tournament with an admin-provided code (any join policy). */
export async function joinByCode(code: string): Promise<JoinResult> {
  const gate = await requirePlayer();
  if (!gate.ok) return gate;

  const normalized = normalizeCode(code);
  if (!normalized) return { ok: false, error: "Enter a code." };

  const db = getDb();
  const t = (
    await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.joinCode, normalized))
      .limit(1)
  )[0];
  if (!t) return { ok: false, error: "No tournament matches that code." };

  await addMember(gate.userId, t.id);
  return { ok: true, tournamentId: t.id, name: t.name };
}

/** Join an open, visible tournament (e.g. the general pool) without a code. */
export async function joinPool(tournamentId: string): Promise<JoinResult> {
  const gate = await requirePlayer();
  if (!gate.ok) return gate;

  const db = getDb();
  const t = (
    await db.select().from(tournaments).where(eq(tournaments.id, tournamentId)).limit(1)
  )[0];
  if (!t || !t.visible) return { ok: false, error: "Tournament not found." };
  if (t.joinPolicy !== "open") {
    return { ok: false, error: "This tournament needs a join code." };
  }

  await addMember(gate.userId, t.id);
  return { ok: true, tournamentId: t.id, name: t.name };
}

export async function leaveTournament(
  tournamentId: string,
): Promise<{ ok: boolean }> {
  const user = await getSessionUser();
  if (!user) return { ok: false };
  const db = getDb();
  await db
    .delete(memberships)
    .where(
      and(
        eq(memberships.userId, user.id),
        eq(memberships.tournamentId, tournamentId),
      ),
    );
  revalidatePath("/");
  return { ok: true };
}
