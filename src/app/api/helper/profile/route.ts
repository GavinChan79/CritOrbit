import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthSession, getAccessibleHelperByEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { helperSelfProfileSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const helper = await getAccessibleHelperByEmail(session.user.email);

  if (!helper) {
    return NextResponse.json({ error: "Approved helper access required." }, { status: 403 });
  }

  try {
    const json = await request.json();
    const parsed = helperSelfProfileSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile payload." },
        { status: 400 },
      );
    }

    const updatedHelper = await prisma.helper.update({
      where: { id: helper.id },
      data: {
        name: parsed.data.name.trim(),
        category: parsed.data.category,
        shortBio: parsed.data.shortBio.trim(),
        portfolioNote: parsed.data.portfolioNote?.trim(),
        whatsappNumber: parsed.data.whatsappNumber.trim(),
        responseTime: parsed.data.responseTime.trim(),
        deliveryTime: parsed.data.deliveryTime.trim(),
      },
      select: {
        id: true,
        name: true,
        category: true,
        shortBio: true,
        portfolioNote: true,
        whatsappNumber: true,
        responseTime: true,
        deliveryTime: true,
      },
    });

    revalidatePath("/helper");
    revalidatePath("/helper/profile");
    revalidatePath("/helper/leads");
    revalidatePath("/helper/earnings");
    revalidatePath("/helpers/select");
    revalidatePath(`/helpers/${helper.id}`);

    return NextResponse.json({ success: true, helper: updatedHelper });
  } catch {
    return NextResponse.json({ error: "Failed to update helper profile." }, { status: 500 });
  }
}
