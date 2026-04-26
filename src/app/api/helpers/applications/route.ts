import { NextResponse } from "next/server";
import {
  HelperPriceAnchor,
  HelperStatus,
  HelperType,
  Prisma,
} from "@prisma/client";
import { sendHelperOnboardingEmail } from "@/lib/email";
import { getHelperExperienceLevelLabel } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import {
  getHelperApplicationMessage,
  maxPortfolioFiles,
} from "@/lib/helper-applications";
import { helperApplicationSubmissionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = helperApplicationSubmissionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid helper application." },
        { status: 400 },
      );
    }

    const portfolioFiles = parsed.data.portfolioFiles;
    const identityFrontFile = parsed.data.identityFrontFile ?? null;
    const identityBackFile = parsed.data.identityBackFile ?? null;

    if (portfolioFiles.length === 0 || portfolioFiles.length > maxPortfolioFiles) {
      return NextResponse.json(
        { error: `Upload between 1 and ${maxPortfolioFiles} portfolio files.` },
        { status: 400 },
      );
    }

    const hasIdentityFront = Boolean(identityFrontFile);
    const hasIdentityBack = Boolean(identityBackFile);

    if (hasIdentityFront !== hasIdentityBack) {
      return NextResponse.json(
        { error: "Upload both IC Front and IC Back, or leave both blank." },
        { status: 400 },
      );
    }

    const identityFileEntries =
      hasIdentityFront && hasIdentityBack && identityFrontFile && identityBackFile
        ? [
            {
              kind: "IDENTITY_FRONT" as const,
              fileName: identityFrontFile.filename,
              mimeType: identityFrontFile.contentType,
              sizeBytes: identityFrontFile.size,
              content: Buffer.alloc(0),
              blobUrl: identityFrontFile.url,
              blobPathname: identityFrontFile.pathname,
            },
            {
              kind: "IDENTITY_BACK" as const,
              fileName: identityBackFile.filename,
              mimeType: identityBackFile.contentType,
              sizeBytes: identityBackFile.size,
              content: Buffer.alloc(0),
              blobUrl: identityBackFile.url,
              blobPathname: identityBackFile.pathname,
            },
          ]
        : [];

    const helper = await prisma.helper.create({
      data: {
        name: parsed.data.name.trim(),
        type: parsed.data.type as HelperType,
        teamSize: parsed.data.type === "TEAM" ? parsed.data.teamSize : null,
        status: HelperStatus.PENDING,
        category: parsed.data.category,
        shortBio: getHelperExperienceLevelLabel(parsed.data.experience),
        experienceLevel: parsed.data.experience,
        submittedPriceAnchor: parsed.data.priceAnchor as HelperPriceAnchor,
        priceAnchor: parsed.data.priceAnchor as HelperPriceAnchor,
        priceLockedByAdmin: false,
        portfolioNote: parsed.data.portfolioNote?.trim(),
        email: parsed.data.email.toLowerCase(),
        whatsappNumber: parsed.data.whatsappNumber,
        agreedToTerms: true,
        agreedAt: new Date(),
        isVerified: false,
        trustLevel: "STANDARD_HELPER",
        isActive: false,
        displayOrder: 0,
        specialties: [],
        applicationFiles: {
          create:
            [
              ...portfolioFiles.map((file, index) => ({
                kind: "PORTFOLIO" as const,
                fileName: file.filename,
                mimeType: file.contentType,
                sizeBytes: file.size,
                content: Buffer.alloc(0),
                blobUrl: file.url,
                blobPathname: file.pathname,
                createdAt: new Date(Date.now() + index),
              })),
              ...identityFileEntries,
            ],
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
  } catch (error) {
    console.error("[helper-application] submit failed", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An application with this email already exists." },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to submit helper application." },
      { status: 500 },
    );
  }
}
