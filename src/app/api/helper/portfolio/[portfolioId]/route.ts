import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAccessibleHelperByEmail, getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ portfolioId: string }> },
) {
  const session = await getAuthSession();
  const { portfolioId } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const helper = await getAccessibleHelperByEmail(session.user.email);

  if (!helper) {
    return NextResponse.json({ error: "Approved helper access required." }, { status: 403 });
  }

  try {
    const portfolioItem = await prisma.helperPortfolioItem.findFirst({
      where: {
        id: portfolioId,
        helperId: helper.id,
      },
      select: {
        id: true,
        sourceApplicationFileId: true,
      },
    });

    if (!portfolioItem) {
      return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.helperPortfolioItem.delete({
        where: { id: portfolioId },
      });

      if (portfolioItem.sourceApplicationFileId) {
        await tx.helperApplicationFile.delete({
          where: { id: portfolioItem.sourceApplicationFileId },
        });
      }
    });

    revalidatePath("/helper");
    revalidatePath("/helper/portfolio");
    revalidatePath("/helpers/select");
    revalidatePath(`/helpers/${helper.id}`);
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete portfolio item." }, { status: 500 });
  }
}
