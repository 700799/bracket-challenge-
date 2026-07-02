"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { createTournament } from "@/app/actions/admin";

const DEFAULT_TEAMS = [
  "Fire Foxes", "Star Sprinters", "Shell Shockers", "Night Owls",
  "Piranha FC", "Thunder Karts", "Cloud Nine", "Lava Lads",
  "Coin Kings", "Turbo Toads", "Ghost Riders", "Rainbow Racers",
  "Bullet Trains", "Mega Shrooms", "Golden Gliders", "Ice Yetis",
];

export function CreateTournament() {
  const router = useRouter();
  const fb = useFeedback();
  const [name, setName] = React.useState("Kart Hero World Cup");
  const [teamNames, setTeamNames] = React.useState<string[]>(DEFAULT_TEAMS);
  const [deadline, setDeadline] = React.useState("");
  const [pending, start] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);

  const setTeam = (i: number, v: string) =>
    setTeamNames((prev) => prev.map((t, idx) => (idx === i ? v : t)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const picksDeadline = deadline ? new Date(deadline).getTime() : null;
    start(async () => {
      const res = await createTournament({ name, teamNames, picksDeadline });
      if (res.ok) {
        fb.confirm();
        router.refresh();
      } else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block font-display text-sm text-cream">Tournament name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border-4 border-ink bg-cream px-3 py-2 font-display text-ink"
        />
      </div>

      <div>
        <label className="mb-1 block font-display text-sm text-cream">
          Picks deadline (optional)
        </label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-xl border-4 border-ink bg-cream px-3 py-2 font-display text-ink"
        />
      </div>

      <div>
        <label className="mb-2 block font-display text-sm text-cream">
          16 teams (seed order 1–16)
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {teamNames.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="titlecard w-6 text-center text-cream/60">{i + 1}</span>
              <input
                value={t}
                onChange={(e) => setTeam(i, e.target.value)}
                className="w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
              />
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={pending} className="kart-btn bg-kart text-ink w-full">
        {pending ? "Creating…" : "Create tournament & bracket"}
      </button>
      {msg ? <p className="text-center text-racing">{msg}</p> : null}
    </form>
  );
}
