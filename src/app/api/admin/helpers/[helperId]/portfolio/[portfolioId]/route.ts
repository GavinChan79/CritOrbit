import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getApplicationFileDownloadPath,
  getApplicationFileTitle,
  getPortfolioPreviewImageUrl,
  isAllowedApplicationFile,
  maxApplicationFileSizeBytes,
  sanitizeApplicationFileName,
} from "@/lib/helper-applications";
import { helperPortfolioUploadSchema } from "@/lib/validators";

async function requireAdminUser() {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ helperId: string; portfolioId: string }> },
) {
  const authError = await requireAdminUser();
  if (authError) {
    return authError;
  }

  const { helperId, portfolioId } = await params;

  try {
    const existingItem = await prisma.helperPortfolioItem.findFirst({
      where: { id: portfolioId, helperId },
      select: { id: true, sourceApplicationFileId: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      displayOrder: Number(formData.get("displayOrder") ?? 0),
    };
    const parsed = helperPortfolioUploadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid portfolio payload." },
        { status: 400 },
      );
    }

    let filePatch = {};

    if (file instanceof File && file.size > 0) {
      if (file.size > maxApplicationFileSizeBytes) {
        return NextResponse.json({ error: `${file.name} exceeds the 20MB limit.` }, { status: 400 });
      }

      if (!isAllowedApplicationFile(file.name, file.type || "")) {
        return NextResponse.json(
          { error: `${file.name} is not a supported file type.` },
          { status: 400 },
        );
      }

      const storedFile = await prisma.helperApplicationFile.create({
        data: {
          helperId,
          kind: "PORTFOLIO",
          fileName: sanitizeApplicationFileName(file.name),
          mimeType: file.type,
          sizeBytes: file.size,
          content: Buffer.from(await file.arrayBuffer()),
        },
      });

      filePatch = {
        title:
          parsed.data.title?.trim() ||
          getApplicationFileTitle(file.name, "Portfolio item"),
        imageUrl: getPortfolioPreviewImageUrl(storedFile.id, file.type, file.name),
        externalLink: getApplicationFileDownloadPath(storedFile.id),
        sourceApplicationFileId: storedFile.id,
      };
    }

    const item = await prisma.helperPortfolioItem.update({
      where: { id: portfolioId },
      data: {
        title: parsed.data.title?.trim(),
        description: parsed.data.description?.trim(),
        displayOrder: parsed.data.displayOrder ?? 0,
        ...filePatch,
      },
    });

    revalidatePath("/admin/helpers");
    revalidatePath("/helpers/select");
    revalidatePath("/");

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ error: "Failed to update portfolio item." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ helperId: string; portfolioId: string }> },
) {
  const authError = await requireAdminUser();
  if (authError) {
    return authError;
  }

  const { helperId, portfolioId } = await params;

  try {
    const existingItem = await prisma.helperPortfolioItem.findFirst({
      where: { id: portfolioId, helperId },
      select: { id: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
    }

    await prisma.helperPortfolioItem.delete({
      where: { id: portfolioId },
    });

    revalidatePath("/admin/helpers");
    revalidatePath("/helpers/select");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete portfolio item." }, { status: 500 });
  }
}
