import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";
import { HeroAvatar } from "@/components/art/avatars";
import { Star } from "@/components/art/icons";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const session = await auth();
  if (session?.user) redirect(callbackUrl || "/me");

  return (
    <div className="mx-auto max-w-md">
      <div className="sticker bg-gradient-to-b from-cobalt to-[#141a4d] p-8 text-center">
        <div className="mb-3 flex justify-center gap-2">
          <HeroAvatar avatarId="fire-fury" className="h-16 w-16" />
          <HeroAvatar avatarId="bolt-brawler" className="h-16 w-16" />
          <HeroAvatar avatarId="golden-boot" className="h-16 w-16" />
        </div>
        <p className="text-xs text-cream/60">Pick from 50 hero avatars after you join.</p>
        <h1 className="titlecard text-3xl text-star">Join the Cup</h1>
        <p className="mt-2 text-sm text-cream/80">
          Sign in to make your bracket picks and climb the leaderboard.
        </p>

        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl || "/me" });
          }}
        >
          <button className="kart-btn bg-cream text-ink w-full">
            <Star className="h-5 w-5" /> Continue with Google
          </button>
        </form>

        <p className="mt-4 text-xs text-cream/50">
          More sign-in options (Facebook, X) coming soon.
        </p>
      </div>
    </div>
  );
}
