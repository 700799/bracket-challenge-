"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { Stepper } from "@/components/ui/buttons";
import { CheckBadge, CrossBadge, PenaltyIcon, Lock } from "@/components/art/icons";
import { submitPrediction } from "@/app/actions/predictions";
import { resolveWinner, resolvePredictedWinner } from "@/lib/scoring";
import type { MatchVM, TeamVM } from "./types";

const ROUND_ACCENT: Record<string, string> = {
  R16: "border-cobalt",
  QF: "border-kart",
  SF: "border-power",
  FINAL: "border-star",
};

function TeamRow({
  team,
  score,
  isWinner,
  side,
}: {
  team: TeamVM | null;
  score: number | null;
  isWinner: boolean;
  side: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1 ${
        isWinner ? "bg-star/25" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-4 w-4 shrink-0 rounded-full border-2 border-ink"
          style={{ background: team?.colorHint ?? "#3A4270" }}
          aria-hidden
        />
        <span className="truncate font-display text-sm text-cream">
          {team?.name ?? <span className="text-cream/40">{side}</span>}
        </span>
      </div>
      {score != null ? (
        <span className="titlecard text-lg text-cream">{score}</span>
      ) : null}
    </div>
  );
}

export function MatchCard({
  match,
  loggedIn,
}: {
  match: MatchVM;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const fb = useFeedback();
  const p = match.prediction;

  const [home, setHome] = React.useState(p?.homeScore ?? 0);
  const [away, setAway] = React.useState(p?.awayScore ?? 0);
  const [pens, setPens] = React.useState(p?.wentToPenalties ?? false);
  const [pkWinner, setPkWinner] = React.useState<string | null>(
    p?.penaltyWinnerTeamId ?? null,
  );
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);

  const isDraw = home === away;
  const teamsKnown = !!(match.home && match.away);
  const isFinal = match.status === "final";

  const actualWinner = isFinal
    ? resolveWinner({
        round: match.round,
        homeTeamId: match.home?.id ?? "",
        awayTeamId: match.away?.id ?? "",
        homeScore: match.homeScore ?? 0,
        awayScore: match.awayScore ?? 0,
        wentToPenalties: match.wentToPenalties,
        penaltyWinnerTeamId: match.penaltyWinnerTeamId,
      })
    : null;

  // Did the user's pick get the winner right?
  const predWinner =
    p && teamsKnown
      ? resolvePredictedWinner(
          {
            homeScore: p.homeScore,
            awayScore: p.awayScore,
            wentToPenalties: p.wentToPenalties,
            penaltyWinnerTeamId: p.penaltyWinnerTeamId,
          },
          match.home!.id,
          match.away!.id,
        )
      : null;
  const gotWinner =
    isFinal && p && actualWinner != null && predWinner === actualWinner;
  const gotExact =
    isFinal && p && p.homeScore === match.homeScore && p.awayScore === match.awayScore;

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await submitPrediction({
        matchId: match.id,
        homeScore: home,
        awayScore: away,
        wentToPenalties: isDraw && pens,
        penaltyWinnerTeamId: isDraw && pens ? pkWinner : null,
      });
      if (res.ok) {
        fb.coin();
        setMsg("Locked in!");
        router.refresh();
      } else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  return (
    <div className={`sticker bg-[#141a4d] p-2.5 ${ROUND_ACCENT[match.round] ?? ""}`}>
      {/* teams + score */}
      <div className="space-y-1">
        <TeamRow
          team={match.home}
          score={match.homeScore}
          isWinner={isFinal && actualWinner === match.home?.id}
          side="Home TBD"
        />
        <TeamRow
          team={match.away}
          score={match.awayScore}
          isWinner={isFinal && actualWinner === match.away?.id}
          side="Away TBD"
        />
      </div>

      {isFinal && match.wentToPenalties ? (
        <div className="mt-1 flex items-center gap-1 text-xs text-star">
          <PenaltyIcon className="h-4 w-4" />
          Won on penalties
        </div>
      ) : null}

      {/* prediction area */}
      <div className="mt-2 border-t-2 border-dashed border-cream/20 pt-2">
        {!teamsKnown ? (
          <p className="text-center text-xs text-cream/40">
            Awaiting teams…
          </p>
        ) : !loggedIn ? (
          <p className="text-center text-xs text-cream/50">Sign in to pick</p>
        ) : match.locked ? (
          <div className="flex items-center justify-center gap-2 text-xs text-cream/70">
            <Lock className="h-4 w-4" />
            {p ? (
              <span>
                Your pick: <b>{p.homeScore}–{p.awayScore}</b>
                {p.wentToPenalties ? " (pens)" : ""}
                {isFinal ? (
                  gotWinner || gotExact ? (
                    <CheckBadge className="ml-1 inline h-4 w-4 align-text-bottom" />
                  ) : (
                    <CrossBadge className="ml-1 inline h-4 w-4 align-text-bottom" />
                  )
                ) : null}
              </span>
            ) : (
              <span>No pick made</span>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <Stepper value={home} onChange={setHome} label={`${match.home!.name} goals`} />
              <span className="titlecard text-cream/60">–</span>
              <Stepper value={away} onChange={setAway} label={`${match.away!.name} goals`} />
            </div>

            {isDraw ? (
              <div className="space-y-1">
                <label className="flex items-center justify-center gap-2 text-xs text-cream">
                  <input
                    type="checkbox"
                    checked={pens}
                    onChange={(e) => {
                      fb.select();
                      setPens(e.target.checked);
                    }}
                    className="h-4 w-4 accent-[#F5C518]"
                  />
                  <PenaltyIcon className="h-4 w-4" /> Decided on penalties
                </label>
                {pens ? (
                  <div className="flex justify-center gap-2">
                    {[match.home!, match.away!].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        data-active={pkWinner === t.id}
                        onClick={() => {
                          fb.select();
                          setPkWinner(t.id);
                        }}
                        className="pill !py-1 !text-xs"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="kart-btn bg-kart text-ink w-full !py-1.5 text-sm"
            >
              {pending ? "Saving…" : p ? "Update pick" : "Lock in pick"}
            </button>
            {msg ? (
              <p className="text-center text-xs text-star">{msg}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
