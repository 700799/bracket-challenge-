import type { Round, MatchStatus } from "@/db/schema";

export interface TeamVM {
  id: string;
  name: string;
  colorHint: string | null;
}

export interface PredictionVM {
  homeScore: number;
  awayScore: number;
  wentToPenalties: boolean;
  penaltyWinnerTeamId: string | null;
}

export interface MatchVM {
  id: string;
  round: Round;
  slot: number;
  home: TeamVM | null;
  away: TeamVM | null;
  homeScore: number | null;
  awayScore: number | null;
  wentToPenalties: boolean;
  penaltyWinnerTeamId: string | null;
  status: MatchStatus;
  locked: boolean;
  prediction: PredictionVM | null;
}
