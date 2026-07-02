"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/lib/feedback";
import { CreateTournament } from "./CreateTournament";
import {
  setTournamentVisibility,
  setFeatured,
  generateJoinCode,
  cloneTournament,
} from "@/app/actions/admin";
import type { AdminTournamentListItem } from "./types";

export function TournamentsPanel({
  tournaments,
  selectedId,
}: {
  tournaments: AdminTournamentListItem[];
  selectedId: string | null;
}) {
  const router = useRouter();
  const fb = useFeedback();
  const [pending, start] = React.useTransition();
  const [note, setNote] = React.useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; code?: string; error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        fb.confirm();
        if (res.code) setNote(`Join code: ${res.code}`);
        router.refresh();
      } else {
        fb.error();
        setNote(res.error ?? "Something went wrong.");
      }
    });

  return (
    <div className="space-y-5">
      <div className="sticker bg-[#141a4d] p-5">
        <h2 className="titlecard mb-3 text-xl text-cream">Create a tournament</h2>
        <CreateTournament />
      </div>

      <div className="space-y-2">
        <h2 className="titlecard text-xl text-cream">All tournaments</h2>
        {note ? <p className="text-sm text-star">{note}</p> : null}
        {tournaments.length === 0 ? (
          <p className="text-sm text-cream/60">None yet — create one above.</p>
        ) : (
          tournaments.map((t) => (
            <div
              key={t.id}
              className={`sticker bg-[#0e1547]/70 p-3 ${
                t.id === selectedId ? "ring-4 ring-star" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-cream">{t.name}</span>
                <span className="chip bg-cobalt text-cream">{t.bracketSize} teams</span>
                {t.featured ? <span className="chip bg-star text-ink">Featured</span> : null}
                <span className={`chip ${t.visible ? "bg-kart text-ink" : "bg-racing text-cream"}`}>
                  {t.visible ? "Visible" : "Hidden"}
                </span>
                <span className="chip bg-power text-cream">
                  {t.joinPolicy === "code" ? `Code: ${t.joinCode ?? "—"}` : "Open"}
                </span>
                <span className="chip bg-cream text-ink">{t.memberCount} members</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fb.select();
                    router.push(`/admin?t=${t.id}`);
                  }}
                  className="kart-btn bg-star text-ink !px-3 !py-1 text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => setTournamentVisibility({ tournamentId: t.id, visible: !t.visible }))}
                  className="kart-btn bg-cream text-ink !px-3 !py-1 text-xs"
                >
                  {t.visible ? "Hide" : "Show"}
                </button>
                {!t.featured ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setFeatured({ tournamentId: t.id }))}
                    className="kart-btn bg-cream text-ink !px-3 !py-1 text-xs"
                  >
                    Feature
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => generateJoinCode({ tournamentId: t.id }))}
                  className="kart-btn bg-cream text-ink !px-3 !py-1 text-xs"
                >
                  {t.joinCode ? "New code" : "Gen code"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => cloneTournament({ sourceId: t.id }))}
                  className="kart-btn bg-cream text-ink !px-3 !py-1 text-xs"
                >
                  Clone
                </button>
                <a
                  href={`/?t=${t.id}`}
                  className="kart-btn bg-cobalt text-cream !px-3 !py-1 text-xs"
                >
                  View
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
