import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

/**
 * Returns a Drizzle client bound to the request's D1 database.
 * Call inside a request scope (Server Component, Route Handler, Server Action).
 */
export function getDb() {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
}

export type DB = ReturnType<typeof getDb>;
export { schema };
