import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import {
  appendPaymentNote,
  assertPaymentTransition,
  buildPaymentDescription,
  canCreatePaymentLink,
  createPaymentLink,
  normalizePaymentAmountInput,
  validateToyyibPayConfig,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { adminLeadPaymentLinkSchema } from "@/lib/validators";

export async function POST(
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
    const configValidation = validateToyyibPayConfig();
    if (!configValidation.isValid) {
      console.warn("[payments][toyyibpay] missing config for payment-link route", {
        missing: configValidation.missing,
      });
      return NextResponse.json(
        {
          error:
            "ToyyibPay is not fully configured yet. Add the required payment environment variables before creating a payment link.",
        },
        { status: 500 },
      );
    }

    const json = await request.json();
    const parsed = adminLeadPaymentLinkSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payment link payload." },
        { status: 400 },
      );
    }

    const amount = normalizePaymentAmountInput(parsed.data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Enter a valid whole-number RM amount." }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    if (!canCreatePaymentLink(lead.paymentStatus)) {
      return NextResponse.json(
        { error: "This lead cannot receive a new payment link in its current payment state." },
        { status: 400 },
      );
    }

    if (lead.paymentStatus === "PAYMENT_LINK_SENT" && lead.paymentLinkUrl && lead.paymentLinkRef) {
      return NextResponse.json({
        success: true,
        reusedExistingLink: true,
        paymentUrl: lead.paymentLinkUrl,
        lead: {
          id: lead.id,
          paymentProvider: lead.paymentProvider,
          paymentStatus: lead.paymentStatus,
          paymentAmount: lead.paymentAmount,
          paymentLinkUrl: lead.paymentLinkUrl,
          paymentLinkRef: lead.paymentLinkRef,
          paymentRequestedAt: lead.paymentRequestedAt,
        },
      });
    }

    if (lead.paymentStatus !== "UNPAID") {
      assertPaymentTransition(lead.paymentStatus, "PAYMENT_LINK_SENT");
    }

    const paymentLink = await createPaymentLink({
      leadId: lead.id,
      amount,
      customerName: lead.user?.name ?? "CritOrbit Customer",
      customerEmail: lead.user?.email ?? "support@critorbit.com",
      customerPhone: "",
      description: buildPaymentDescription(lead, parsed.data.note),
    });

    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        paymentProvider: paymentLink.paymentProvider,
        paymentAmount: amount,
        paymentCurrency: "MYR",
        paymentLinkUrl: paymentLink.paymentLinkUrl,
        paymentLinkRef: paymentLink.paymentLinkRef,
        paymentStatus: "PAYMENT_LINK_SENT",
        paymentRequestedAt: new Date(),
        ...(parsed.data.note
          ? {
              notes: appendPaymentNote(
                lead.notes,
                `Secure payment link created. ${parsed.data.note}`,
              ),
            }
          : {}),
      },
      select: {
        id: true,
        paymentProvider: true,
        paymentStatus: true,
        paymentAmount: true,
        paymentLinkUrl: true,
        paymentLinkRef: true,
        paymentRequestedAt: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/payment/return");

    return NextResponse.json({
      success: true,
      reusedExistingLink: false,
      paymentUrl: updatedLead.paymentLinkUrl,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("[payments] failed to create payment link", error);
    return NextResponse.json({ error: "Failed to create payment link." }, { status: 500 });
  }
}
