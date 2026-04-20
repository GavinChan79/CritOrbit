import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { LeadLifecycleStage, LeadStatus, UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminLeadUpdateSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const session = await getAuthSession();
  const { leadId } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const json = await request.json();
    const parsed = adminLeadUpdateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid lead update." },
        { status: 400 },
      );
    }

    const status = parsed.data.status as LeadStatus;
    const lifecycleStage =
      status === "COMPLETED"
        ? LeadLifecycleStage.COMPLETED
        : status === "ASSIGNED"
          ? LeadLifecycleStage.ASSIGNED
          : status === "CONTACTED"
            ? LeadLifecycleStage.CONTACTED
            : LeadLifecycleStage.LEAD;

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        lifecycleStage,
        assignedHelperId: parsed.data.assignedHelperId,
        dealClosed: parsed.data.dealClosed,
        dealValue: parsed.data.dealValue,
        notes: parsed.data.notes,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/helper-stats");
    revalidatePath("/helper");
    revalidatePath("/helper/leads");
    revalidatePath("/helper/earnings");
    if (lead.userId) {
      revalidatePath("/dashboard");
      revalidatePath(`/dashboard/requests/${leadId}`);
    }

    return NextResponse.json({ success: true, lead });
  } catch {
    return NextResponse.json({ error: "Failed to update the lead." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const session = await getAuthSession();
  const { leadId } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    await prisma.lead.delete({
      where: { id: leadId },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/helper-stats");
    revalidatePath("/helper");
    revalidatePath("/helper/leads");
    revalidatePath("/helper/earnings");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/requests/${leadId}`);

    return NextResponse.json({ success: true, deletedLeadId: lead.id, userId: lead.userId });
  } catch {
    return NextResponse.json({ error: "Failed to delete the lead." }, { status: 500 });
  }
}
