import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAccessibleHelperByEmail, getAuthSession } from "@/lib/auth";
import { sanitizeApplicationFileName } from "@/lib/helper-applications";
import {
  getHelperVerificationFilePath,
  getHelperVerificationStatusLabel,
  getVerificationFileSizeLimit,
  isAllowedVerificationFile,
} from "@/lib/helper-verification";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();

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
      id: true,
      status: true,
      adminNote: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    verification: verification
      ? {
          ...verification,
          icFrontUrl: getHelperVerificationFilePath("front"),
          icBackUrl: getHelperVerificationFilePath("back"),
          statusLabel: getHelperVerificationStatusLabel(verification.status),
        }
      : {
          id: null,
          status: "NONE",
          adminNote: null,
          updatedAt: null,
          icFrontUrl: null,
          icBackUrl: null,
          statusLabel: getHelperVerificationStatusLabel("NONE"),
        },
  });
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const helper = await getAccessibleHelperByEmail(session.user.email);

  if (!helper) {
    return NextResponse.json({ error: "Approved helper access required." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const icFrontFile = formData.get("icFront");
    const icBackFile = formData.get("icBack");

    if (!(icFrontFile instanceof File) || icFrontFile.size === 0) {
      return NextResponse.json({ error: "IC Front is required." }, { status: 400 });
    }

    if (!(icBackFile instanceof File) || icBackFile.size === 0) {
      return NextResponse.json({ error: "IC Back is required." }, { status: 400 });
    }

    const sizeLimit = getVerificationFileSizeLimit();
    const files = [icFrontFile, icBackFile];
    for (const file of files) {
      if (file.size > sizeLimit) {
        return NextResponse.json(
          { error: `${file.name} exceeds the 10MB limit.` },
          { status: 400 },
        );
      }

      if (!isAllowedVerificationFile(file.name, file.type || "")) {
        return NextResponse.json(
          { error: `${file.name} is not a supported file type.` },
          { status: 400 },
        );
      }
    }

    const verification = await prisma.helperVerification.upsert({
      where: { helperId: helper.id },
      update: {
        icFrontUrl: getHelperVerificationFilePath("front"),
        icBackUrl: getHelperVerificationFilePath("back"),
        icFrontFileName: sanitizeApplicationFileName(icFrontFile.name),
        icBackFileName: sanitizeApplicationFileName(icBackFile.name),
        icFrontMimeType: icFrontFile.type,
        icBackMimeType: icBackFile.type,
        icFrontContent: Buffer.from(await icFrontFile.arrayBuffer()),
        icBackContent: Buffer.from(await icBackFile.arrayBuffer()),
        status: "PENDING",
        adminNote: null,
      },
      create: {
        helperId: helper.id,
        icFrontUrl: getHelperVerificationFilePath("front"),
        icBackUrl: getHelperVerificationFilePath("back"),
        icFrontFileName: sanitizeApplicationFileName(icFrontFile.name),
        icBackFileName: sanitizeApplicationFileName(icBackFile.name),
        icFrontMimeType: icFrontFile.type,
        icBackMimeType: icBackFile.type,
        icFrontContent: Buffer.from(await icFrontFile.arrayBuffer()),
        icBackContent: Buffer.from(await icBackFile.arrayBuffer()),
        status: "PENDING",
      },
      select: {
        id: true,
        status: true,
        adminNote: true,
        updatedAt: true,
      },
    });

    await prisma.helper.update({
      where: { id: helper.id },
      data: {
        isVerified: false,
        trustLevel: "STANDARD_HELPER",
      },
    });

    revalidatePath("/helper");
    revalidatePath("/helper/verification");
    revalidatePath("/admin/helpers");
    revalidatePath("/helpers/select");
    revalidatePath(`/helpers/${helper.id}`);
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      verification: {
        ...verification,
        icFrontUrl: getHelperVerificationFilePath("front"),
        icBackUrl: getHelperVerificationFilePath("back"),
        statusLabel: getHelperVerificationStatusLabel(verification.status),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to upload verification files." }, { status: 500 });
  }
}
