import { defineConfig } from "drizzle-kit";

// Generates SQL migrations from src/db/schema.ts into src/db/migrations.
// Migrations are applied to D1 via `wrangler d1 migrations apply` (see package.json).
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
});
