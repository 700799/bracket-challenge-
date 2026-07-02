import { ROUND_WEIGHT, POINTS } from "@/lib/scoring";
import { Coin, Star, PenaltyIcon, CheckBadge } from "@/components/art/icons";
import { KartLink } from "@/components/ui/buttons";

export const metadata = { title: "How scoring works — Kart Hero Cup" };

export default function RulesPage() {
  const rows = [
    { icon: <CheckBadge className="h-6 w-6" />, name: "Correct winner", pts: `${POINTS.WINNER} pts`, note: "Right team advances (penalty-shootout winner counts)." },
    { icon: <Star className="h-6 w-6" />, name: "Exact score", pts: `${POINTS.EXACT} pts`, note: "Both teams' goals spot on." },
    { icon: <Coin className="h-6 w-6" />, name: "Close score", pts: `up to ${POINTS.CLOSE_MAX} pts`, note: "3 minus your total goal error (when not exact)." },
    { icon: <PenaltyIcon className="h-6 w-6" />, name: "Called the shootout", pts: `${POINTS.PENALTY} pts`, note: "Predicted penalties AND the correct winner." },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="titlecard text-3xl text-star">How scoring works</h1>

      <div className="sticker bg-[#141a4d] p-4">
        <h2 className="titlecard mb-3 text-xl text-cream">Points per pick</h2>
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.name} className="flex items-center gap-3">
              {r.icon}
              <div className="flex-1">
                <div className="font-display text-cream">{r.name}</div>
                <div className="text-xs text-cream/60">{r.note}</div>
              </div>
              <span className="titlecard text-star">{r.pts}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sticker bg-[#141a4d] p-4">
        <h2 className="titlecard mb-3 text-xl text-cream">Round multipliers</h2>
        <p className="mb-3 text-sm text-cream/70">
          Every point you earn is multiplied by the round weight — later rounds
          are worth much more, so the final can swing the whole leaderboard.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["R16", "QF", "SF", "FINAL"] as const).map((r) => (
            <div key={r} className="sticker bg-cobalt p-3 text-center">
              <div className="titlecard text-lg text-cream">{r}</div>
              <div className="titlecard text-2xl text-star">×{ROUND_WEIGHT[r]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticker bg-[#141a4d] p-4 text-sm text-cream/70">
        <h2 className="titlecard mb-2 text-xl text-cream">Deadline & locks</h2>
        Picks lock at the deadline the admin sets (see the countdown on the home
        page). Individual matches also lock once they kick off. Ties on the
        leaderboard are broken by most exact scores, then earliest signup.
      </div>

      <div className="flex justify-center">
        <KartLink href="/" color="gold">Back to the bracket</KartLink>
      </div>
    </div>
  );
}
