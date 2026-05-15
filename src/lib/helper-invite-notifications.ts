import "server-only";

import { getCategoryLabel, getTaskTypeLabel } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { buildHelperInviteWhatsappMessage } from "@/lib/whatsapp";
import { sendWhatsappMessage } from "@/lib/whatsapp-provider";

export async function sendHelperInviteNotification(inviteId: string) {
  const invite = await prisma.leadInvite.findUnique({
    where: { id: inviteId },
    select: {
      id: true,
      inviteGroup: true,
      status: true,
      deliveryStatus: true,
      responseToken: true,
      helper: {
        select: {
          id: true,
          status: true,
          isActive: true,
          whatsappNumber: true,
        },
      },
      lead: {
        select: {
          id: true,
          category: true,
          taskType: true,
          deadline: true,
          budget: true,
          description: true,
        },
      },
    },
  });

  if (!invite) {
    console.warn("[helper-invites][delivery] invite missing", { inviteId });
    return { status: "failed" as const, reason: "Invite not found." };
  }

  if (invite.inviteGroup !== "PREFERRED") {
    await markInviteDeliveryFailed(invite.id, "Only preferred helper invites are auto-sent in Simple Mode.");
    return { status: "failed" as const, reason: "Invite is not preferred." };
  }

  if (invite.status !== "PENDING") {
    await markInviteDeliveryFailed(invite.id, "Invite is no longer pending.");
    return { status: "failed" as const, reason: "Invite is not pending." };
  }

  if (invite.deliveryStatus === "SENT") {
    return { status: "sent" as const, reason: "Invite was already sent." };
  }

  const helperEligible = invite.helper.status === "ACTIVE" && invite.helper.isActive;

  if (!helperEligible) {
    await markInviteDeliveryFailed(invite.id, "Preferred helper is no longer eligible for public invites.");
    return { status: "failed" as const, reason: "Helper is not eligible." };
  }

  const helperPhone = invite.helper.whatsappNumber?.trim();

  if (!helperPhone) {
    await markInviteDeliveryFailed(invite.id, "Helper WhatsApp number is missing.");
    return { status: "failed" as const, reason: "Helper WhatsApp is missing." };
  }

  const message = buildHelperInviteWhatsappMessage({
    category: getCategoryLabel(invite.lead.category),
    taskType: getTaskTypeLabel(invite.lead.taskType),
    deadline: invite.lead.deadline,
    budget: invite.lead.budget,
    briefSummary: invite.lead.description,
    acceptedToken: invite.responseToken,
    unavailableToken: invite.responseToken,
  });

  try {
    const result = await sendWhatsappMessage({
      to: helperPhone,
      message,
    });

    await prisma.leadInvite.update({
      where: { id: invite.id },
      data: {
        deliveryStatus: "SENT",
        deliveryAttemptedAt: new Date(),
        deliveryError: null,
      },
    });

    console.info("[helper-invites][delivery] sent", {
      inviteId: invite.id,
      provider: result.provider,
      providerMessageId: result.providerMessageId ?? null,
      helperId: invite.helper.id,
      leadId: invite.lead.id,
    });

    return { status: "sent" as const, provider: result.provider };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "WhatsApp delivery failed.";

    await markInviteDeliveryFailed(invite.id, message);
    console.warn("[helper-invites][delivery] failed", {
      inviteId: invite.id,
      helperId: invite.helper.id,
      leadId: invite.lead.id,
      error: message,
    });

    return { status: "failed" as const, reason: message };
  }
}

async function markInviteDeliveryFailed(inviteId: string, deliveryError: string) {
  await prisma.leadInvite.update({
    where: { id: inviteId },
    data: {
      deliveryStatus: "FAILED",
      deliveryAttemptedAt: new Date(),
      deliveryError,
    },
  });
}
