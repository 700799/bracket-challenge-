import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import {
  getActiveTournament,
  getBracketData,
  getSignups,
  getPunishments,
  getLeaderboard,
} from "@/lib/queries";
import { resolvePunishmentTargets } from "@/lib/punishments";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type {
  AdminMatch,
  AdminPunishment,
  AdminSignup,
  AdminTournament,
} from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Middleware already guards this route; double-check for defense in depth.
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (!user.isAdmin) redirect("/");

  const tournament = await getActiveTournament();

  let tVM: AdminTournament | null = null;
  let matchVMs: AdminMatch[] = [];
  let punishmentVMs: AdminPunishment[] = [];

  if (tournament) {
    const { teamsById, matches } = await getBracketData(tournament.id);
    const [leaderboard, punishments] = await Promise.all([
      getLeaderboard(tournament.id),
      getPunishments(tournament.id),
    ]);

    const teamRef = (id: string | null) =>
      id ? { id, name: teamsById.get(id)?.name ?? "?" } : null;

    matchVMs = matches.map((m) => ({
      id: m.id,
      round: m.round,
      slot: m.slot,
      home: teamRef(m.homeTeamId),
      away: teamRef(m.awayTeamId),
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      wentToPenalties: m.wentToPenalties,
      penaltyWinnerTeamId: m.penaltyWinnerTeamId,
      status: m.status,
    }));

    const resolved = resolvePunishmentTargets(leaderboard, punishments);
    punishmentVMs = resolved.map((r) => ({
      id: r.punishment.id,
      fromBottom: r.punishment.fromBottom,
      absoluteRank: r.punishment.absoluteRank,
      youtubeUrl: r.punishment.youtubeUrl,
      label: r.punishment.label,
      slotLabel: r.slotLabel,
      targetUsername: r.entry?.username ?? null,
    }));

    tVM = {
      id: tournament.id,
      name: tournament.name,
      status: tournament.status,
      currentRound: tournament.currentRound,
      picksDeadlineMs: tournament.picksDeadline?.getTime() ?? null,
      championName: tournament.championTeamId
        ? (teamsById.get(tournament.championTeamId)?.name ?? null)
        : null,
    };
  }

  const signupRows = await getSignups();
  const signups: AdminSignup[] = signupRows.map((s) => ({
    userId: s.userId,
    username: s.username,
    name: s.name,
    email: s.email,
    mascotVariant: s.mascotVariant,
    joinedAtMs: s.joinedAt.getTime(),
  }));

  return (
    <AdminDashboard
      tournament={tVM}
      matches={matchVMs}
      signups={signups}
      punishments={punishmentVMs}
    />
  );
}
