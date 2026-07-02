import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import {
  getAllTournaments,
  getMemberCounts,
  getTournamentById,
  getBracketData,
  getSignups,
  getPunishments,
  getScoring,
  getAnnouncements,
} from "@/lib/queries";
import { resolvePunishmentTargets } from "@/lib/punishments";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type {
  AdminAnnouncement,
  AdminMatch,
  AdminPunishment,
  AdminSignup,
  AdminTournament,
  AdminTournamentListItem,
} from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (!user.isAdmin) redirect("/");

  const { t: requestedId } = await searchParams;

  const [all, counts] = await Promise.all([getAllTournaments(), getMemberCounts()]);
  const list: AdminTournamentListItem[] = all.map((t) => ({
    id: t.id,
    name: t.name,
    bracketSize: t.bracketSize,
    status: t.status,
    visible: t.visible,
    featured: t.featured,
    isGeneralPool: t.isGeneralPool,
    joinPolicy: t.joinPolicy,
    joinCode: t.joinCode,
    memberCount: counts.get(t.id) ?? 0,
  }));

  const selected =
    (requestedId ? await getTournamentById(requestedId) : null) ?? all[0] ?? null;

  let tVM: AdminTournament | null = null;
  let matchVMs: AdminMatch[] = [];
  let punishmentVMs: AdminPunishment[] = [];
  let signups: AdminSignup[] = [];
  let announcements: AdminAnnouncement[] = [];

  if (selected) {
    const { teamsById, matches } = await getBracketData(selected.id);
    const [scoring, punishments, signupRows, anns] = await Promise.all([
      getScoring(selected.id),
      getPunishments(selected.id),
      getSignups(selected.id),
      getAnnouncements(selected.id),
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

    punishmentVMs = resolvePunishmentTargets(scoring.entries, punishments).map((r) => ({
      id: r.punishment.id,
      fromBottom: r.punishment.fromBottom,
      absoluteRank: r.punishment.absoluteRank,
      youtubeUrl: r.punishment.youtubeUrl,
      label: r.punishment.label,
      slotLabel: r.slotLabel,
      targetUsername: r.entry?.username ?? null,
    }));

    signups = signupRows.map((s) => ({
      userId: s.userId,
      username: s.username,
      name: s.name,
      email: s.email,
      mascotVariant: s.mascotVariant,
      joinedAtMs: s.joinedAt.getTime(),
    }));

    announcements = anns.map((a) => ({
      id: a.id,
      body: a.body,
      emailedCount: a.emailedCount,
      createdAtMs: a.createdAt.getTime(),
    }));

    tVM = {
      id: selected.id,
      name: selected.name,
      status: selected.status,
      currentRound: selected.currentRound,
      bracketSize: selected.bracketSize,
      picksDeadlineMs: selected.picksDeadline?.getTime() ?? null,
      championName: selected.championTeamId
        ? (teamsById.get(selected.championTeamId)?.name ?? null)
        : null,
    };
  }

  return (
    <AdminDashboard
      tournaments={list}
      selected={tVM}
      matches={matchVMs}
      signups={signups}
      punishments={punishmentVMs}
      announcements={announcements}
    />
  );
}
