import {
  scorePrediction,
  type LeaderboardEntry,
  type ScoredPrediction,
} from "@/lib/scoring";

export interface TopPick {
  userId: string;
  username: string;
  points: number;
  round: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}

export interface PlayerRecord {
  userId: string;
  username: string;
  picks: number;
  correctWinners: number;
  wrongWinners: number;
  exact: number;
  points: number;
}

export interface ViewerStat {
  rank: number;
  points: number;
  /** 0–100; higher = nearer the top. */
  percentile: number;
}

export interface TournamentStats {
  memberCount: number;
  scoredMembers: number;
  averagePoints: number;
  medianPoints: number;
  topPoints: number;
  biggestDeltas: TopPick[];
  records: PlayerRecord[];
  viewer: ViewerStat | null;
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Aggregate tournament statistics from the ranked leaderboard and the raw
 * scored predictions over finalized matches. Pure and unit-testable.
 */
export function computeStats(
  entries: LeaderboardEntry[],
  scored: ScoredPrediction[],
  bracketSize: number,
  viewerUserId?: string,
  topN = 5,
): TournamentStats {
  const nameById = new Map(entries.map((e) => [e.userId, e.username]));

  // Per-player win/loss record.
  const rec = new Map<string, PlayerRecord>();
  const ensure = (userId: string): PlayerRecord => {
    let r = rec.get(userId);
    if (!r) {
      r = {
        userId,
        username: nameById.get(userId) ?? "—",
        picks: 0,
        correctWinners: 0,
        wrongWinners: 0,
        exact: 0,
        points: 0,
      };
      rec.set(userId, r);
    }
    return r;
  };

  const deltas: TopPick[] = [];
  for (const s of scored) {
    if (!nameById.has(s.userId)) continue; // members only
    const b = scorePrediction(s.prediction, s.result, bracketSize);
    const r = ensure(s.userId);
    r.picks += 1;
    r.points += b.total;
    if (b.correctWinner) r.correctWinners += 1;
    else r.wrongWinners += 1;
    if (b.isExact) r.exact += 1;

    if (b.total > 0) {
      deltas.push({
        userId: s.userId,
        username: nameById.get(s.userId) ?? "—",
        points: b.total,
        round: s.result.round,
        homeTeamId: s.result.homeTeamId,
        awayTeamId: s.result.awayTeamId,
        homeScore: s.result.homeScore,
        awayScore: s.result.awayScore,
      });
    }
  }

  const points = entries.map((e) => e.points);
  const biggestDeltas = deltas
    .sort((a, b) => b.points - a.points || a.username.localeCompare(b.username))
    .slice(0, topN);

  const viewerEntry = viewerUserId
    ? entries.find((e) => e.userId === viewerUserId)
    : undefined;
  const viewer: ViewerStat | null = viewerEntry
    ? {
        rank: viewerEntry.rank,
        points: viewerEntry.points,
        percentile:
          entries.length <= 1
            ? 100
            : Math.round(
                ((entries.length - viewerEntry.rank) / (entries.length - 1)) * 100,
              ),
      }
    : null;

  return {
    memberCount: entries.length,
    scoredMembers: rec.size,
    averagePoints:
      entries.length === 0
        ? 0
        : Math.round(
            (points.reduce((a, b) => a + b, 0) / entries.length) * 10,
          ) / 10,
    medianPoints: median(points),
    topPoints: points.length ? Math.max(...points) : 0,
    biggestDeltas,
    records: [...rec.values()].sort((a, b) => b.points - a.points),
    viewer,
  };
}
