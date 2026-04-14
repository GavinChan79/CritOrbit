import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { helperSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getAuthSession();

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

    const helper = await prisma.helper.create({
      data: {
        ...parsed.data,
      },
    });

    revalidatePath("/admin/helpers");
    revalidatePath("/helpers/select");
    revalidatePath("/");

    return NextResponse.json({ success: true, helper });
  } catch {
    return NextResponse.json({ error: "Failed to create helper." }, { status: 500 });
  }
}
