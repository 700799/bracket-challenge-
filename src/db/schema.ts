import {
  integer,
  sqliteTable,
  text,
  primaryKey,
  unique,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";

const uuid = () => crypto.randomUUID();

/* ------------------------------------------------------------------ */
/* Auth.js tables (SQLite shape expected by @auth/drizzle-adapter)     */
/* ------------------------------------------------------------------ */

export const users = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(uuid),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/* ------------------------------------------------------------------ */
/* Application tables                                                  */
/* ------------------------------------------------------------------ */

/** A player's public handle + chosen mascot. Username is REQUIRED. */
export const profiles = sqliteTable("profile", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(),
  mascotVariant: text("mascotVariant").notNull().default("red"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type TournamentStatus = "setup" | "active" | "complete";
/** Round code `R{teamsInRound}`, e.g. "R16" (round of 16), "R2" (final). */
export type Round = string;
export type MatchStatus = "scheduled" | "locked" | "final";
export type BracketSide = "home" | "away";
export type JoinPolicy = "open" | "code";

export const tournaments = sqliteTable("tournament", {
  id: text("id").primaryKey().$defaultFn(uuid),
  name: text("name").notNull(),
  status: text("status").$type<TournamentStatus>().notNull().default("setup"),
  /** Number of teams (power of two: 8/16/32/64). */
  bracketSize: integer("bracketSize").notNull().default(16),
  currentRound: text("currentRound").$type<Round>().notNull().default("R16"),
  /** Global deadline; after this, picks lock everywhere. Nullable = not set. */
  picksDeadline: integer("picksDeadline", { mode: "timestamp_ms" }),
  championTeamId: text("championTeamId"),
  /** Shown in the public tournament switcher when true. */
  visible: integer("visible", { mode: "boolean" }).notNull().default(true),
  /** The default tournament the public home page opens to. */
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  /** How players join: openly, or only with a code. */
  joinPolicy: text("joinPolicy").$type<JoinPolicy>().notNull().default("open"),
  /** Invite code for `code`-policy tournaments (unique when set). */
  joinCode: text("joinCode").unique(),
  /** The open, everyone-welcome pool. */
  isGeneralPool: integer("isGeneralPool", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** A player's membership in a tournament (joined openly or via code). */
export const memberships = sqliteTable(
  "membership",
  {
    id: text("id").primaryKey().$defaultFn(uuid),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tournamentId: text("tournamentId")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    joinedAt: integer("joinedAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (m) => [unique().on(m.userId, m.tournamentId)],
);

/** Admin announcement posted to a tournament (and optionally emailed). */
export const announcements = sqliteTable("announcement", {
  id: text("id").primaryKey().$defaultFn(uuid),
  tournamentId: text("tournamentId")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  /** How many members were emailed (0 if email was skipped/unavailable). */
  emailedCount: integer("emailedCount").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const teams = sqliteTable("team", {
  id: text("id").primaryKey().$defaultFn(uuid),
  tournamentId: text("tournamentId")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  seed: integer("seed").notNull(),
  colorHint: text("colorHint"),
  eliminated: integer("eliminated", { mode: "boolean" }).notNull().default(false),
});

export const matches = sqliteTable("match", {
  id: text("id").primaryKey().$defaultFn(uuid),
  tournamentId: text("tournamentId")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  round: text("round").$type<Round>().notNull(),
  /** 0-based position within the round (drives bracket layout + progression). */
  slot: integer("slot").notNull(),
  homeTeamId: text("homeTeamId"),
  awayTeamId: text("awayTeamId"),
  homeScore: integer("homeScore"),
  awayScore: integer("awayScore"),
  wentToPenalties: integer("wentToPenalties", { mode: "boolean" })
    .notNull()
    .default(false),
  penaltyWinnerTeamId: text("penaltyWinnerTeamId"),
  status: text("status").$type<MatchStatus>().notNull().default("scheduled"),
  kickoffAt: integer("kickoffAt", { mode: "timestamp_ms" }),
  /** Which match (and which side of it) the winner advances to. */
  feedsIntoMatchId: text("feedsIntoMatchId"),
  feedsIntoSide: text("feedsIntoSide").$type<BracketSide>(),
});

export const predictions = sqliteTable(
  "prediction",
  {
    id: text("id").primaryKey().$defaultFn(uuid),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    matchId: text("matchId")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    homeScore: integer("homeScore").notNull(),
    awayScore: integer("awayScore").notNull(),
    wentToPenalties: integer("wentToPenalties", { mode: "boolean" })
      .notNull()
      .default(false),
    penaltyWinnerTeamId: text("penaltyWinnerTeamId"),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (p) => [unique().on(p.userId, p.matchId)],
);

/** Admin-assigned YouTube workout "punishment" for a ranked leaderboard spot. */
export const punishments = sqliteTable("punishment", {
  id: text("id").primaryKey().$defaultFn(uuid),
  tournamentId: text("tournamentId")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  /** e.g. 1 = "4th from last" when set to 4. Exactly one of these is set. */
  fromBottom: integer("fromBottom"),
  absoluteRank: integer("absoluteRank"),
  youtubeUrl: text("youtubeUrl").notNull(),
  label: text("label"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/* ------------------------------------------------------------------ */
/* Inferred types                                                      */
/* ------------------------------------------------------------------ */
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Tournament = typeof tournaments.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
export type Punishment = typeof punishments.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
