import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentStatusLabel } from "@/lib/payments";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("leadId")?.trim();
  const billCode = searchParams.get("billCode")?.trim();

  if (!leadId || !billCode) {
    return NextResponse.json({ error: "leadId and billCode are required." }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        paymentLinkRef: billCode,
      },
      select: {
        id: true,
        paymentStatus: true,
        paymentLinkRef: true,
        paidAt: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ success: true, found: false }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      found: true,
      lead: {
        id: lead.id,
        paymentStatus: lead.paymentStatus,
        paymentStatusLabel: getPaymentStatusLabel(lead.paymentStatus),
        paymentLinkRef: lead.paymentLinkRef,
        paidAt: lead.paidAt ? lead.paidAt.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("[payments:status] failed", error);
    return NextResponse.json({ error: "Failed to load payment status." }, { status: 500 });
  }
}
