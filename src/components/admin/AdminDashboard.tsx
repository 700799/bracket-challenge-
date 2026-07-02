"use client";

import * as React from "react";
import { PillGroup } from "@/components/ui/buttons";
import { TournamentPanel } from "./TournamentPanel";
import { SignupsPanel } from "./SignupsPanel";
import { PunishmentsPanel } from "./PunishmentsPanel";
import { CreateTournament } from "./CreateTournament";
import type {
  AdminMatch,
  AdminPunishment,
  AdminSignup,
  AdminTournament,
} from "./types";

type Section = "tournament" | "signups" | "punishments";

export function AdminDashboard({
  tournament,
  matches,
  signups,
  punishments,
}: {
  tournament: AdminTournament | null;
  matches: AdminMatch[];
  signups: AdminSignup[];
  punishments: AdminPunishment[];
}) {
  const [section, setSection] = React.useState<Section>("tournament");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titlecard text-3xl text-star">Admin HQ</h1>
        <PillGroup
          value={section}
          onChange={setSection}
          options={[
            { value: "tournament", label: "🏁 Tournament" },
            { value: "signups", label: `👥 Signups (${signups.length})` },
            { value: "punishments", label: `🏋️ Punishments (${punishments.length})` },
          ]}
        />
      </div>

      {section === "tournament" ? (
        tournament ? (
          <TournamentPanel tournament={tournament} matches={matches} />
        ) : (
          <div className="sticker bg-[#141a4d] p-5">
            <h2 className="titlecard mb-3 text-xl text-cream">
              Create your tournament
            </h2>
            <CreateTournament />
          </div>
        )
      ) : null}

      {section === "signups" ? <SignupsPanel signups={signups} /> : null}

      {section === "punishments" ? (
        tournament ? (
          <PunishmentsPanel tournamentId={tournament.id} punishments={punishments} />
        ) : (
          <div className="sticker bg-[#141a4d] p-5 text-cream/70">
            Create a tournament first to assign punishments.
          </div>
        )
      ) : null}
    </div>
  );
}
