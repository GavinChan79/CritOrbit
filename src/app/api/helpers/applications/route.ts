import { NextResponse } from "next/server";
import { HelperStatus, HelperType } from "@prisma/client";
import { sendHelperOnboardingEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  getHelperApplicationMessage,
  isAllowedApplicationFile,
  maxApplicationFileSizeBytes,
  maxPortfolioFiles,
  sanitizeApplicationFileName,
} from "@/lib/helper-applications";
import { helperApplicationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = {
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "INDIVIDUAL"),
      teamSize: formData.get("teamSize") ? Number(formData.get("teamSize")) : null,
      category: String(formData.get("category") ?? ""),
      experience: String(formData.get("experience") ?? ""),
      portfolioNote: String(formData.get("portfolioNote") ?? ""),
      email: String(formData.get("email") ?? ""),
      whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
      confirmations: {
        originalWork: formData.get("confirmations.originalWork") === "true",
        noScamGhosting: formData.get("confirmations.noScamGhosting") === "true",
        platformLiability: formData.get("confirmations.platformLiability") === "true",
        deadlinesCommunication:
          formData.get("confirmations.deadlinesCommunication") === "true",
        serviceTerms: formData.get("confirmations.serviceTerms") === "true",
      },
    };
    const parsed = helperApplicationSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid helper application." },
        { status: 400 },
      );
    }

    const portfolioFiles = formData
      .getAll("portfolioFiles")
      .filter((value): value is File => value instanceof File && value.size > 0);
    const identityFrontFile = formData.get("identityFrontFile");
    const identityBackFile = formData.get("identityBackFile");

    if (portfolioFiles.length === 0 || portfolioFiles.length > maxPortfolioFiles) {
      return NextResponse.json(
        { error: `Upload between 1 and ${maxPortfolioFiles} portfolio files.` },
        { status: 400 },
      );
    }

    if (!(identityFrontFile instanceof File) || identityFrontFile.size === 0) {
      return NextResponse.json({ error: "IC Front is required." }, { status: 400 });
    }

    if (!(identityBackFile instanceof File) || identityBackFile.size === 0) {
      return NextResponse.json({ error: "IC Back is required." }, { status: 400 });
    }

    const allFiles = [...portfolioFiles, identityFrontFile, identityBackFile];
    for (const file of allFiles) {
      if (file.size > maxApplicationFileSizeBytes) {
        return NextResponse.json(
          { error: `${file.name} exceeds the 10MB limit.` },
          { status: 400 },
        );
      }

      if (!isAllowedApplicationFile(file.name, file.type || "")) {
        return NextResponse.json(
          { error: `${file.name} is not a supported file type.` },
          { status: 400 },
        );
      }
    }

    const helper = await prisma.helper.create({
      data: {
        name: parsed.data.name.trim(),
        type: parsed.data.type as HelperType,
        teamSize: parsed.data.type === "TEAM" ? parsed.data.teamSize : null,
        status: HelperStatus.PENDING,
        category: parsed.data.category,
        shortBio: parsed.data.experience.trim(),
        portfolioNote: parsed.data.portfolioNote?.trim(),
        email: parsed.data.email.toLowerCase(),
        whatsappNumber: parsed.data.whatsappNumber,
        agreedToTerms: true,
        agreedAt: new Date(),
        isVerified: false,
        isActive: false,
        displayOrder: 0,
        specialties: [],
        applicationFiles: {
          create: await Promise.all(
            [
              ...portfolioFiles.map(async (file, index) => ({
                kind: "PORTFOLIO" as const,
                fileName: sanitizeApplicationFileName(file.name),
                mimeType: file.type,
                sizeBytes: file.size,
                content: Buffer.from(await file.arrayBuffer()),
                createdAt: new Date(Date.now() + index),
              })),
              {
                kind: "IDENTITY_FRONT" as const,
                fileName: sanitizeApplicationFileName(identityFrontFile.name),
                mimeType: identityFrontFile.type,
                sizeBytes: identityFrontFile.size,
                content: Buffer.from(await identityFrontFile.arrayBuffer()),
              },
              {
                kind: "IDENTITY_BACK" as const,
                fileName: sanitizeApplicationFileName(identityBackFile.name),
                mimeType: identityBackFile.type,
                sizeBytes: identityBackFile.size,
                content: Buffer.from(await identityBackFile.arrayBuffer()),
              },
            ],
          ),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        whatsappNumber: true,
      },
    });

    try {
      await sendHelperOnboardingEmail(helper, "submitted");
    } catch (error) {
      console.error("[email] Failed to send helper application submitted email.", {
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
