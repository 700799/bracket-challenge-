import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { signOut } from "@/auth";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { KartLink } from "@/components/ui/buttons";
import { CheckeredFlag } from "@/components/art/icons";

/** Top navigation: brand, admin link (admins only), sound toggle, auth. */
export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b-4 border-ink bg-[#0a0a2e]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <CheckeredFlag className="h-9 w-9 drop-shadow" />
          <span className="titlecard text-xl text-star sm:text-2xl">
            KART&nbsp;HERO CUP
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <SoundToggle />
          {user?.isAdmin ? (
            <KartLink href="/admin" color="purple" className="!py-1.5 text-sm">
              Admin
            </KartLink>
          ) : null}
          {user ? (
            <>
              <KartLink href="/me" color="cream" className="!py-1.5 text-sm">
                My Hero
              </KartLink>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="kart-btn bg-racing text-cream !py-1.5 text-sm">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <KartLink href="/login" color="green" className="!py-1.5 text-sm">
              Sign in
            </KartLink>
          )}
        </nav>
      </div>
    </header>
  );
}
