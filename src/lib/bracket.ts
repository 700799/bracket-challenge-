import type { Round, BracketSide } from "@/db/schema";

/** Bracket sizes the admin can choose (single-elimination, powers of two). */
export const SUPPORTED_SIZES = [8, 16, 32, 64] as const;
export type BracketSize = (typeof SUPPORTED_SIZES)[number];

/** The final is always a 2-team round. */
export const FINAL_ROUND = "R2";

export function isPowerOfTwo(n: number): boolean {
  return Number.isInteger(n) && n >= 2 && (n & (n - 1)) === 0;
}

export function isSupportedSize(n: number): n is BracketSize {
  return (SUPPORTED_SIZES as readonly number[]).includes(n);
}

/** Number of teams contesting a round, decoded from its `R{n}` code. */
export function roundTeams(code: Round): number {
  return parseInt(code.slice(1), 10);
}

/** Matches in a round (= teams / 2). */
export function roundMatchCount(code: Round): number {
  return roundTeams(code) / 2;
}

/** Rounds for a bracket size, largest → smallest, e.g. 16 → R16,R8,R4,R2. */
export function roundsForSize(size: number): Round[] {
  const rounds: Round[] = [];
  for (let t = size; t >= 2; t /= 2) rounds.push(`R${t}`);
  return rounds;
}

/** Total rounds in a bracket of `size` (e.g. 16 → 4). */
export function roundCount(size: number): number {
  return Math.log2(size);
}

/** The next round's code, or null if `code` is the final. */
export function nextRound(code: Round): Round | null {
  const t = roundTeams(code);
  return t > 2 ? `R${t / 2}` : null;
}

/**
 * Standard bracket seeding order (top → bottom) for any power-of-two size, so
 * the top seeds only meet in later rounds. Values are 1-based seeds; adjacent
 * pairs (0,1),(2,3),… are the first-round matchups.
 */
export function seedOrder(size: number): number[] {
  let seeds = [1, 2];
  while (seeds.length < size) {
    const n = seeds.length * 2;
    const out: number[] = [];
    for (const s of seeds) {
      out.push(s);
      out.push(n + 1 - s);
    }
    seeds = out;
  }
  return seeds;
}

export interface NewMatch {
  id: string;
  round: Round;
  slot: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  feedsIntoMatchId: string | null;
  feedsIntoSide: BracketSide | null;
}

/**
 * Where the winner of (round, slot) advances to.
 * Even slots feed the 'home' side of the next match, odd slots feed 'away'.
 */
export function feedTarget(
  round: Round,
  slot: number,
): { round: Round; slot: number; side: BracketSide } | null {
  const nr = nextRound(round);
  if (!nr) return null;
  return {
    round: nr,
    slot: Math.floor(slot / 2),
    side: slot % 2 === 0 ? "home" : "away",
  };
}

/**
 * Build all matches for a fresh `size`-team bracket, wiring each match's winner
 * into the correct slot/side of the next round. The first (largest) round is
 * populated from `teamIdBySeed` (index 0 = seed 1); later rounds start empty.
 *
 * `newId` lets callers inject id generation (defaults to crypto.randomUUID).
 */
export function buildBracket(
  teamIdBySeed: (string | null)[],
  size: number,
  newId: () => string = () => crypto.randomUUID(),
): NewMatch[] {
  const rounds = roundsForSize(size);
  const firstRound = rounds[0];
  const order = seedOrder(size);

  // Pre-generate an id for every (round, slot) so we can wire feedsInto.
  const idAt = new Map<string, string>();
  for (const round of rounds) {
    for (let slot = 0; slot < roundMatchCount(round); slot++) {
      idAt.set(`${round}:${slot}`, newId());
    }
  }

  const matches: NewMatch[] = [];
  for (const round of rounds) {
    for (let slot = 0; slot < roundMatchCount(round); slot++) {
      const target = feedTarget(round, slot);
      let homeTeamId: string | null = null;
      let awayTeamId: string | null = null;
      if (round === firstRound) {
        homeTeamId = teamIdBySeed[order[slot * 2] - 1] ?? null;
        awayTeamId = teamIdBySeed[order[slot * 2 + 1] - 1] ?? null;
      }
      matches.push({
        id: idAt.get(`${round}:${slot}`)!,
        round,
        slot,
        homeTeamId,
        awayTeamId,
        feedsIntoMatchId: target
          ? idAt.get(`${target.round}:${target.slot}`)!
          : null,
        feedsIntoSide: target ? target.side : null,
      });
    }
  }
  return matches;
}

export interface FinalizeInput {
  homeScore: number | null;
  awayScore: number | null;
  wentToPenalties: boolean;
  penaltyWinnerTeamId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
}

/**
 * Which team won a finalized match. Returns null if it's a draw with no
 * shootout recorded (an invalid final state the admin UI must prevent).
 * Null scores are treated as 0.
 */
export function matchWinner(m: FinalizeInput): string | null {
  const hs = m.homeScore ?? 0;
  const as = m.awayScore ?? 0;
  if (hs > as) return m.homeTeamId;
  if (as > hs) return m.awayTeamId;
  return m.wentToPenalties ? m.penaltyWinnerTeamId : null;
}

export interface MatchLike {
  id: string;
  round: Round;
  slot: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  wentToPenalties: boolean;
  penaltyWinnerTeamId: string | null;
  status: "scheduled" | "locked" | "final";
  feedsIntoMatchId: string | null;
  feedsIntoSide: BracketSide | null;
}

export interface Advancement {
  /** The next match to update. */
  matchId: string;
  side: BracketSide;
  /** The team that advances into that side. */
  teamId: string;
}

/**
 * Given a match that has just been finalized, compute how its winner should be
 * written into the next round. Returns null for the final (no onward match) or
 * when there is no valid winner. Pure — the caller performs the DB write.
 */
export function advancementFor(match: MatchLike): Advancement | null {
  if (!match.feedsIntoMatchId || !match.feedsIntoSide) return null;
  const winner = matchWinner(match);
  if (!winner) return null;
  return {
    matchId: match.feedsIntoMatchId,
    side: match.feedsIntoSide,
    teamId: winner,
  };
}

/** The champion, if the final (R2) has a winner. */
export function championOf(matchesById: Map<string, MatchLike>): string | null {
  for (const m of matchesById.values()) {
    if (m.round === FINAL_ROUND && m.status === "final") return matchWinner(m);
  }
  return null;
}
