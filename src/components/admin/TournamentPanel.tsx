"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { updateTournamentSettings } from "@/app/actions/admin";
import { MatchResultRow } from "./MatchResultRow";
import { roundsForSize } from "@/lib/bracket";
import { roundLabel } from "@/lib/scoring";
import type { AdminMatch, AdminTournament } from "./types";

function toLocalInput(ms: number | null): string {
  if (ms == null) return "";
  const d = new Date(ms);
  // Format as yyyy-MM-ddThh:mm in local time for datetime-local input.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TournamentPanel({
  tournament,
  matches,
}: {
  tournament: AdminTournament;
  matches: AdminMatch[];
}) {
  const router = useRouter();
  const fb = useFeedback();
  const [name, setName] = React.useState(tournament.name);
  const [deadline, setDeadline] = React.useState(toLocalInput(tournament.picksDeadlineMs));
  const [status, setStatus] = React.useState(tournament.status);
  const [pending, start] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);

  function saveSettings() {
    setMsg(null);
    start(async () => {
      const res = await updateTournamentSettings({
        tournamentId: tournament.id,
        name,
        picksDeadline: deadline ? new Date(deadline).getTime() : null,
        status,
      });
      if (res.ok) {
        fb.confirm();
        setMsg("Saved!");
        router.refresh();
      } else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="sticker bg-[#0e1547]/70 p-4">
        <h3 className="titlecard mb-3 text-lg text-cream">Settings</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-cream">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
            />
          </label>
          <label className="text-sm text-cream">
            Picks deadline
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
            />
          </label>
          <label className="text-sm text-cream">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
            >
              <option value="setup">Setup</option>
              <option value="active">Active</option>
              <option value="complete">Complete</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={saveSettings}
            className="kart-btn bg-kart text-ink !py-1.5 text-sm"
          >
            {pending ? "Saving…" : "Save settings"}
          </button>
          {tournament.championName ? (
            <span className="chip bg-star text-ink">🏆 {tournament.championName}</span>
          ) : null}
          {msg ? <span className="text-sm text-star">{msg}</span> : null}
        </div>
      </div>

      {/* Results by round */}
      <div className="space-y-4">
        <h3 className="titlecard text-lg text-cream">Enter results & advance rounds</h3>
        <p className="text-xs text-cream/60">
          Recording a result finalizes the match and sends the winner into the
          next round automatically.
        </p>
        {roundsForSize(tournament.bracketSize).map((round) => {
          const rms = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.slot - b.slot);
          return (
            <div key={round}>
              <h4 className="titlecard mb-2 text-base text-star">{roundLabel(round)}</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {rms.map((m) => (
                  <MatchResultRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
