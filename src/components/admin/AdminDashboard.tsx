"use client";

import * as React from "react";
import { PillGroup } from "@/components/ui/buttons";
import { TournamentPanel } from "./TournamentPanel";
import { TournamentsPanel } from "./TournamentsPanel";
import { SignupsPanel } from "./SignupsPanel";
import { PunishmentsPanel } from "./PunishmentsPanel";
import { AnnouncePanel } from "./AnnouncePanel";
import type {
  AdminAnnouncement,
  AdminMatch,
  AdminPunishment,
  AdminSignup,
  AdminTournament,
  AdminTournamentListItem,
} from "./types";

type Section = "tournaments" | "results" | "signups" | "punishments" | "announce";

export function AdminDashboard({
  tournaments,
  selected,
  matches,
  signups,
  punishments,
  announcements,
}: {
  tournaments: AdminTournamentListItem[];
  selected: AdminTournament | null;
  matches: AdminMatch[];
  signups: AdminSignup[];
  punishments: AdminPunishment[];
  announcements: AdminAnnouncement[];
}) {
  const [section, setSection] = React.useState<Section>(
    tournaments.length === 0 ? "tournaments" : "results",
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titlecard text-3xl text-star">Admin HQ</h1>
        <PillGroup
          value={section}
          onChange={setSection}
          options={[
            { value: "tournaments", label: `🏆 Tournaments (${tournaments.length})` },
            { value: "results", label: "🏁 Results" },
            { value: "signups", label: `👥 Signups (${signups.length})` },
            { value: "punishments", label: `🏋️ Punishments (${punishments.length})` },
            { value: "announce", label: "📣 Announce" },
          ]}
        />
      </div>

      {selected ? (
        <div className="chip bg-cobalt text-cream">
          Editing: {selected.name} · {selected.bracketSize} teams
        </div>
      ) : null}

      {section === "tournaments" ? (
        <TournamentsPanel tournaments={tournaments} selectedId={selected?.id ?? null} />
      ) : null}

      {section === "results" ? (
        selected ? (
          <TournamentPanel tournament={selected} matches={matches} />
        ) : (
          <Empty />
        )
      ) : null}

      {section === "signups" ? <SignupsPanel signups={signups} /> : null}

      {section === "punishments" ? (
        selected ? (
          <PunishmentsPanel tournamentId={selected.id} punishments={punishments} />
        ) : (
          <Empty />
        )
      ) : null}

      {section === "announce" ? (
        selected ? (
          <AnnouncePanel tournamentId={selected.id} announcements={announcements} />
        ) : (
          <Empty />
        )
      ) : null}
    </div>
  );
}

function Empty() {
  return (
    <div className="sticker bg-[#141a4d] p-5 text-cream/70">
      Create or select a tournament first (Tournaments tab).
    </div>
  );
}
