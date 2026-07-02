"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { recordResult } from "@/app/actions/admin";
import { CheckBadge, PenaltyIcon } from "@/components/art/icons";
import type { AdminMatch } from "./types";

export function MatchResultRow({ match }: { match: AdminMatch }) {
  const router = useRouter();
  const fb = useFeedback();
  const [home, setHome] = React.useState(match.homeScore ?? 0);
  const [away, setAway] = React.useState(match.awayScore ?? 0);
  const [pens, setPens] = React.useState(match.wentToPenalties);
  const [pk, setPk] = React.useState<string | null>(match.penaltyWinnerTeamId);
  const [pending, start] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);

  const known = !!(match.home && match.away);
  const isDraw = home === away;
  const isFinal = match.status === "final";

  function save() {
    setMsg(null);
    start(async () => {
      const res = await recordResult({
        matchId: match.id,
        homeScore: home,
        awayScore: away,
        wentToPenalties: isDraw ? pens : false,
        penaltyWinnerTeamId: isDraw && pens ? pk : null,
      });
      if (res.ok) {
        fb.confirm();
        router.refresh();
      } else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  if (!known) {
    return (
      <div className="sticker bg-[#141a4d] p-2 text-xs text-cream/50">
        Slot {match.slot + 1}: awaiting teams from previous round
      </div>
    );
  }

  return (
    <div className="sticker bg-[#141a4d] p-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 truncate font-display text-sm text-cream">{match.home!.name}</div>
        <input
          type="number"
          min={0}
          max={30}
          value={home}
          onChange={(e) => setHome(Math.max(0, Math.min(30, Number(e.target.value))))}
          className="w-12 rounded-lg border-2 border-ink bg-cream px-1 py-0.5 text-center text-ink"
          aria-label={`${match.home!.name} score`}
        />
        <span className="text-cream/50">–</span>
        <input
          type="number"
          min={0}
          max={30}
          value={away}
          onChange={(e) => setAway(Math.max(0, Math.min(30, Number(e.target.value))))}
          className="w-12 rounded-lg border-2 border-ink bg-cream px-1 py-0.5 text-center text-ink"
          aria-label={`${match.away!.name} score`}
        />
        <div className="flex-1 truncate text-right font-display text-sm text-cream">{match.away!.name}</div>
        {isFinal ? <CheckBadge className="h-5 w-5" /> : null}
      </div>

      {isDraw ? (
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-cream">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={pens}
              onChange={(e) => {
                fb.select();
                setPens(e.target.checked);
              }}
              className="h-4 w-4 accent-[#F5C518]"
            />
            <PenaltyIcon className="h-4 w-4" /> Penalties
          </label>
          {pens
            ? [match.home!, match.away!].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-active={pk === t.id}
                  onClick={() => {
                    fb.select();
                    setPk(t.id);
                  }}
                  className="pill !py-0.5 !text-xs"
                >
                  {t.name} win
                </button>
              ))
            : null}
        </div>
      ) : null}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="kart-btn bg-star text-ink !py-1 text-xs"
        >
          {pending ? "Saving…" : isFinal ? "Update result" : "Record result"}
        </button>
        {msg ? <span className="text-xs text-racing">{msg}</span> : null}
      </div>
    </div>
  );
}
