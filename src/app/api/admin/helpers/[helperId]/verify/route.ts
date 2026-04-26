import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { getAdminHelperVerificationFilePath, getHelperVerificationStatusLabel } from "@/lib/helper-verification";
import { prisma } from "@/lib/prisma";
import { helperVerificationStatusSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ helperId: string }> },
) {
  const session = await getAuthSession();
  const { helperId } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const json = await request.json();
    const parsed = helperVerificationStatusSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid verification payload." },
        { status: 400 },
      );
    }

    const verification = await prisma.helperVerification.findUnique({
      where: { helperId },
      select: { id: true },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification record not found." }, { status: 404 });
    }

    const status = parsed.data.status;

    const updated = await prisma.$transaction(async (tx) => {
      const currentHelper = await tx.helper.findUnique({
        where: { id: helperId },
        select: {
          trustLevel: true,
        },
      });

      const nextVerification = await tx.helperVerification.update({
        where: { helperId },
        data: {
          status,
          adminNote: parsed.data.adminNote,
        },
        select: {
          id: true,
          helperId: true,
          status: true,
          adminNote: true,
          updatedAt: true,
        },
      });

      await tx.helper.update({
        where: { id: helperId },
        data: {
          isVerified: status === "VERIFIED",
          trustLevel:
            status === "VERIFIED"
              ? currentHelper?.trustLevel === "TRUSTED_HELPER"
                ? "TRUSTED_HELPER"
                : "VERIFIED_HELPER"
              : "STANDARD_HELPER",
        },
      });

      return nextVerification;
    });

    revalidatePath("/admin/helpers");
    revalidatePath("/helper");
    revalidatePath("/helper/verification");
    revalidatePath("/helpers/select");
    revalidatePath(`/helpers/${helperId}`);
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      verification: {
        ...updated,
        icFrontUrl: getAdminHelperVerificationFilePath(helperId, "front"),
        icBackUrl: getAdminHelperVerificationFilePath(helperId, "back"),
        statusLabel: getHelperVerificationStatusLabel(updated.status),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to update helper verification." }, { status: 500 });
  }
}
