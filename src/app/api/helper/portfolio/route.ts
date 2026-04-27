import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAccessibleHelperByEmail, getAuthSession } from "@/lib/auth";
import {
  getApplicationFileDownloadPath,
  getApplicationFileTitle,
  getPortfolioPreviewImageUrl,
} from "@/lib/helper-applications";
import { prisma } from "@/lib/prisma";
import { helperPortfolioSubmissionSchema } from "@/lib/validators";

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
    const payload = await request.json();
    const parsed = helperPortfolioSubmissionSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid portfolio payload." },
        { status: 400 },
      );
    }

    const currentCount = await prisma.helperPortfolioItem.count({
      where: { helperId: helper.id },
    });

    const created = await prisma.$transaction(async (tx) => {
      const uploadedFile = parsed.data.uploadedFile;
      const storedFile = await tx.helperApplicationFile.create({
        data: {
          helperId: helper.id,
          kind: "PORTFOLIO",
          fileName: uploadedFile.filename,
          mimeType: uploadedFile.contentType,
          sizeBytes: uploadedFile.size,
          content: Buffer.alloc(0),
          blobUrl: uploadedFile.url,
          blobPathname: uploadedFile.pathname,
        },
      });

      const item = await tx.helperPortfolioItem.create({
        data: {
          helperId: helper.id,
          title:
            parsed.data.title?.trim() ||
            getApplicationFileTitle(uploadedFile.filename, `Portfolio ${currentCount + 1}`),
          imageUrl: getPortfolioPreviewImageUrl(
            storedFile.id,
            uploadedFile.contentType,
            uploadedFile.filename,
          ),
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
