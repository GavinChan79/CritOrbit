import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { helperPortfolioSchema } from "@/lib/validators";

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

    const json = await request.json();
    const parsed = helperPortfolioSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid portfolio payload." },
        { status: 400 },
      );
    }

    const item = await prisma.helperPortfolioItem.create({
      data: {
        helperId,
        ...parsed.data,
      },
    });

    revalidatePath("/admin/helpers");
    revalidatePath("/helpers/select");
    revalidatePath("/");

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ error: "Failed to create portfolio item." }, { status: 500 });
  }
}
