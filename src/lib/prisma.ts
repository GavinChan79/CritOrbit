import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionWarningShown?: boolean;
};

function getRuntimeDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const databaseUrl = new URL(rawUrl);

  if (
    process.env.NODE_ENV === "production" &&
    !databaseUrl.hostname.includes("-pooler.") &&
    !globalForPrisma.prismaConnectionWarningShown
  ) {
    console.warn(
      '[prisma] Production DATABASE_URL does not appear to use a Neon pooled host ("-pooler").',
    );
    globalForPrisma.prismaConnectionWarningShown = true;
  }

  if (!databaseUrl.searchParams.has("connect_timeout")) {
    databaseUrl.searchParams.set("connect_timeout", "15");
  }

  if (!databaseUrl.searchParams.has("pool_timeout")) {
    databaseUrl.searchParams.set("pool_timeout", "15");
  }

  return databaseUrl.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getRuntimeDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
