import type { Round, MatchStatus, TournamentStatus } from "@/db/schema";

export interface AdminTeam {
  id: string;
  name: string;
  seed: number;
  colorHint: string | null;
  eliminated: boolean;
}

export interface AdminMatch {
  id: string;
  round: Round;
  slot: number;
  home: { id: string; name: string } | null;
  away: { id: string; name: string } | null;
  homeScore: number | null;
  awayScore: number | null;
  wentToPenalties: boolean;
  penaltyWinnerTeamId: string | null;
  status: MatchStatus;
}

export interface AdminTournament {
  id: string;
  name: string;
  status: TournamentStatus;
  currentRound: Round;
  bracketSize: number;
  picksDeadlineMs: number | null;
  championName: string | null;
}

export interface AdminTournamentListItem {
  id: string;
  name: string;
  bracketSize: number;
  status: TournamentStatus;
  visible: boolean;
  featured: boolean;
  isGeneralPool: boolean;
  joinPolicy: "open" | "code";
  joinCode: string | null;
  memberCount: number;
}

export interface AdminAnnouncement {
  id: string;
  body: string;
  emailedCount: number;
  createdAtMs: number;
}

export interface AdminSignup {
  userId: string;
  username: string;
  name: string | null;
  email: string | null;
  mascotVariant: string;
  joinedAtMs: number;
}

export interface AdminPunishment {
  id: string;
  fromBottom: number | null;
  absoluteRank: number | null;
  youtubeUrl: string;
  label: string | null;
  slotLabel: string;
  targetUsername: string | null;
}
