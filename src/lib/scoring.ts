import type { Round } from "@/db/schema";
import { roundsForSize, roundTeams } from "@/lib/bracket";

export const POINTS = {
  /** Correct winner (including via penalty shootout). */
  WINNER: 5,
  /** Exact final score (home & away both correct). */
  EXACT: 5,
  /** Awarded when the result is not exact: 3 minus total goal error, floored at 0. */
  CLOSE_MAX: 3,
  /** Correctly predicted a shootout AND its winner. */
  PENALTY: 2,
} as const;

/**
 * Points multiplier for a round, growing as the tournament progresses.
 * Non-final round at index k (0-based) → k+1; the final → numRounds+1.
 * This preserves the classic 16-team weights (R16=1, QF=2, SF=3, Final=5) and
 * scales for any size (8-team → 1,2,4; 32-team → 1,2,3,4,6).
 */
export function roundWeight(code: Round, bracketSize: number): number {
  const rounds = roundsForSize(bracketSize);
  const idx = rounds.indexOf(code);
  if (idx < 0) return 1;
  const isFinal = idx === rounds.length - 1;
  return isFinal ? rounds.length + 1 : idx + 1;
}

/** Full-name label for a round code, e.g. R2→Final, R8→Quarter-finals. */
export function roundLabel(code: Round): string {
  const t = roundTeams(code);
  if (t === 2) return "Final";
  if (t === 4) return "Semi-finals";
  if (t === 8) return "Quarter-finals";
  return `Round of ${t}`;
}

export interface MatchResult {
  round: Round;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  wentToPenalties: boolean;
  /** Required when wentToPenalties: the team that won the shootout. */
  penaltyWinnerTeamId: string | null;
}

export interface PredictionInput {
  homeScore: number;
  awayScore: number;
  wentToPenalties: boolean;
  penaltyWinnerTeamId: string | null;
}

export interface ScoreBreakdown {
  winner: number;
  exact: number;
  close: number;
  penalty: number;
  total: number;
  isExact: boolean;
  correctWinner: boolean;
}

/** Resolve who actually won a finalized match (penalty winner overrides a draw). */
export function resolveWinner(r: MatchResult): string | null {
  if (r.homeScore > r.awayScore) return r.homeTeamId;
  if (r.awayScore > r.homeScore) return r.awayTeamId;
  // Level after regulation → decided by penalties (if recorded).
  return r.wentToPenalties ? r.penaltyWinnerTeamId : null;
}

/** Who a player predicted to win, using the same rules as the real result. */
export function resolvePredictedWinner(
  p: PredictionInput,
  homeTeamId: string,
  awayTeamId: string,
): string | null {
  if (p.homeScore > p.awayScore) return homeTeamId;
  if (p.awayScore > p.homeScore) return awayTeamId;
  return p.wentToPenalties ? p.penaltyWinnerTeamId : null;
}

/**
 * Score a single prediction against a finalized match result.
 * Winner + exact-score + closeness(delta) + penalty bonus, all × round weight.
 */
export function scorePrediction(
  prediction: PredictionInput,
  result: MatchResult,
  bracketSize: number,
): ScoreBreakdown {
  const weight = roundWeight(result.round, bracketSize);

  const actualWinner = resolveWinner(result);
  const predictedWinner = resolvePredictedWinner(
    prediction,
    result.homeTeamId,
    result.awayTeamId,
  );
  const correctWinner =
    actualWinner !== null && predictedWinner === actualWinner;

  const isExact =
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore;

  const goalError =
    Math.abs(prediction.homeScore - result.homeScore) +
    Math.abs(prediction.awayScore - result.awayScore);

  const winner = correctWinner ? POINTS.WINNER : 0;
  const exact = isExact ? POINTS.EXACT : 0;
  // Closeness only when not exact, and never negative.
  const close = isExact ? 0 : Math.max(0, POINTS.CLOSE_MAX - goalError);

  const penaltyCalledRight =
    result.wentToPenalties &&
    prediction.wentToPenalties &&
    prediction.penaltyWinnerTeamId !== null &&
    prediction.penaltyWinnerTeamId === result.penaltyWinnerTeamId;
  const penalty = penaltyCalledRight ? POINTS.PENALTY : 0;

  const total = (winner + exact + close + penalty) * weight;

  return {
    winner: winner * weight,
    exact: exact * weight,
    close: close * weight,
    penalty: penalty * weight,
    total,
    isExact,
    correctWinner,
  };
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  mascotVariant: string;
  points: number;
  exactCount: number;
  correctWinners: number;
  /** Lower = joined earlier; used as the final tiebreak. */
  joinedAt: number;
  rank: number;
}

export interface ScoredPrediction {
  userId: string;
  result: MatchResult;
  prediction: PredictionInput;
}

export interface PlayerMeta {
  userId: string;
  username: string;
  mascotVariant: string;
  joinedAt: number;
}

/**
 * Build a ranked leaderboard from all players and every scored prediction over
 * finalized matches. Tiebreak: points, then exact-score count, then earliest join.
 * Players with no points still appear (rank included).
 */
export function buildLeaderboard(
  players: PlayerMeta[],
  scored: ScoredPrediction[],
  bracketSize: number,
): LeaderboardEntry[] {
  const byUser = new Map<string, LeaderboardEntry>();
  for (const p of players) {
    byUser.set(p.userId, {
      userId: p.userId,
      username: p.username,
      mascotVariant: p.mascotVariant,
      points: 0,
      exactCount: 0,
      correctWinners: 0,
      joinedAt: p.joinedAt,
      rank: 0,
    });
  }

  for (const s of scored) {
    const entry = byUser.get(s.userId);
    if (!entry) continue;
    const b = scorePrediction(s.prediction, s.result, bracketSize);
    entry.points += b.total;
    if (b.isExact) entry.exactCount += 1;
    if (b.correctWinner) entry.correctWinners += 1;
  }

  const entries = [...byUser.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.exactCount !== a.exactCount) return b.exactCount - a.exactCount;
    return a.joinedAt - b.joinedAt;
  });

  // Standard competition ranking (ties share a rank).
  let lastRank = 0;
  entries.forEach((e, i) => {
    const prev = entries[i - 1];
    const tiedWithPrev =
      prev &&
      prev.points === e.points &&
      prev.exactCount === e.exactCount;
    e.rank = tiedWithPrev ? lastRank : i + 1;
    lastRank = e.rank;
  });

  return entries;
}
