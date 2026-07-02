"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { usernameTaken } from "@/lib/queries";
import { usernameSchema } from "@/lib/validation";
import { MASCOT_VARIANTS } from "@/components/art/mascots";
import { revalidatePath } from "next/cache";

export type ProfileResult = { ok: true } | { ok: false; error: string };

/** Create or update the current user's required username + mascot. */
export async function saveProfile(input: {
  username: string;
  mascotVariant: string;
}): Promise<ProfileResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const parsedName = usernameSchema.safeParse(input.username);
  if (!parsedName.success) {
    return { ok: false, error: parsedName.error.issues[0]?.message ?? "Invalid username." };
  }
  const username = parsedName.data;

  const mascot = MASCOT_VARIANTS.includes(
    input.mascotVariant as (typeof MASCOT_VARIANTS)[number],
  )
    ? input.mascotVariant
    : "red";

  if (await usernameTaken(username, user.id)) {
    return { ok: false, error: "That username is taken — try another." };
  }

  const db = getDb();
  await db
    .insert(profiles)
    .values({ userId: user.id, username, mascotVariant: mascot })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { username, mascotVariant: mascot },
    });

  revalidatePath("/");
  revalidatePath("/me");
  return { ok: true };
}
