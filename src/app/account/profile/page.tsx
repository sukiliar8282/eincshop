import type { Metadata } from "next";

import { AvatarForm } from "./avatar-form";
import { Container } from "@/components/ui/container";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { ProfileForm } from "./profile-form";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const [sessionUser, { dict }] = await Promise.all([
    requireUser(),
    getDictionary(),
  ]);

  const user = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    select: {
      name: true,
      email: true,
      image: true,
    },
  });

  const currentImage = user?.image ?? sessionUser.image;
  const currentName = user?.name ?? sessionUser.name ?? "";
  const currentEmail = user?.email ?? sessionUser.email ?? "";

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {dict.common.account}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {dict.profile.title}
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            {dict.profile.subtitle}
          </p>

          <div className="mt-8">
            <AvatarForm currentImage={currentImage} />
          </div>

          <div className="mt-8">
            <ProfileForm name={currentName} email={currentEmail} />
          </div>
        </div>
      </Container>
    </main>
  );
}
