import type { ImportedTeam } from "@/lib/import";

/**
 * api-sports.io (API-Football) import adapter.
 * Docs: https://www.api-football.com/documentation-v3
 * Auth: header `x-apisports-key: <APISPORTS_KEY>` against v3.football.api-sports.io.
 */

export const APISPORTS_BASE = "https://v3.football.api-sports.io";
export const WORLD_CUP_LEAGUE_ID = 1;
export const DEFAULT_KNOCKOUT_ROUND = "Round of 16";

export interface ApiSportsEnv {
  APISPORTS_KEY?: string;
}

/* ---------------------------------------------------------------- */
/* Pure response mappers                                             */
/* ---------------------------------------------------------------- */

interface TeamsResponse {
  response?: Array<{ team?: { id?: number; name?: string } }>;
}

/** Map a `/teams?league=&season=` response to teams. */
export function mapTeamsResponse(json: unknown): ImportedTeam[] {
  const data = (json ?? {}) as TeamsResponse;
  const out: ImportedTeam[] = [];
  const seen = new Set<string>();
  for (const row of data.response ?? []) {
    const name = row.team?.name?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name });
  }
  return out;
}

interface FixturesResponse {
  response?: Array<{
    teams?: {
      home?: { name?: string };
      away?: { name?: string };
    };
  }>;
}

/**
 * Map a `/fixtures?league=&season=&round=` response to the unique teams playing
 * that round, in fixture order (home, away per match) — 16 teams for a
 * Round of 16, etc.
 */
export function mapFixturesToTeams(json: unknown): ImportedTeam[] {
  const data = (json ?? {}) as FixturesResponse;
  const out: ImportedTeam[] = [];
  const seen = new Set<string>();
  const add = (name?: string) => {
    const n = name?.trim();
    if (!n) return;
    const key = n.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name: n });
  };
  for (const row of data.response ?? []) {
    add(row.teams?.home?.name);
    add(row.teams?.away?.name);
  }
  return out;
}

/* ---------------------------------------------------------------- */
/* Live fetch                                                        */
/* ---------------------------------------------------------------- */

export interface ApiSportsQuery {
  leagueId: number;
  season: number;
  /** When set, pull the teams contesting this knockout round via /fixtures. */
  round?: string;
}

const MAX_BYTES = 1024 * 1024;

export async function fetchApiSportsTeams(
  env: ApiSportsEnv,
  q: ApiSportsQuery,
): Promise<ImportedTeam[]> {
  const key = env.APISPORTS_KEY;
  if (!key) {
    throw new Error("Set APISPORTS_KEY to import from api-sports.io.");
  }

  const url = new URL(
    q.round ? `${APISPORTS_BASE}/fixtures` : `${APISPORTS_BASE}/teams`,
  );
  url.searchParams.set("league", String(q.leagueId));
  url.searchParams.set("season", String(q.season));
  if (q.round) url.searchParams.set("round", q.round);

  const res = await fetch(url, {
    headers: { "x-apisports-key": key, accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`api-sports.io responded ${res.status}.`);
  const text = await res.text();
  if (text.length > MAX_BYTES) throw new Error("api-sports.io response too large.");

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("api-sports.io returned invalid JSON.");
  }

  const teams = q.round ? mapFixturesToTeams(json) : mapTeamsResponse(json);
  if (teams.length === 0) {
    const errs = (json as { errors?: unknown }).errors;
    const detail =
      errs && typeof errs === "object" && Object.keys(errs).length
        ? ` (${JSON.stringify(errs)})`
        : "";
    throw new Error(`No teams found for that league/season/round${detail}.`);
  }
  return teams;
}

/* ---------------------------------------------------------------- */
/* Offline sample: 2022 FIFA World Cup, Round of 16                  */
/* Shaped exactly like an api-sports.io /fixtures response so the    */
/* real mapper is exercised. No key/network required.               */
/* ---------------------------------------------------------------- */

function fx(home: string, away: string) {
  return { teams: { home: { name: home }, away: { name: away } } };
}

export const WORLD_CUP_2022_R16 = {
  get: "fixtures",
  parameters: { league: "1", season: "2022", round: "Round of 16" },
  results: 8,
  response: [
    fx("Netherlands", "USA"),
    fx("Argentina", "Australia"),
    fx("France", "Poland"),
    fx("England", "Senegal"),
    fx("Japan", "Croatia"),
    fx("Brazil", "South Korea"),
    fx("Morocco", "Spain"),
    fx("Portugal", "Switzerland"),
  ],
};

/** The 16 teams of the 2022 World Cup Round of 16 (via the real mapper). */
export function worldCupSampleTeams(): ImportedTeam[] {
  return mapFixturesToTeams(WORLD_CUP_2022_R16);
}
