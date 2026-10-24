import type { UserRole } from "@/generated/prisma";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/security/password";
import { credentialsSchema } from "@/lib/validation/auth";

// NO SILENT FAILURES: Validasi keras keberadaan AUTH_SECRET
if (!process.env.AUTH_SECRET) {
  throw new Error(
    "FATAL ERROR [Auth]: AUTH_SECRET belum dikonfigurasi di file .env Anda! " +
      "NextAuth memerlukan AUTH_SECRET untuk mengenkripsi dan mendekripsi JWT session token.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(
    prisma as unknown as Parameters<typeof PrismaAdapter>[0],
  ),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    // 1. Google OAuth Provider (1-Klik Login Otomatis)
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Mitigasi F-02: Dinonaktifkan untuk mencegah silent account takeover antar-metode login
      allowDangerousEmailAccountLinking: false,
    }),

    // 2. Email & Password Credentials (Wajib @gmail.com)
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsed.data.email,
          },
        });

        if (!user || !user.passwordHash || user.status !== "ACTIVE") {
          return null;
        }

        const passwordIsValid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );

        if (!passwordIsValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role as UserRole,
        };
      },
    }),
  ],

  callbacks: {
    // Kunci keamanan: Validasi domain, email_verified, dan status akun aktif
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email?.toLowerCase();
        if (!email || !email.endsWith("@gmail.com")) {
          return false;
        }

        // Verifikasi kepemilikan email dari Google
        if ("email_verified" in profile && profile.email_verified === false) {
          return false;
        }

        // Pastikan akun di database tidak dalam status SUSPENDED
        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: { status: true },
        });

        if (existingUser && existingUser.status !== "ACTIVE") {
          return false;
        }

        return true;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role ?? "CUSTOMER";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) || (token.sub as string);
        if (token.role) {
          session.user.role = token.role as UserRole;
        }
      }

      return session;
    },
  },

  trustHost: true,
});
