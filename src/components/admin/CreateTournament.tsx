"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { createTournament, importFromUrl } from "@/app/actions/admin";
import { PillGroup } from "@/components/ui/buttons";
import { parseTeamList, importedSizeError } from "@/lib/import";
import { SUPPORTED_SIZES } from "@/lib/bracket";

const DEFAULT_TEAMS = [
  "Fire Foxes", "Star Sprinters", "Shell Shockers", "Night Owls",
  "Piranha FC", "Thunder Karts", "Cloud Nine", "Lava Lads",
  "Coin Kings", "Turbo Toads", "Ghost Riders", "Rainbow Racers",
  "Bullet Trains", "Mega Shrooms", "Golden Gliders", "Ice Yetis",
  "Wild Cards", "Sky Sharks", "Dust Devils", "Neon Knights",
  "Iron Owls", "Storm Chasers", "Blaze Boars", "Frost Giants",
  "Volt Vipers", "Sand Scorpions", "Jade Jaguars", "Crimson Crows",
  "Onyx Otters", "Pixel Pumas", "Rocket Rams", "Cobalt Cobras",
];

function sizedNames(size: number, current: string[]): string[] {
  const out = current.slice(0, size);
  for (let i = out.length; i < size; i++) out.push(DEFAULT_TEAMS[i] ?? `Team ${i + 1}`);
  return out;
}

export function CreateTournament() {
  const router = useRouter();
  const fb = useFeedback();
  const [name, setName] = React.useState("Kart Hero Cup");
  const [size, setSize] = React.useState(16);
  const [teamNames, setTeamNames] = React.useState<string[]>(() => sizedNames(16, DEFAULT_TEAMS));
  const [deadline, setDeadline] = React.useState("");
  const [joinPolicy, setJoinPolicy] = React.useState<"open" | "code">("open");
  const [paste, setPaste] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [pending, start] = React.useTransition();
  const [msg, setMsg] = React.useState<string | null>(null);

  const changeSize = (s: number) => {
    setSize(s);
    setTeamNames((prev) => sizedNames(s, prev));
  };

  const setTeam = (i: number, v: string) =>
    setTeamNames((prev) => prev.map((t, idx) => (idx === i ? v : t)));

  function applyNames(names: string[]) {
    const err = importedSizeError(names.length);
    if (err) {
      fb.error();
      setMsg(err);
      return;
    }
    setMsg(null);
    setSize(names.length);
    setTeamNames(names);
    fb.coin();
  }

  function fillFromPaste() {
    applyNames(parseTeamList(paste));
  }

  function fetchFromUrl() {
    setMsg(null);
    start(async () => {
      const res = await importFromUrl(url);
      if (res.ok) applyNames(res.teams);
      else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const picksDeadline = deadline ? new Date(deadline).getTime() : null;
    start(async () => {
      const res = await createTournament({ name, teamNames, picksDeadline, joinPolicy });
      if (res.ok) {
        fb.confirm();
        if (res.id) router.push(`/admin?t=${res.id}`);
        router.refresh();
      } else {
        fb.error();
        setMsg(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-cream">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
          />
        </label>
        <label className="text-sm text-cream">
          Picks deadline (optional)
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-ink"
          />
        </label>
      </div>

      <div>
        <div className="mb-1 font-display text-sm text-cream">Bracket size</div>
        <PillGroup
          value={String(size)}
          onChange={(v) => changeSize(Number(v))}
          options={SUPPORTED_SIZES.map((s) => ({ value: String(s), label: `${s}` }))}
        />
      </div>

      <div>
        <div className="mb-1 font-display text-sm text-cream">Join policy</div>
        <PillGroup
          value={joinPolicy}
          onChange={(v) => setJoinPolicy(v as "open" | "code")}
          options={[
            { value: "open", label: "🌍 Open pool" },
            { value: "code", label: "🔒 Code only" },
          ]}
        />
      </div>

      {/* Import tools */}
      <div className="sticker bg-[#0e1547]/70 p-3">
        <div className="font-display text-sm text-cream">Import teams</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={3}
              placeholder="Paste team names — one per line or comma-separated"
              className="w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-sm text-ink"
            />
            <button
              type="button"
              onClick={fillFromPaste}
              className="kart-btn bg-star text-ink mt-1 !py-1 text-xs"
            >
              Fill from list
            </button>
          </div>
          <div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…/teams.json (or .csv)"
              className="w-full rounded-lg border-2 border-ink bg-cream px-2 py-1 text-sm text-ink"
            />
            <button
              type="button"
              disabled={pending}
              onClick={fetchFromUrl}
              className="kart-btn bg-star text-ink mt-1 !py-1 text-xs"
            >
              {pending ? "Fetching…" : "Fetch from URL"}
            </button>
            <p className="mt-1 text-[11px] text-cream/50">
              JSON array of names/objects or CSV. Must total {SUPPORTED_SIZES.join("/")}.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 font-display text-sm text-cream">
          {size} teams (seed order 1–{size})
        </div>
        <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
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
