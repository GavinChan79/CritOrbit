import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma, UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
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
    const parsed = helperSchema.safeParse(json);

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
      },
    });

    revalidatePath("/admin/helpers");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/helper-stats");
    revalidatePath("/helpers/select");
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
