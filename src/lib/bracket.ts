import type { Round, BracketSide } from "@/db/schema";

/** Rounds in order, largest to smallest. */
export const ROUNDS: Round[] = ["R16", "QF", "SF", "FINAL"];

/** Number of matches in each round. */
export const ROUND_SIZE: Record<Round, number> = {
  R16: 8,
  QF: 4,
  SF: 2,
  FINAL: 1,
};

export function nextRound(round: Round): Round | null {
  const i = ROUNDS.indexOf(round);
  return i >= 0 && i < ROUNDS.length - 1 ? ROUNDS[i + 1] : null;
}

/**
 * Standard 16-team seeding order (top → bottom of the bracket), so that the
 * top seeds only meet in later rounds. Values are seeds (1-based).
 */
export const SEED_ORDER = [
  1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15,
];

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
 * Build all 15 matches for a fresh 16-team bracket, wiring each match's
 * winner into the correct slot/side of the next round. R16 matches are
 * populated from `teamIdBySeed` (index 0 = seed 1); later rounds start empty.
 *
 * `newId` lets callers inject id generation (defaults to crypto.randomUUID).
 */
export function buildBracket(
  teamIdBySeed: (string | null)[],
  newId: () => string = () => crypto.randomUUID(),
): NewMatch[] {
  // Pre-generate an id for every (round, slot) so we can wire feedsInto.
  const idAt = new Map<string, string>();
  for (const round of ROUNDS) {
    for (let slot = 0; slot < ROUND_SIZE[round]; slot++) {
      idAt.set(`${round}:${slot}`, newId());
    }
  }

  const matches: NewMatch[] = [];
  for (const round of ROUNDS) {
    for (let slot = 0; slot < ROUND_SIZE[round]; slot++) {
      const target = feedTarget(round, slot);
      let homeTeamId: string | null = null;
      let awayTeamId: string | null = null;
      if (round === "R16") {
        homeTeamId = teamIdBySeed[SEED_ORDER[slot * 2] - 1] ?? null;
        awayTeamId = teamIdBySeed[SEED_ORDER[slot * 2 + 1] - 1] ?? null;
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

/** The champion, if the final has a winner. */
export function championOf(matchesById: Map<string, MatchLike>): string | null {
  for (const m of matchesById.values()) {
    if (m.round === "FINAL" && m.status === "final") return matchWinner(m);
  }
  return null;
}
