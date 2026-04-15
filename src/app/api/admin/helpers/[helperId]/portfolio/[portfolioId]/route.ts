import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { helperPortfolioSchema } from "@/lib/validators";

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
      select: { id: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
    }

    const json = await request.json();
    const parsed = helperPortfolioSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid portfolio payload." },
        { status: 400 },
      );
    }

    const item = await prisma.helperPortfolioItem.update({
      where: { id: portfolioId },
      data: parsed.data,
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
