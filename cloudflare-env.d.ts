// Types for the Cloudflare bindings available at runtime.
// Regenerate the full version with `npm run cf-typegen` after editing wrangler.jsonc.
import type { D1Database } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ASSETS: Fetcher;
    AUTH_SECRET: string;
    AUTH_URL?: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    ADMIN_EMAILS: string;
    FACEBOOK_CLIENT_ID?: string;
    FACEBOOK_CLIENT_SECRET?: string;
    TWITTER_CLIENT_ID?: string;
    TWITTER_CLIENT_SECRET?: string;
  }
}

export {};
