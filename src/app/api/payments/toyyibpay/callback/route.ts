import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  appendPaymentNote,
  assertPaymentTransition,
  normalizeToyyibPayCallback,
  validateToyyibPayConfig,
  verifyToyyibPayRequest,
  type ToyyibPayCallbackPayload,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  return handleCallbackRequest(request);
}

export async function GET(request: Request) {
  return handleCallbackRequest(request);
}

async function handleCallbackRequest(request: Request) {
  try {
    const payload = await readToyyibPayPayload(request);
    const configValidation = validateToyyibPayConfig();

    if (!configValidation.isValid) {
      console.warn("[payments][toyyibpay] callback ignored due to missing config", {
        missing: configValidation.missing,
        order_id: payload.order_id,
        billcode: payload.billcode,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    console.info("[payments][toyyibpay] callback received", {
      order_id: payload.order_id,
      billcode: payload.billcode,
      status: payload.status ?? payload.status_id,
      amount: payload.amount,
      reason: payload.reason ?? payload.msg,
      refno: payload.refno,
      transaction_id: payload.transaction_id,
    });

    if (!verifyToyyibPayRequest(payload)) {
      console.warn("[payments][toyyibpay] callback ignored due to hash mismatch", {
        order_id: payload.order_id,
        billcode: payload.billcode,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    const normalized = normalizeToyyibPayCallback(payload);
    if (!normalized.nextStatus) {
      console.warn("[payments][toyyibpay] callback ignored due to unknown status", {
        order_id: normalized.leadId,
        billcode: normalized.paymentLinkRef,
        providerStatus: normalized.providerStatus,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: normalized.leadId },
      select: {
        id: true,
        notes: true,
        paymentStatus: true,
        paymentAmount: true,
        paymentLinkRef: true,
        paymentRef: true,
        userId: true,
      },
    });

    if (!lead) {
      console.warn("[payments][toyyibpay] callback ignored due to lead mismatch", {
        order_id: normalized.leadId,
        billcode: normalized.paymentLinkRef,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    if (!lead.paymentLinkRef || lead.paymentLinkRef !== normalized.paymentLinkRef) {
      console.warn("[payments][toyyibpay] callback ignored due to billcode mismatch", {
        leadId: lead.id,
        expectedBillCode: lead.paymentLinkRef,
        receivedBillCode: normalized.paymentLinkRef,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    if (lead.paymentAmount === null || normalized.amount === null || normalized.amount !== lead.paymentAmount) {
      console.warn("[payments][toyyibpay] callback ignored due to amount mismatch", {
        leadId: lead.id,
        expectedAmount: lead.paymentAmount,
        receivedAmount: normalized.amount,
        billcode: normalized.paymentLinkRef,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    if (
      ["PAID", "RELEASE_READY", "RELEASED"].includes(lead.paymentStatus) &&
      normalized.nextStatus === "PAID"
    ) {
      console.info("[payments][toyyibpay] duplicate callback ignored", {
        leadId: lead.id,
        status: lead.paymentStatus,
        billcode: normalized.paymentLinkRef,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    if (
      ["PAID", "RELEASE_READY", "RELEASED"].includes(lead.paymentStatus) &&
      ["PAYMENT_FAILED", "PAYMENT_EXPIRED"].includes(normalized.nextStatus)
    ) {
      console.info("[payments][toyyibpay] duplicate callback ignored", {
        leadId: lead.id,
        status: lead.paymentStatus,
        billcode: normalized.paymentLinkRef,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    try {
      assertPaymentTransition(lead.paymentStatus, normalized.nextStatus);
    } catch (error) {
      console.warn("[payments][toyyibpay] callback ignored due to invalid transition", {
        leadId: lead.id,
        currentStatus: lead.paymentStatus,
        nextStatus: normalized.nextStatus,
        error,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        paymentStatus: normalized.nextStatus,
        paymentRef: normalized.paymentRef ?? lead.paymentRef,
        paymentAmount: normalized.amount ?? undefined,
        paidAt: normalized.nextStatus === "PAID" ? normalized.paidAt : undefined,
        notes: appendPaymentNote(
          lead.notes,
          `ToyyibPay callback: ${normalized.nextStatus}${normalized.providerReason ? ` (${normalized.providerReason})` : ""}.`,
        ),
      },
      select: {
        id: true,
        paymentStatus: true,
        paymentRef: true,
        paidAt: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${lead.id}`);
    revalidatePath("/payment/return");
    if (lead.userId) {
      revalidatePath("/dashboard");
      revalidatePath(`/dashboard/requests/${lead.id}`);
    }

    console.info("[payments][toyyibpay] callback applied successfully", {
      leadId: lead.id,
      nextStatus: normalized.nextStatus,
      billcode: normalized.paymentLinkRef,
      paymentRef: normalized.paymentRef,
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("[payments][toyyibpay] callback failed", error);
    return NextResponse.json({ error: "Failed to process callback." }, { status: 500 });
  }
}

async function readToyyibPayPayload(request: Request): Promise<ToyyibPayCallbackPayload> {
  if (request.method === "GET") {
    const { searchParams } = new URL(request.url);
    return Object.fromEntries(searchParams.entries());
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries()) as ToyyibPayCallbackPayload;
  }

  const text = await request.text();
  const params = new URLSearchParams(text);
  return Object.fromEntries(params.entries());
}
