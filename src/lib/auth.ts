import "server-only";

import bcrypt from "bcryptjs";
import { HelperStatus, UserRole } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const helperDashboardStatuses = [HelperStatus.APPROVED, HelperStatus.ACTIVE] as const;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = (token.role as UserRole | undefined) ?? UserRole.STUDENT;
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  return session;
}

export async function getAccessibleHelperByEmail(email?: string | null) {
  if (!email) {
    return null;
  }

  return prisma.helper.findFirst({
    where: {
      email: email.toLowerCase(),
      status: {
        in: [...helperDashboardStatuses],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      type: true,
      status: true,
      category: true,
      shortBio: true,
      portfolioNote: true,
      whatsappNumber: true,
      responseTime: true,
      deliveryTime: true,
      submittedPriceAnchor: true,
      priceAnchor: true,
      priceLockedByAdmin: true,
      specialties: true,
      teamSize: true,
      projectsCompleted: true,
      _count: {
        select: {
          portfolioItems: true,
        },
      },
      verification: {
        select: {
          status: true,
        },
      },
    },
  });
}

export async function requireApprovedHelper() {
  const session = await requireUser();
  const helper = await getAccessibleHelperByEmail(session.user.email);

  if (!helper) {
    redirect("/dashboard");
  }

  return { session, helper };
}
