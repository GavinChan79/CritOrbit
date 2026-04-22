import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAccessibleHelperByEmail, getAuthSession } from "@/lib/auth";
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
      return NextResponse.json({ error: `${file.name} exceeds the 10MB limit.` }, { status: 400 });
    }

    if (!isAllowedApplicationFile(file.name, file.type || "")) {
      return NextResponse.json(
        { error: `${file.name} is not a supported file type.` },
        { status: 400 },
      );
    }

    const currentCount = await prisma.helperPortfolioItem.count({
      where: { helperId: helper.id },
    });

    const created = await prisma.$transaction(async (tx) => {
      const storedFile = await tx.helperApplicationFile.create({
        data: {
          helperId: helper.id,
          kind: "PORTFOLIO",
          fileName: sanitizeApplicationFileName(file.name),
          mimeType: file.type,
          sizeBytes: file.size,
          content: Buffer.from(await file.arrayBuffer()),
        },
      });

      const item = await tx.helperPortfolioItem.create({
        data: {
          helperId: helper.id,
          title:
            parsed.data.title?.trim() ||
            getApplicationFileTitle(file.name, `Portfolio ${currentCount + 1}`),
          imageUrl: getPortfolioPreviewImageUrl(storedFile.id, file.type, file.name),
          description: parsed.data.description?.trim(),
          externalLink: getApplicationFileDownloadPath(storedFile.id),
          displayOrder: parsed.data.displayOrder ?? currentCount,
          sourceApplicationFileId: storedFile.id,
        },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          description: true,
          externalLink: true,
          displayOrder: true,
          sourceApplicationFileId: true,
        },
      });

      return item;
    });

    revalidatePath("/helper");
    revalidatePath("/helper/portfolio");
    revalidatePath("/helpers/select");
    revalidatePath(`/helpers/${helper.id}`);
    revalidatePath("/");

    return NextResponse.json({ success: true, item: created });
  } catch {
    return NextResponse.json({ error: "Failed to upload portfolio file." }, { status: 500 });
  }
}
