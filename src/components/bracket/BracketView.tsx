import { MatchCard } from "./MatchCard";
import { Trophy } from "@/components/art/icons";
import { HeroMascot, type MascotVariant } from "@/components/art/mascots";
import { ROUND_LABEL } from "@/lib/scoring";
import { ROUNDS } from "@/lib/bracket";
import type { Round } from "@/db/schema";
import type { MatchVM } from "./types";

const COL_TITLE: Record<Round, string> = {
  R16: ROUND_LABEL.R16,
  QF: ROUND_LABEL.QF,
  SF: ROUND_LABEL.SF,
  FINAL: ROUND_LABEL.FINAL,
};

export function BracketView({
  matches,
  loggedIn,
  championName,
}: {
  matches: MatchVM[];
  loggedIn: boolean;
  championName: string | null;
}) {
  const byRound = (r: Round) =>
    matches.filter((m) => m.round === r).sort((a, b) => a.slot - b.slot);

  return (
    <div className="checker-bg sticker overflow-x-auto bg-[#0e1547]/70 p-4">
      <div className="flex min-w-max items-stretch gap-4">
        {ROUNDS.map((round) => (
          <div key={round} className="flex w-60 flex-col">
            <h3 className="titlecard mb-2 text-center text-lg text-cream">
              {COL_TITLE[round]}
            </h3>
            <div
              className={`flex flex-1 flex-col justify-around gap-3 ${
                round === "FINAL" ? "justify-center" : ""
              }`}
            >
              {byRound(round).map((m) => (
                <MatchCard key={m.id} match={m} loggedIn={loggedIn} />
              ))}
            </div>
          </div>
        ))}

        {/* Champion column */}
        <div className="flex w-52 flex-col items-center justify-center">
          <h3 className="titlecard mb-2 text-center text-lg text-star">
            Champion
          </h3>
          <div className="sticker flex flex-col items-center gap-2 bg-gradient-to-b from-star/30 to-[#141a4d] p-4">
            <Trophy className="h-24 w-24 animate-trophy-shine" />
            {championName ? (
              <>
                <HeroMascot variant={"gold" as MascotVariant} className="h-16 w-16 animate-pop-in" />
                <span className="titlecard text-center text-lg text-cream">
                  {championName}
                </span>
              </>
            ) : (
              <span className="text-center text-xs text-cream/50">
                To be crowned
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
