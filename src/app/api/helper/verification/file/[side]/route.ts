import { NextResponse } from "next/server";
import { getAccessibleHelperByEmail, getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ side: string }> },
) {
  const session = await getAuthSession();
  const { side } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const helper = await getAccessibleHelperByEmail(session.user.email);

  if (!helper) {
    return NextResponse.json({ error: "Approved helper access required." }, { status: 403 });
  }

  const verification = await prisma.helperVerification.findUnique({
    where: { helperId: helper.id },
    select: {
      icFrontFileName: true,
      icFrontMimeType: true,
      icFrontContent: true,
      icBackFileName: true,
      icBackMimeType: true,
      icBackContent: true,
    },
  });

  if (!verification) {
    return NextResponse.json({ error: "Verification file not found." }, { status: 404 });
  }

  if (side === "front") {
    return new NextResponse(Buffer.from(verification.icFrontContent), {
      headers: {
        "Content-Type": verification.icFrontMimeType,
        "Content-Disposition": `inline; filename="${verification.icFrontFileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  if (side === "back") {
    return new NextResponse(Buffer.from(verification.icBackContent), {
      headers: {
        "Content-Type": verification.icBackMimeType,
        "Content-Disposition": `inline; filename="${verification.icBackFileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  return NextResponse.json({ error: "Invalid verification side." }, { status: 400 });
}
