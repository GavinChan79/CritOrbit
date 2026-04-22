import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPaymentStatusLabel } from "@/lib/payments";
import { buttonStyles, Card, SectionHeading, SiteHeader } from "@/components/ui";
import { PaymentReturnStatus } from "@/components/payment-return-status";

type PaymentStatusValue =
  | "UNPAID"
  | "PAYMENT_LINK_SENT"
  | "PAID"
  | "REFUNDED"
  | "RELEASE_READY"
  | "RELEASED"
  | "PAYMENT_FAILED"
  | "PAYMENT_EXPIRED";

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();
  const params = await searchParams;
  const leadId = readQuery(params.order_id);
  const billCode = readQuery(params.billcode);
  const statusId = readQuery(params.status_id);

  let lead: {
    id: string;
    paymentStatus: PaymentStatusValue;
    paymentLinkRef: string | null;
    paidAt: Date | null;
  } | null = null;

  if (leadId) {
    try {
      lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: {
          id: true,
          paymentStatus: true,
          paymentLinkRef: true,
          paidAt: true,
        },
      });
    } catch (error) {
      console.error("[payments:return] failed to load lead status", error);
    }
  }

  const effectiveStatus = lead?.paymentStatus ?? mapReturnStatus(statusId);

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Secure Payment"
          title="Secure Payment"
          description="Return redirect is not the source of truth. We'll verify your payment on the server before continuing your request."
        />

        <Card className="mt-8 bg-white">
          <div className="mt-4 grid gap-3 text-sm font-semibold text-muted">
            <p>Lead reference: {lead?.id ?? leadId ?? "Pending confirmation"}</p>
            <p>ToyyibPay bill: {billCode ?? lead?.paymentLinkRef ?? "Pending"}</p>
            <p>Source of truth remains the server callback and admin confirmation flow.</p>
          </div>
          <PaymentReturnStatus
            leadId={leadId ?? undefined}
            billCode={billCode ?? undefined}
            initialStatus={effectiveStatus}
            initialStatusLabel={getPaymentStatusLabel(effectiveStatus)}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className={buttonStyles({ tone: "purple", size: "md" })}>
              View Dashboard
            </Link>
            <Link href="/requirements" className={buttonStyles({ tone: "yellow", size: "md" })}>
              Back to Requests
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}

function readQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function mapReturnStatus(statusId?: string): PaymentStatusValue {
  if (statusId === "1") {
    return "PAYMENT_LINK_SENT";
  }

  if (statusId === "2") {
    return "PAYMENT_LINK_SENT";
  }

  if (statusId === "3") {
    return "PAYMENT_FAILED";
  }

  return "PAYMENT_LINK_SENT";
}
