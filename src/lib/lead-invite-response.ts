import "server-only";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function createLeadInviteResponseToken() {
  return randomBytes(24).toString("hex");
}

export function getLeadInviteResponseUrl(token: string, decision: "accepted" | "declined" | "unavailable") {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return `${baseUrl.replace(/\/$/, "")}/helper/opportunities/respond?token=${encodeURIComponent(token)}&decision=${encodeURIComponent(decision)}`;
}

export async function getLeadInviteByToken(token: string) {
  return prisma.leadInvite.findFirst({
    where: { responseToken: token },
    select: {
      id: true,
      leadId: true,
      helperId: true,
      responseToken: true,
      inviteGroup: true,
      round: true,
      status: true,
      estimatedPrice: true,
      availabilityNote: true,
      sentAt: true,
      respondedAt: true,
      expiresAt: true,
      helper: {
        select: {
          id: true,
          name: true,
          status: true,
          isActive: true,
        },
      },
      lead: {
        select: {
          id: true,
          category: true,
          taskType: true,
          deadline: true,
          selectedHelperId: true,
        },
      },
    },
  });
}
