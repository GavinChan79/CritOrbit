import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { HelperStatus, UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { sendHelperOnboardingEmail } from "@/lib/email";
import {
  getHelperApplicationMessage,
} from "@/lib/helper-applications";
import { prisma } from "@/lib/prisma";
import { helperApplicationDecisionSchema } from "@/lib/validators";

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
    const parsed = helperApplicationDecisionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid application decision." },
        { status: 400 },
      );
    }

    const decision = parsed.data.status;
    const helper = await prisma.helper.update({
      where: { id: helperId },
      data: {
        status: decision as HelperStatus,
        isActive: false,
        trustLevel: "STANDARD_HELPER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        whatsappNumber: true,
        status: true,
      },
    });

    const notificationStatus = decision === "APPROVED" ? "APPROVED" : "REJECTED";

    try {
      if (decision === "APPROVED") {
        await sendHelperOnboardingEmail(helper, "approved");
      } else {
        await sendHelperOnboardingEmail(helper, "rejected");
      }
    } catch (error) {
      console.error("[email] Failed to send helper application decision email.", {
        helperId: helper.id,
        decision,
        error,
      });
    }

    revalidatePath("/admin/applications");
    revalidatePath("/admin/helpers");
    revalidatePath("/helpers/select");
    revalidatePath("/become-helper");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      helper,
      message: getHelperApplicationMessage(notificationStatus, helper.name),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update helper application." }, { status: 500 });
  }
}
