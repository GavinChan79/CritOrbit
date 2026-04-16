import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("critorbit123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@critorbit.com",
    },
    update: {
      name: "CritOrbit Admin",
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      name: "CritOrbit Admin",
      email: "admin@critorbit.com",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  // Clean up the legacy admin login so only the current credential remains valid.
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["admin@critorbit.my", "admin@critstudio.my"],
      },
    },
  });

  console.log(`Admin account ready: ${admin.email} (${admin.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
