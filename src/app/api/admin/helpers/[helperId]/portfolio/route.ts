import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import {
  getApplicationFileDownloadPath,
  getApplicationFileTitle,
  getPortfolioPreviewImageUrl,
  isAllowedApplicationFile,
  maxApplicationFileSizeBytes,
  sanitizeApplicationFileName,
} from "@/lib/helper-applications";
import { prisma } from "@/lib/prisma";
import { helperPortfolioUploadSchema } from "@/lib/validators";

export async function POST(
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
    const helper = await prisma.helper.findUnique({
      where: { id: helperId },
      select: { id: true },
    });

    if (!helper) {
      return NextResponse.json({ error: "Helper not found." }, { status: 404 });
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

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Portfolio file is required." }, { status: 400 });
    }

    if (file.size > maxApplicationFileSizeBytes) {
      return NextResponse.json({ error: `${file.name} exceeds the 20MB limit.` }, { status: 400 });
    }

    if (!isAllowedApplicationFile(file.name, file.type || "")) {
      return NextResponse.json(
        { error: `${file.name} is not a supported file type.` },
        { status: 400 },
      );
    }

    const item = await prisma.$transaction(async (tx) => {
      const storedFile = await tx.helperApplicationFile.create({
        data: {
          helperId,
          kind: "PORTFOLIO",
          fileName: sanitizeApplicationFileName(file.name),
          mimeType: file.type,
          sizeBytes: file.size,
          content: Buffer.from(await file.arrayBuffer()),
        },
      });

      return tx.helperPortfolioItem.create({
        data: {
          helperId,
          title:
            parsed.data.title?.trim() ||
            getApplicationFileTitle(file.name, "Portfolio item"),
          imageUrl: getPortfolioPreviewImageUrl(storedFile.id, file.type, file.name),
          description: parsed.data.description?.trim(),
          externalLink: getApplicationFileDownloadPath(storedFile.id),
          displayOrder: parsed.data.displayOrder ?? 0,
          sourceApplicationFileId: storedFile.id,
        },
      });
    });

    revalidatePath("/admin/helpers");
    revalidatePath("/helpers/select");
    revalidatePath("/");

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ error: "Failed to create portfolio item." }, { status: 500 });
  }
}
