import Link from "next/link";
import { HeroBanner } from "@/components/HeroBanner";
import { DeadlineCountdown } from "@/components/DeadlineCountdown";
import { BracketView } from "@/components/bracket/BracketView";
import { Leaderboard } from "@/components/Leaderboard";
import { StatsPanel } from "@/components/StatsPanel";
import { Announcements } from "@/components/Announcements";
import { TournamentSwitcher } from "@/components/TournamentSwitcher";
import { JoinTournament } from "@/components/JoinTournament";
import { KartLink } from "@/components/ui/buttons";
import {
  getFeaturedTournament,
  getVisibleTournaments,
  getTournamentById,
  getBracketData,
  getUserPredictions,
  getScoring,
  getPunishments,
  getAnnouncements,
  getUserMembershipIds,
  isMatchLocked,
} from "@/lib/queries";
import { getCurrentPlayer } from "@/lib/session";
import { resolvePunishmentTargets } from "@/lib/punishments";
import { computeStats } from "@/lib/stats";
import type { MatchVM } from "@/components/bracket/types";
import type { Team } from "@/db/schema";

export const dynamic = "force-dynamic";

function teamVM(t: Team | undefined) {
  return t ? { id: t.id, name: t.name, colorHint: t.colorHint } : null;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t: requestedId } = await searchParams;

  const visible = await getVisibleTournaments();
  const tournament = requestedId
    ? ((await getTournamentById(requestedId)) ?? (await getFeaturedTournament()))
    : await getFeaturedTournament();

  if (!tournament) {
    return (
      <div className="sticker bg-[#141a4d] p-8 text-center">
        <h1 className="titlecard text-3xl text-star">No tournament yet</h1>
        <p className="mt-2 text-cream/70">An admin needs to set up a bracket.</p>
        <div className="mt-4 flex justify-center">
          <KartLink href="/admin" color="purple">Go to Admin</KartLink>
        </div>
      </div>
    );
  }

  const player = await getCurrentPlayer();
  const loggedIn = !!player;
  const hasUsername = !!player?.profile;
  const memberIds = player ? await getUserMembershipIds(player.user.id) : new Set<string>();
  const isMember = memberIds.has(tournament.id);

  const { teamsById, matches } = await getBracketData(tournament.id);
  const predictions = isMember
    ? await getUserPredictions(player!.user.id, tournament.id)
    : new Map();

  const [scoring, punishments, announcements] = await Promise.all([
    getScoring(tournament.id),
    getPunishments(tournament.id),
    getAnnouncements(tournament.id),
  ]);
  const resolved = resolvePunishmentTargets(scoring.entries, punishments);
  const stats = computeStats(
    scoring.entries,
    scoring.scored,
    scoring.bracketSize,
    player?.user.id,
  );
  const teamName = (id: string) => teamsById.get(id)?.name ?? "?";

  const matchVMs: MatchVM[] = matches.map((m) => {
    const pred = predictions.get(m.id);
    return {
      id: m.id,
      round: m.round,
      slot: m.slot,
      home: teamVM(m.homeTeamId ? teamsById.get(m.homeTeamId) : undefined),
      away: teamVM(m.awayTeamId ? teamsById.get(m.awayTeamId) : undefined),
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      wentToPenalties: m.wentToPenalties,
      penaltyWinnerTeamId: m.penaltyWinnerTeamId,
      status: m.status,
      locked: isMatchLocked(tournament, m),
      prediction: pred
        ? {
            homeScore: pred.homeScore,
            awayScore: pred.awayScore,
            wentToPenalties: pred.wentToPenalties,
            penaltyWinnerTeamId: pred.penaltyWinnerTeamId,
          }
        : null,
    };
  });

  const championName = tournament.championTeamId
    ? (teamsById.get(tournament.championTeamId)?.name ?? null)
    : null;

  return (
    <div className="space-y-6">
      <HeroBanner tournamentName={tournament.name} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TournamentSwitcher
          options={visible.map((v) => ({ id: v.id, name: v.name, bracketSize: v.bracketSize }))}
          currentId={tournament.id}
        />
        {loggedIn ? (
          <span className="chip bg-cobalt text-cream">
            {isMember ? "✓ Joined" : "Not joined"}
          </span>
        ) : null}
      </div>

      {loggedIn && !hasUsername ? (
        <div className="sticker flex flex-col items-center gap-2 bg-racing/90 p-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <span className="font-display text-cream">
            Pick a username to join and make picks!
          </span>
          <KartLink href="/me" color="gold">Choose username</KartLink>
        </div>
      ) : null}

      {loggedIn && hasUsername && !isMember ? (
        <JoinTournament
          tournamentId={tournament.id}
          tournamentName={tournament.name}
          joinPolicy={tournament.joinPolicy}
        />
      ) : null}

      <DeadlineCountdown deadlineMs={tournament.picksDeadline?.getTime() ?? null} />

      <section>
        <h2 className="titlecard mb-3 text-2xl text-cream">The Bracket</h2>
        <BracketView
          matches={matchVMs}
          loggedIn={isMember}
          championName={championName}
          bracketSize={tournament.bracketSize}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="titlecard text-2xl text-cream">Leaderboard</h2>
          {!loggedIn ? (
            <KartLink href="/login" color="green" className="!py-1.5 text-sm">
              Sign in to play
            </KartLink>
          ) : null}
        </div>
        <Leaderboard
          entries={scoring.entries}
          resolved={resolved}
          currentUserId={player?.user.id}
        />
        <p className="mt-2 text-center text-xs text-cream/50">
          Points grow each round — later rounds are worth more.{" "}
          <Link href="/rules" className="underline">how scoring works</Link>
        </p>
      </section>

      <section>
        <h2 className="titlecard mb-3 text-2xl text-cream">Group stats</h2>
        <StatsPanel stats={stats} teamName={teamName} />
      </section>

      <Announcements items={announcements} />
    </div>
  );
}
