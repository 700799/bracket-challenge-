import { HeroRunning, HeroKicking, HeroGoalie, SoccerBall } from "@/components/art/mascots";
import { CheckeredFlag } from "@/components/art/icons";

/** Big Kart-Hero title banner with soccer action mascots. */
export function HeroBanner({ tournamentName }: { tournamentName: string }) {
  return (
    <section className="checker-bg sticker relative overflow-hidden bg-gradient-to-br from-cobalt via-[#0e1547] to-power p-5 sm:p-8">
      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <span className="chip bg-star text-ink">⚽ Bracket Challenge</span>
        <h1 className="titlecard text-4xl text-star sm:text-6xl">
          {tournamentName}
        </h1>
        <p className="max-w-xl font-display text-sm text-cream/80 sm:text-base">
          Predict every score from the Round of 16 to the Final. Rack up coins,
          climb the leaderboard, and dodge the workout punishments.
        </p>
      </div>

      {/* action mascots */}
      <HeroKicking
        variant="red"
        className="pointer-events-none absolute -bottom-2 left-1 h-24 w-24 animate-hero-run sm:h-36 sm:w-36"
      />
      <HeroRunning
        variant="green"
        className="pointer-events-none absolute -top-2 right-2 hidden h-24 w-24 animate-hero-run sm:block sm:h-32 sm:w-32"
      />
      <HeroGoalie
        variant="purple"
        className="pointer-events-none absolute bottom-0 right-1 h-20 w-20 sm:h-28 sm:w-28"
      />
      <CheckeredFlag className="pointer-events-none absolute left-3 top-3 hidden h-12 w-12 opacity-80 sm:block" />
      <svg className="pointer-events-none absolute bottom-3 left-1/2 hidden h-8 w-8 animate-ball-spin sm:block" viewBox="0 0 48 48">
        <SoccerBall size={48} />
      </svg>
    </section>
  );
}
