import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logServerDataLoadError } from "@/lib/server-load";

export const publicHelperWhere = {
  status: "ACTIVE",
  isActive: true,
} satisfies Prisma.HelperWhereInput;

export function getPublicHelpers<T extends Prisma.HelperFindManyArgs>(
  args?: Prisma.SelectSubset<T, Prisma.HelperFindManyArgs>,
) {
  const normalizedArgs = (args ?? {}) as Prisma.HelperFindManyArgs;
  const { where, ...rest } = normalizedArgs;

  return prisma.helper.findMany({
    ...rest,
    where: {
      AND: [publicHelperWhere, where ?? {}],
    },
  }) as Prisma.PrismaPromise<Prisma.HelperGetPayload<T>[]>;
}

export function getPublicHelperById<T extends Omit<Prisma.HelperFindFirstArgs, "where">>(
  helperId: string,
  args?: Prisma.SelectSubset<T, Omit<Prisma.HelperFindFirstArgs, "where">>,
) {
  const normalizedArgs = (args ?? {}) as Omit<Prisma.HelperFindFirstArgs, "where">;
  const { ...rest } = normalizedArgs;

  return prisma.helper.findFirst({
    ...rest,
    where: {
      AND: [publicHelperWhere, { id: helperId }],
    },
  }) as Prisma.PrismaPromise<Prisma.HelperGetPayload<T> | null>;
}

export async function getHelperEventPerformanceMap(helperIds: string[]) {
  if (helperIds.length === 0) {
    return new Map<
      string,
      {
        profileViewCount: number;
        getHelpClickCount: number;
        whatsappRedirectCount: number;
      }
    >();
  }

  try {
    const grouped = await prisma.eventLog.groupBy({
      by: ["helperId", "eventType"],
      where: {
        helperId: {
          in: helperIds,
        },
        eventType: {
          in: ["VIEW_HELPER_PROFILE", "CLICK_GET_HELP", "WHATSAPP_REDIRECT"],
        },
      },
      _count: {
        _all: true,
      },
    });

    const performanceMap = new Map<
      string,
      {
        profileViewCount: number;
        getHelpClickCount: number;
        whatsappRedirectCount: number;
      }
    >();

    for (const entry of grouped) {
      if (!entry.helperId) {
        continue;
      }

      const current = performanceMap.get(entry.helperId) ?? {
        profileViewCount: 0,
        getHelpClickCount: 0,
        whatsappRedirectCount: 0,
      };

      if (entry.eventType === "VIEW_HELPER_PROFILE") {
        current.profileViewCount = entry._count._all;
      } else if (entry.eventType === "CLICK_GET_HELP") {
        current.getHelpClickCount = entry._count._all;
      } else if (entry.eventType === "WHATSAPP_REDIRECT") {
        current.whatsappRedirectCount = entry._count._all;
      }

      performanceMap.set(entry.helperId, current);
    }

    return performanceMap;
  } catch (error) {
    logServerDataLoadError("public-helper-event-performance", error);
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
