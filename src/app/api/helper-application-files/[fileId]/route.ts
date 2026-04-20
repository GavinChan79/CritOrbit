import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await getAuthSession();
  const { fileId } = await params;

  const file = await prisma.helperApplicationFile.findUnique({
    where: { id: fileId },
    select: {
      fileName: true,
      mimeType: true,
      content: true,
      kind: true,
      helper: {
        select: {
          email: true,
          isActive: true,
          status: true,
          portfolioItems: {
            where: { sourceApplicationFileId: fileId },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const isAdmin = session?.user?.role === UserRole.ADMIN;
  const isHelperOwner =
    Boolean(session?.user?.email) &&
    file.helper.email?.toLowerCase() === session?.user?.email?.toLowerCase();
  const isPublicPortfolioFile =
    file.kind === "PORTFOLIO" &&
    file.helper.isActive &&
    file.helper.status === "ACTIVE" &&
    file.helper.portfolioItems.length > 0;

  if (!isAdmin && !isHelperOwner && !isPublicPortfolioFile) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  return new NextResponse(Buffer.from(file.content), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${file.fileName}"`,
      "Cache-Control":
        isAdmin || isHelperOwner ? "private, no-store" : "public, max-age=3600",
    },
  });
}
