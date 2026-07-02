import { redirect } from "next/navigation";
import { getCurrentPlayer } from "@/lib/session";
import { ProfileForm } from "@/components/ProfileForm";
import { KartLink } from "@/components/ui/buttons";
import { DEFAULT_AVATAR } from "@/components/art/avatars";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const player = await getCurrentPlayer();
  if (!player) redirect("/login?callbackUrl=/me");

  const { user, profile } = player;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="titlecard text-3xl text-star">My Hero</h1>

      <div className="sticker bg-[#141a4d] p-5">
        <ProfileForm
          initialUsername={profile?.username ?? ""}
          initialAvatar={profile?.mascotVariant ?? DEFAULT_AVATAR}
        />
      </div>

      <div className="sticker bg-[#0e1547]/70 p-4 text-sm text-cream/70">
        <p>
          Signed in as <b className="text-cream">{user.email}</b>.
        </p>
        <p className="mt-1">
          Your real name and email are private — only the tournament admin can
          see them. Everyone else just sees your username.
        </p>
      </div>

      {profile ? (
        <div className="flex justify-center">
          <KartLink href="/" color="gold">
            Back to the bracket
          </KartLink>
        </div>
      ) : null}
    </div>
  );
}
