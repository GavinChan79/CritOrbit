import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { HelperStatus, UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const json = await request.json().catch(() => ({}));
    const action =
      typeof json === "object" && json !== null && "action" in json ? json.action : undefined;

    if (action !== "archive" && action !== "restore") {
      return NextResponse.json({ error: "Invalid archive action." }, { status: 400 });
    }

    const data =
      action === "archive"
        ? {
            status: HelperStatus.ARCHIVED,
            isActive: false,
          }
        : {
            status: HelperStatus.FROZEN,
            isActive: false,
          };

    const helper = await prisma.helper.update({
      where: { id: helperId },
      data,
    });

    revalidatePath("/admin/helpers");
    revalidatePath("/admin/helpers/archived");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/helper-stats");
    revalidatePath("/helpers/select");
    revalidatePath(`/helpers/${helperId}`);
    revalidatePath("/");

    return NextResponse.json({ success: true, helper });
  } catch {
    return NextResponse.json({ error: "Failed to update helper archive state." }, { status: 500 });
  }
}
