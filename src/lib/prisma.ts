import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionWarningShown?: boolean;
  prismaEnvWarningShown?: boolean;
  prismaInitInfoShown?: boolean;
};

const databaseUrlCandidates = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "CRITORBIT_DATABASE_URL",
] as const;

function logPrismaConfigError(message: string, details?: Record<string, unknown>) {
  console.error("[prisma:init] " + message, details ?? {});
}

function getRuntimeDatabaseUrl() {
  const checkedEnvKeys = new Set<string>();

  for (const envKey of databaseUrlCandidates) {
    const rawUrl = process.env[envKey];

    if (typeof rawUrl !== "string" || !rawUrl.trim()) {
      continue;
    }

    checkedEnvKeys.add(envKey);

    let databaseUrl: URL;

    try {
      databaseUrl = new URL(rawUrl.trim());
    } catch (error) {
      logPrismaConfigError("Database URL is malformed.", {
        envKey,
        error,
      });
      continue;
    }

    if (
      envKey !== "DATABASE_URL" &&
      process.env.NODE_ENV === "production" &&
      !globalForPrisma.prismaEnvWarningShown
    ) {
      console.warn(`[prisma:init] Using fallback database env: ${envKey}.`);
      globalForPrisma.prismaEnvWarningShown = true;
    }

    if (
      process.env.NODE_ENV === "production" &&
      !databaseUrl.hostname.includes("-pooler.") &&
      !globalForPrisma.prismaConnectionWarningShown
    ) {
      console.warn(
        `[prisma:init] Production ${envKey} does not appear to use a Neon pooled host ("-pooler").`,
      );
      globalForPrisma.prismaConnectionWarningShown = true;
    }

    if (!databaseUrl.searchParams.has("connect_timeout")) {
      databaseUrl.searchParams.set("connect_timeout", "15");
    }

    if (!databaseUrl.searchParams.has("pool_timeout")) {
      databaseUrl.searchParams.set("pool_timeout", "15");
    }

    if (process.env.NODE_ENV === "production" && !globalForPrisma.prismaInitInfoShown) {
      console.info("[prisma:init] Prisma datasource prepared.", {
        envKey,
        host: databaseUrl.hostname,
        pooled: databaseUrl.hostname.includes("-pooler."),
      });
      globalForPrisma.prismaInitInfoShown = true;
    }

    return databaseUrl.toString();
  }

  logPrismaConfigError("No usable database URL was found.", {
    checked: checkedEnvKeys.size ? Array.from(checkedEnvKeys) : databaseUrlCandidates,
  });
  throw new Error("No valid database URL is configured.");
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
