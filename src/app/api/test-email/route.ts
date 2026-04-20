import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { buildHelperApplicationSubmittedEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const json = (await request.json()) as {
      to?: string;
      name?: string;
    };
    const to = json.to?.trim();

    if (!to) {
      return NextResponse.json({ error: "Recipient email is required." }, { status: 400 });
    }

    const template = buildHelperApplicationSubmittedEmail({
      name: json.name?.trim() || "CritOrbit Test User",
    });

    const result = await sendEmail({
      to,
      subject: `[Test] ${template.subject}`,
      html: template.html,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send test email.",
      },
      { status: 500 },
    );
  }
}
