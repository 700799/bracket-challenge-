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
    // Optional: enables announcement emails (Resend). No-op if unset.
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
    // Optional: api-sports.io (API-Football) key for live team imports.
    APISPORTS_KEY?: string;
  }
}

export {};
