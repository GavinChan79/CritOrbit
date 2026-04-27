import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryLabel,
  getHelperPriceAnchor,
  getHelperTrustLevelLabel,
  getTaskTypeLabel,
} from "@/lib/helpers";
import { getPaymentStatusLabel } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { logServerDataLoadError } from "@/lib/server-load";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/whatsapp";
import { formatCurrency, formatCurrencyFromSen, formatDate, titleizeEnum } from "@/lib/format";
import { DeleteLeadButton, LeadManagementForm } from "@/components/client-forms";
import { buttonStyles, Card, SectionHeading, StatusBadge } from "@/components/ui";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  const [leadResult, helpersResult] = await Promise.allSettled([
    prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        user: true,
        selectedHelper: true,
        assignedHelper: true,
      },
    }),
    prisma.helper.findMany({
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  if (leadResult.status === "rejected") {
    logServerDataLoadError("admin-lead-detail", leadResult.reason);
  }

  if (helpersResult.status === "rejected") {
    logServerDataLoadError("admin-lead-detail-helpers", helpersResult.reason);
  }

  const lead = leadResult.status === "fulfilled" ? leadResult.value : null;
  const helpers = helpersResult.status === "fulfilled" ? helpersResult.value : [];

  if (!lead) {
    if (leadResult.status === "fulfilled") {
      notFound();
    }

    return (
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/leads" className={buttonStyles({ tone: "yellow", size: "sm" })}>
            Back to Leads
          </Link>
        </div>
        <div className="mt-5">
          <SectionHeading
            eyebrow="Lead Detail"
            title="Lead data temporarily unavailable"
            description="The page stayed up, but this lead could not be loaded right now. Try refreshing in a moment."
          />
        </div>
      </div>
    );
  }

  const helpersUnavailable = helpersResult.status === "rejected";

  const whatsappUrl = buildWhatsappUrl(
    buildWhatsappMessage({
      category: getCategoryLabel(lead.category),
      taskType: getTaskTypeLabel(lead.taskType),
      urgency: titleizeEnum(lead.urgency),
      deadline: lead.deadline,
      budget: lead.budget,
      preferredHelperName: lead.selectedHelper?.name ?? "No preference",
      preferredHelperTrustLevel: lead.selectedHelper
        ? getHelperTrustLevelLabel({
            trustLevel: lead.selectedHelper.trustLevel,
            isVerified: lead.selectedHelper.isVerified,
          })
        : "Not specified",
      preferredHelperStartingPrice: lead.selectedHelper
        ? getHelperPriceAnchor({
            type: lead.selectedHelper.type,
            projectsCompleted: lead.selectedHelper.projectsCompleted,
            priceTier: lead.selectedHelper.priceTier,
            priceAnchor: lead.selectedHelper.priceAnchor,
          })
        : "Not specified",
      description: lead.description,
      leadId: lead.id,
      draftId: lead.clientRequestKey,
    }),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/leads" className={buttonStyles({ tone: "yellow", size: "sm" })}>
          Back to Leads
        </Link>
        <DeleteLeadButton leadId={lead.id} />
        <StatusBadge status={lead.status} />
        {lead.dealClosed ? (
          <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
            Closed Deal
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <SectionHeading
          eyebrow="Lead Detail"
          title={`Lead ${lead.id.slice(0, 8)}`}
          description="This page keeps the full brief, WhatsApp follow-up, admin assignment, closure, and revenue in one place."
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="bg-white">
            <div className="display-font text-2xl font-black">Lead summary</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Detail label="Student" value={lead.user?.name ?? "Guest lead"} />
              <Detail label="Email" value={lead.user?.email ?? "Not logged in"} />
              <Detail label="Category" value={getCategoryLabel(lead.category)} />
              <Detail label="Task Type" value={getTaskTypeLabel(lead.taskType)} />
              <Detail label="Urgency" value={titleizeEnum(lead.urgency)} />
              <Detail label="Deadline" value={formatDate(lead.deadline)} />
              <Detail label="Budget" value={formatCurrency(lead.budget)} />
              <Detail label="Lead Score" value={`${lead.leadScore} · ${lead.leadTemperature}`} />
              <Detail label="Preferred Helper" value={lead.selectedHelper?.name ?? "-"} />
              <Detail label="Assigned Helper" value={lead.assignedHelper?.name ?? "-"} />
              <Detail label="Deal Value" value={formatCurrency(lead.dealValue)} />
              <Detail label="Created" value={formatDate(lead.createdAt)} />
            </div>
          </Card>

          <Card className="bg-white">
            <div className="display-font text-2xl font-black">Pipeline trace</div>
            <div className="mt-5 grid gap-3">
              <TraceRow label="User selected a helper" value={lead.selectedHelper ? lead.selectedHelper.name : "No"} />
              <TraceRow label="Admin assigned a helper" value={lead.assignedHelper ? lead.assignedHelper.name : "Not yet"} />
              <TraceRow label="Deal closed" value={lead.dealClosed ? "Yes" : "No"} />
              <TraceRow label="Revenue captured" value={lead.dealValue ? formatCurrency(lead.dealValue) : "Not yet"} />
              <TraceRow label="WhatsApp clicked" value={lead.whatsappClicked ? "Yes" : "No"} />
            </div>
          </Card>

          <Card className="bg-white">
            <div className="display-font text-2xl font-black">Secure Payment</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Detail label="Provider" value={lead.paymentProvider ?? "-"} />
              <Detail label="Payment Status" value={getPaymentStatusLabel(lead.paymentStatus)} />
              <Detail label="Amount" value={formatCurrencyFromSen(lead.paymentAmount)} />
              <Detail label="Currency" value={lead.paymentCurrency ?? "MYR"} />
              <Detail label="Payment Link Ref" value={lead.paymentLinkRef ?? "-"} />
              <Detail label="Payment Ref" value={lead.paymentRef ?? "-"} />
              <Detail label="Requested" value={lead.paymentRequestedAt ? formatDate(lead.paymentRequestedAt) : "-"} />
              <Detail label="Paid" value={lead.paidAt ? formatDate(lead.paidAt) : "-"} />
              <Detail label="Release Ready" value={lead.releaseReadyAt ? formatDate(lead.releaseReadyAt) : "-"} />
              <Detail label="Released" value={lead.releasedAt ? formatDate(lead.releasedAt) : "-"} />
              <Detail label="Release Ref" value={lead.releaseRef ?? "-"} />
              <Detail label="Refunded" value={lead.refundedAt ? formatDate(lead.refundedAt) : "-"} />
            </div>
            {lead.paymentLinkUrl ? (
              <a
                href={lead.paymentLinkUrl}
                target="_blank"
                rel="noreferrer"
                className={`mt-5 ${buttonStyles({ tone: "yellow", size: "md" })}`}
              >
                Open Payment Link
              </a>
            ) : null}
          </Card>

          <Card className="bg-white">
            <div className="display-font text-2xl font-black">Assignment details</div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{lead.description}</p>
          </Card>

          <Card className="bg-blue text-white">
            <div className="display-font text-2xl font-black">Admin WhatsApp Launch</div>
            <p className="mt-3 text-sm leading-7 text-white/80">
              Uses the stored lead data, so admin always follows up with the same brief the student submitted.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className={`mt-5 ${buttonStyles({ tone: "yellow", size: "md" })}`}
            >
              Open WhatsApp
            </a>
          </Card>
        </div>

        <LeadManagementForm
          lead={{
            id: lead.id,
            status: lead.status,
            assignedHelperId: lead.assignedHelperId,
            dealClosed: lead.dealClosed,
            dealValue: lead.dealValue,
            notes: lead.notes,
            paymentStatus: lead.paymentStatus,
            paymentProvider: lead.paymentProvider,
            paymentAmount: lead.paymentAmount,
            paymentCurrency: lead.paymentCurrency,
            paymentLinkUrl: lead.paymentLinkUrl,
            paymentLinkRef: lead.paymentLinkRef,
            paymentRef: lead.paymentRef,
            paidAt: lead.paidAt ? lead.paidAt.toISOString() : null,
            releaseReadyAt: lead.releaseReadyAt ? lead.releaseReadyAt.toISOString() : null,
            releasedAt: lead.releasedAt ? lead.releasedAt.toISOString() : null,
            releaseRef: lead.releaseRef,
            paymentRequestedAt: lead.paymentRequestedAt ? lead.paymentRequestedAt.toISOString() : null,
            refundedAt: lead.refundedAt ? lead.refundedAt.toISOString() : null,
          }}
          helpers={helpers.map((helper) => ({ id: helper.id, name: helper.name }))}
        />
        {helpersUnavailable ? (
          <div className="rounded-[20px] border-[3px] border-line bg-yellow px-5 py-4 text-sm font-semibold text-ink">
            Helper assignment options are temporarily unavailable. Lead detail remains visible while helper data reconnects.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border-[3px] border-line bg-cream p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
    </div>
  );
}

function TraceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between gap-1 rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 md:flex-row md:items-center">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
