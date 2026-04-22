import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { appendPaymentNote, assertPaymentTransition } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { adminLeadPaymentActionSchema } from "@/lib/validators";

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
    const parsed = adminLeadPaymentActionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payment action." },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        notes: true,
        paymentStatus: true,
        paymentRef: true,
        releaseRef: true,
        userId: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    let nextStatus = lead.paymentStatus;
    let nextNotes = lead.notes;
    const now = new Date();
    const data: Record<string, unknown> = {};

    if (parsed.data.action === "MARK_AS_PAID") {
      if (!parsed.data.paymentRef && !parsed.data.note) {
        return NextResponse.json(
          { error: "Add a payment reference or note before marking this lead as paid manually." },
          { status: 400 },
        );
      }

      if (lead.paymentStatus === "RELEASED" || lead.paymentStatus === "REFUNDED") {
        return NextResponse.json(
          { error: "This lead cannot be manually marked paid anymore." },
          { status: 400 },
        );
      }

      nextStatus = "PAID";
      data.paidAt = now;
      data.paymentRef = parsed.data.paymentRef ?? lead.paymentRef ?? "MANUAL_ADMIN_OVERRIDE";
      nextNotes = appendPaymentNote(nextNotes, parsed.data.note ?? "Marked as paid manually.");
    }

    if (parsed.data.action === "MARK_RELEASE_READY") {
      assertPaymentTransition(lead.paymentStatus, "RELEASE_READY");
      nextStatus = "RELEASE_READY";
      data.releaseReadyAt = now;
      nextNotes = appendPaymentNote(
        nextNotes,
        parsed.data.note ?? "Payment marked release managed after completion.",
      );
    }

    if (parsed.data.action === "MARK_AS_RELEASED") {
      if (lead.paymentStatus !== "PAID" && lead.paymentStatus !== "RELEASE_READY") {
        return NextResponse.json(
          { error: "Only paid or release-ready leads can be marked released." },
          { status: 400 },
        );
      }

      nextStatus = "RELEASED";
      data.releaseReadyAt = lead.paymentStatus === "PAID" ? now : undefined;
      data.releasedAt = now;
      data.releaseRef = parsed.data.releaseRef ?? lead.releaseRef ?? "ADMIN_RELEASE";
      nextNotes = appendPaymentNote(
        nextNotes,
        parsed.data.note ?? "Release managed after completion.",
      );
    }

    if (parsed.data.action === "MARK_AS_REFUNDED") {
      if (lead.paymentStatus !== "PAID" && lead.paymentStatus !== "RELEASE_READY") {
        return NextResponse.json(
          { error: "Only paid or release-ready leads can be refunded." },
          { status: 400 },
        );
      }

      nextStatus = "REFUNDED";
      data.refundedAt = now;
      nextNotes = appendPaymentNote(nextNotes, parsed.data.note ?? "Payment refunded.");
    }

    data.paymentStatus = nextStatus;
    data.notes = nextNotes;

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data,
      select: {
        id: true,
        paymentStatus: true,
        paymentRef: true,
        paidAt: true,
        releaseReadyAt: true,
        releasedAt: true,
        releaseRef: true,
        refundedAt: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/payment/return");
    if (lead.userId) {
      revalidatePath("/dashboard");
      revalidatePath(`/dashboard/requests/${leadId}`);
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("[payments] failed to update payment status", error);
    return NextResponse.json({ error: "Failed to update payment status." }, { status: 500 });
  }
}
