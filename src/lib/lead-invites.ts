import "server-only";

import { addMinutes } from "date-fns";
import type { Helper, Lead } from "@prisma/client";
import { sendHelperInviteNotification } from "@/lib/helper-invite-notifications";
import { prisma } from "@/lib/prisma";
import { parseSpecialties, specialtyMatchesTaskType } from "@/lib/helpers";
import { rankHelpersByConversion } from "@/lib/helper-ranking";
import { getHelperCompletionScore } from "@/lib/helper-ranking";
import { createLeadInviteResponseToken } from "@/lib/lead-invite-response";
import { getHelperEventPerformanceMap, getPublicHelpers, publicHelperWhere } from "@/lib/public-helpers";
import { logServerDataLoadError } from "@/lib/server-load";

const leadInviteExpiryMinutes = 15;
const backupInviteLimit = 3;
const simpleModeEnabled = true;
const simpleModeFallbackInviteLimit = 1;

type DispatchLead = Pick<Lead, "id" | "category" | "taskType" | "selectedHelperId">;

type RankingHelper = Pick<
  Helper,
  | "id"
  | "type"
  | "isVerified"
  | "trustLevel"
  | "responseTime"
  | "projectsCompleted"
  | "studentsHelpedCount"
  | "lastBookedAt"
  | "category"
  | "specialties"
  | "name"
  | "shortBio"
  | "email"
  | "whatsappNumber"
  | "deliveryTime"
  | "portfolioNote"
  | "teamSize"
> & {
  _count: {
    portfolioItems: number;
  };
  verification: {
    status: "PENDING" | "VERIFIED" | "REJECTED";
  } | null;
};

export async function dispatchLeadInvites(input: { lead: DispatchLead }) {
  const existingInvites = await prisma.leadInvite.findMany({
    where: { leadId: input.lead.id },
    select: {
      helperId: true,
      inviteGroup: true,
      status: true,
    },
  });

  const selectedHelperId = input.lead.selectedHelperId;

  if (selectedHelperId) {
    const selectedInvite = existingInvites.find((invite) => invite.helperId === selectedHelperId);
    const selectedEligible = await prisma.helper.findFirst({
      where: {
        AND: [publicHelperWhere, { id: selectedHelperId }],
      },
      select: { id: true },
    });

    if (selectedEligible) {
      if (!selectedInvite) {
        const invite = await createLeadInvite({
          leadId: input.lead.id,
          helperId: selectedHelperId,
          inviteGroup: "PREFERRED",
          round: 1,
        });

        try {
          await sendHelperInviteNotification(invite.id);
        } catch (error) {
          logServerDataLoadError("preferred-helper-invite-delivery", error);
        }
      }

      if (simpleModeEnabled || !selectedInvite || !canDispatchBackupsAfterStatus(selectedInvite.status)) {
        return;
      }
    }
  }

  await dispatchBackupInvites({
    lead: input.lead,
    existingInvites,
  });
}

async function dispatchBackupInvites(input: {
  lead: DispatchLead;
  existingInvites: Array<{
    helperId: string;
    inviteGroup: "PREFERRED" | "BACKUP";
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "UNAVAILABLE";
  }>;
}) {
  const existingHelperIds = new Set(input.existingInvites.map((invite) => invite.helperId));
  const helpers = await getRankedBackupHelpers(input.lead);
  const backupHelpers = helpers
    .filter((helper) => helper.id !== input.lead.selectedHelperId)
    .filter((helper) => !existingHelperIds.has(helper.id))
    .slice(0, simpleModeEnabled ? simpleModeFallbackInviteLimit : backupInviteLimit);

  if (backupHelpers.length === 0) {
    return;
  }

  await prisma.leadInvite.createMany({
    data: backupHelpers.map((helper) =>
      createLeadInviteData({
        leadId: input.lead.id,
        helperId: helper.id,
        inviteGroup: "BACKUP",
        round: input.lead.selectedHelperId ? 2 : 1,
      }),
    ),
    skipDuplicates: true,
  });
}

async function createLeadInvite(input: {
  leadId: string;
  helperId: string;
  inviteGroup: "PREFERRED" | "BACKUP";
  round: number;
}) {
  const inviteData = createLeadInviteData(input);

  return prisma.leadInvite.create({
    data: inviteData,
    select: {
      id: true,
    },
  });
}

function createLeadInviteData(input: {
  leadId: string;
  helperId: string;
  inviteGroup: "PREFERRED" | "BACKUP";
  round: number;
}) {
  const token = createLeadInviteResponseToken();

  return {
    leadId: input.leadId,
    helperId: input.helperId,
    responseToken: token,
    inviteGroup: input.inviteGroup,
    round: input.round,
    status: "PENDING" as const,
    sentAt: new Date(),
    expiresAt: addMinutes(new Date(), leadInviteExpiryMinutes),
  };
}

function canDispatchBackupsAfterStatus(status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "UNAVAILABLE") {
  return status === "DECLINED" || status === "EXPIRED" || status === "UNAVAILABLE";
}

async function getRankedBackupHelpers(lead: DispatchLead) {
  const helpers = await getPublicHelpers({
    select: {
      id: true,
      type: true,
      isVerified: true,
      trustLevel: true,
      responseTime: true,
      projectsCompleted: true,
      studentsHelpedCount: true,
      lastBookedAt: true,
      category: true,
      specialties: true,
      name: true,
      shortBio: true,
      email: true,
      whatsappNumber: true,
      deliveryTime: true,
      portfolioNote: true,
      teamSize: true,
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

  const performanceMap = await getSafeHelperEventPerformanceMap(helpers.map((helper) => helper.id));

  return rankHelpersByConversion(
    helpers.map((helper) => {
      const specialties = parseSpecialties(helper.specialties);
      const performance = performanceMap.get(helper.id);

      return {
        ...helper,
        portfolioItemsCount: helper._count.portfolioItems,
        categoryMatch: helper.category === lead.category,
        taskTypeMatch: specialtyMatchesTaskType(specialties, lead.taskType),
        completionScore: getHelperCompletionScore({
          name: helper.name,
          shortBio: helper.shortBio,
          email: helper.email,
          whatsappNumber: helper.whatsappNumber,
          responseTime: helper.responseTime,
          deliveryTime: helper.deliveryTime,
          portfolioNote: helper.portfolioNote,
          specialties: helper.specialties,
          type: helper.type,
          trustLevel: helper.trustLevel,
          teamSize: helper.teamSize,
          portfolioItemsCount: helper._count.portfolioItems,
          verificationStatus: helper.verification?.status ?? "NONE",
        }),
        profileViewCount: performance?.profileViewCount ?? 0,
        getHelpClickCount: performance?.getHelpClickCount ?? 0,
        whatsappRedirectCount: performance?.whatsappRedirectCount ?? 0,
      };
    }),
  );
}

async function getSafeHelperEventPerformanceMap(helperIds: string[]) {
  try {
    return await getHelperEventPerformanceMap(helperIds);
  } catch (error) {
    logServerDataLoadError("lead-invite-performance", error);
    return new Map<
      string,
      {
        profileViewCount: number;
        getHelpClickCount: number;
        whatsappRedirectCount: number;
      }
    >();
  }
}
