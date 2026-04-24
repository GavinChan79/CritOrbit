import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { HelperPriceAnchor, Prisma, UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import {
  getApplicationFileDownloadPath,
  getApplicationFileTitle,
  getPortfolioPreviewImageUrl,
} from "@/lib/helper-applications";
import { normalizeHelperSpecialties } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { helperSchema } from "@/lib/validators";

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
    const parsed = helperSchema.safeParse({
      ...json,
      specialties: normalizeHelperSpecialties(
        typeof json === "object" && json !== null && "specialties" in json
          ? (json as { specialties?: unknown }).specialties
          : undefined,
      ),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid helper payload." },
        { status: 400 },
      );
    }

    const helper = await prisma.helper.update({
      where: { id: helperId },
      data: {
        ...parsed.data,
        submittedPriceAnchor: parsed.data.submittedPriceAnchor as HelperPriceAnchor,
        priceAnchor: parsed.data.priceAnchor as HelperPriceAnchor,
        isActive: parsed.data.status === "ACTIVE" ? parsed.data.isActive : false,
      },
    });

    if (parsed.data.status === "ACTIVE") {
      const applicationPortfolioFiles = await prisma.helperApplicationFile.findMany({
        where: {
          helperId,
          kind: "PORTFOLIO",
        },
        orderBy: { createdAt: "asc" },
      });

      const existingPortfolioItems = await prisma.helperPortfolioItem.findMany({
        where: { helperId },
        select: { sourceApplicationFileId: true },
      });
      const existingFileIds = new Set(
        existingPortfolioItems
          .map((item) => item.sourceApplicationFileId)
          .filter((value): value is string => Boolean(value)),
      );

      const nextFiles = applicationPortfolioFiles.filter(
        (file) => !existingFileIds.has(file.id),
      );

      if (nextFiles.length > 0) {
        const currentCount = await prisma.helperPortfolioItem.count({
          where: { helperId },
        });

        await prisma.helperPortfolioItem.createMany({
          data: nextFiles.map((file, index) => {
            const downloadPath = getApplicationFileDownloadPath(file.id);
            return {
              helperId,
              title: getApplicationFileTitle(file.fileName, `Portfolio ${index + 1}`),
              imageUrl: getPortfolioPreviewImageUrl(file.id, file.mimeType, file.fileName),
              description: "Uploaded during helper application review.",
              externalLink: downloadPath,
              sourceApplicationFileId: file.id,
              displayOrder: currentCount + index,
            };
          }),
        });
      }
    }

    revalidatePath("/admin/helpers");
    revalidatePath("/admin/helpers/archived");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/helper-stats");
    revalidatePath("/helpers/select");
    revalidatePath(`/helpers/${helperId}`);
    revalidatePath("/become-helper");
    revalidatePath("/");

    return NextResponse.json({ success: true, helper });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Helper not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to update helper." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
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
    const helper = await prisma.helper.findUnique({
      where: { id: helperId },
      select: {
        status: true,
        _count: {
          select: {
            selectedForLeads: true,
            assignedLeads: true,
            applicationFiles: true,
            portfolioItems: true,
          },
        },
      },
    });

    if (!helper) {
      return NextResponse.json({ error: "Helper not found." }, { status: 404 });
    }

    if (helper.status !== "ARCHIVED") {
      return NextResponse.json(
        { error: "Only archived helpers can be permanently deleted." },
        { status: 400 },
      );
    }

    const hasHistoricalRecords =
      helper._count.selectedForLeads > 0 ||
      helper._count.assignedLeads > 0 ||
      helper._count.applicationFiles > 0 ||
      helper._count.portfolioItems > 0;

    if (hasHistoricalRecords) {
      return NextResponse.json(
        {
          error:
            "This helper has historical records and cannot be permanently deleted. It can only remain archived.",
        },
        { status: 400 },
      );
    }

    await prisma.helper.delete({
      where: { id: helperId },
    });

    revalidatePath("/admin/helpers");
    revalidatePath("/admin/helpers/archived");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/helper-stats");
    revalidatePath("/helpers/select");
    revalidatePath(`/helpers/${helperId}`);
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to permanently delete helper." }, { status: 500 });
  }
}
