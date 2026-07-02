import { auth } from "@/auth";
import { getDb } from "@/db";
import { profiles, type Profile } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    isAdmin: session.user.isAdmin,
  };
}

/** Session user plus their profile (null if they haven't set a username yet). */
export async function getCurrentPlayer(): Promise<{
  user: SessionUser;
  profile: Profile | null;
} | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  return { user, profile: rows[0] ?? null };
}
