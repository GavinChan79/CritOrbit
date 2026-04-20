import { NextResponse } from "next/server";
import { HelperStatus, HelperType } from "@prisma/client";
import { sendHelperApplicationReceived } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getHelperApplicationMessage } from "@/lib/helper-applications";
import { helperApplicationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = helperApplicationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid helper application." },
        { status: 400 },
      );
    }

    const helper = await prisma.helper.create({
      data: {
        name: parsed.data.name.trim(),
        type: parsed.data.type as HelperType,
        teamSize: parsed.data.type === "TEAM" ? parsed.data.teamSize : null,
        status: HelperStatus.PENDING,
        category: parsed.data.category,
        shortBio: parsed.data.experience.trim(),
        portfolioNote: parsed.data.portfolioNote.trim(),
        email: parsed.data.email.toLowerCase(),
        whatsappNumber: parsed.data.whatsappNumber,
        agreedToTerms: true,
        agreedAt: new Date(),
        isVerified: false,
        isActive: false,
        displayOrder: 0,
        specialties: [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        whatsappNumber: true,
      },
    });

    try {
      await sendHelperApplicationReceived(helper);
    } catch (error) {
      console.error("[notifications] Failed to send helper application received notification.", {
        helperId: helper.id,
        error,
      });
    }

    return NextResponse.json({
      success: true,
      helperId: helper.id,
      message: getHelperApplicationMessage("SUBMIT", helper.name),
    });
  } catch {
    return NextResponse.json({ error: "Failed to submit helper application." }, { status: 500 });
  }
}
