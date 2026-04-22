import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
