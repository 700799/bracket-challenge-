"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { joinByCode, joinPool } from "@/app/actions/membership";

/**
 * Join affordance shown to logged-in non-members:
 * one-click join for open tournaments, plus a code box for private ones.
 */
export function JoinTournament({
  tournamentId,
  tournamentName,
  joinPolicy,
}: {
  tournamentId: string;
  tournamentName: string;
  joinPolicy: "open" | "code";
}) {
  const router = useRouter();
  const fb = useFeedback();
  const [code, setCode] = React.useState("");
  const [pending, start] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);

  function open() {
    setMsg(null);
    start(async () => {
      const res = await joinPool(tournamentId);
      if (res.ok) {
        fb.coin();
        router.refresh();
      } else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  function byCode(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await joinByCode(code);
      if (res.ok) {
        fb.coin();
        router.push(`/?t=${res.tournamentId}`);
        router.refresh();
      } else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  return (
    <div className="sticker flex flex-col gap-3 bg-kart/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="font-display text-cream">
        {joinPolicy === "open" ? (
          <>Join <b>{tournamentName}</b> to make your picks and hit the leaderboard!</>
        ) : (
          <>This tournament is private — enter its join code to play.</>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {joinPolicy === "open" ? (
          <button
            type="button"
            disabled={pending}
            onClick={open}
            className="kart-btn bg-kart text-ink !py-1.5 text-sm"
          >
            {pending ? "Joining…" : "Join now"}
          </button>
        ) : null}
        <form onSubmit={byCode} className="flex items-center gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="KART-XXXX"
            className="w-32 rounded-full border-4 border-ink bg-cream px-3 py-1.5 font-display text-ink uppercase"
          />
          <button
            type="submit"
            disabled={pending}
            className="kart-btn bg-star text-ink !py-1.5 text-sm"
          >
            Join by code
          </button>
        </form>
      </div>
      {msg ? <p className="w-full text-center text-sm text-racing">{msg}</p> : null}
    </div>
  );
}
