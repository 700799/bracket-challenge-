import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminEmail } from "@/lib/admin";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/schema";
import * as schema from "@/db/schema";

/**
 * Lazy, per-request Auth.js config: the D1 binding only exists inside a request
 * scope, so we build the adapter/providers when NextAuth invokes this function.
 *
 * Session strategy is JWT so middleware can authorize without a DB round-trip;
 * the Drizzle adapter still persists users/accounts for foreign keys.
 *
 * Additional providers (Facebook, Twitter/X) can be appended to `providers`
 * once their credentials are set — no other changes required.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const { env } = getCloudflareContext();
  const db = drizzle(env.DB, { schema });

  return {
    trustHost: true,
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    session: { strategy: "jwt" },
    providers: [
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    ],
    pages: {
      signIn: "/login",
    },
    callbacks: {
      jwt({ token }) {
        token.isAdmin = isAdminEmail(token.email, env.ADMIN_EMAILS);
        return token;
      },
      session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub ?? session.user.id;
          session.user.isAdmin = Boolean(token.isAdmin);
        }
        return session;
      },
    },
  };
});
