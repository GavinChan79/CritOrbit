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
import {
  buildHelperInviteWhatsappMessage,
  buildWhatsappMessage,
  buildWhatsappUrl,
} from "@/lib/whatsapp";
import {
  formatCurrency,
  formatCurrencyFromSen,
  formatDate,
  formatDateTime,
  titleizeEnum,
} from "@/lib/format";
import { getLeadInviteResponseUrl } from "@/lib/lead-invite-response";
import { DeleteLeadButton, LeadManagementForm } from "@/components/client-forms";
import { HelperInviteAdminPanel } from "@/components/helper-invite-admin-panel";
import { buttonStyles, Card, SectionHeading, StatusBadge } from "@/components/ui";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  const [leadResult, invitesResult, helpersResult] = await Promise.allSettled([
    prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        user: true,
        selectedHelper: true,
        assignedHelper: true,
      },
    }),
    prisma.leadInvite.findMany({
      where: { leadId },
      select: {
        id: true,
        inviteGroup: true,
        round: true,
        status: true,
        deliveryStatus: true,
        deliveryAttemptedAt: true,
        deliveryError: true,
        sentAt: true,
        respondedAt: true,
        expiresAt: true,
        estimatedPrice: true,
        availabilityNote: true,
        responseToken: true,
        helper: {
          select: {
            id: true,
            name: true,
            status: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ round: "asc" }, { sentAt: "asc" }],
    }),
    prisma.helper.findMany({
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  if (leadResult.status === "rejected") {
    logServerDataLoadError("admin-lead-detail", leadResult.reason);
  }

  if (invitesResult.status === "rejected") {
    logServerDataLoadError("admin-lead-detail-invites", invitesResult.reason);
  }

  if (helpersResult.status === "rejected") {
    logServerDataLoadError("admin-lead-detail-helpers", helpersResult.reason);
  }

  const lead = leadResult.status === "fulfilled" ? leadResult.value : null;
  const invites = invitesResult.status === "fulfilled" ? invitesResult.value : [];
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
  const preferredInvite =
    invites.find((invite) => invite.inviteGroup === "PREFERRED") ?? null;
  const backupInvites = invites.filter((invite) => invite.inviteGroup === "BACKUP");

  const preferredInviteStatusLabel = getSimpleInviteStatusLabel(
    preferredInvite?.status ?? null,
    preferredInvite?.expiresAt ?? null,
  );
  const interestedLink = preferredInvite
    ? getLeadInviteResponseUrl(preferredInvite.responseToken, "accepted")
    : null;
  const notAvailableLink = preferredInvite
    ? getLeadInviteResponseUrl(preferredInvite.responseToken, "unavailable")
    : null;
  const helperInviteMessage = preferredInvite
    ? buildHelperInviteWhatsappMessage({
        category: getCategoryLabel(lead.category),
        taskType: getTaskTypeLabel(lead.taskType),
        deadline: lead.deadline,
        budget: lead.budget,
        briefSummary: lead.description,
        acceptedToken: preferredInvite.responseToken,
        unavailableToken: preferredInvite.responseToken,
      })
    : null;

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
          description="This page keeps the full brief, WhatsApp follow-up, admin assignment, and simple helper invite operations in one place."
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
              <TraceRow
                label="User selected a helper"
                value={lead.selectedHelper ? lead.selectedHelper.name : "No"}
              />
              <TraceRow
                label="Admin assigned a helper"
                value={lead.assignedHelper ? lead.assignedHelper.name : "Not yet"}
              />
              <TraceRow label="Deal closed" value={lead.dealClosed ? "Yes" : "No"} />
              <TraceRow
                label="Revenue captured"
                value={lead.dealValue ? formatCurrency(lead.dealValue) : "Not yet"}
              />
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
              <Detail
                label="Requested"
                value={lead.paymentRequestedAt ? formatDate(lead.paymentRequestedAt) : "-"}
              />
              <Detail label="Paid" value={lead.paidAt ? formatDate(lead.paidAt) : "-"} />
              <Detail
                label="Release Ready"
                value={lead.releaseReadyAt ? formatDate(lead.releaseReadyAt) : "-"}
              />
              <Detail
                label="Released"
                value={lead.releasedAt ? formatDate(lead.releasedAt) : "-"}
              />
              <Detail label="Release Ref" value={lead.releaseRef ?? "-"} />
              <Detail
                label="Refunded"
                value={lead.refundedAt ? formatDate(lead.refundedAt) : "-"}
              />
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

          <Card className="bg-white">
            <div className="display-font text-2xl font-black">Helper invite</div>
            <p className="mt-3 text-sm leading-7 text-muted">
              Simple Mode sends the preferred helper first. For soft launch, admin manually copies the helper WhatsApp message below.
            </p>
            <div className="mt-5">
              <HelperInviteAdminPanel
                preferredHelperName={lead.selectedHelper?.name ?? "No preferred helper selected"}
                inviteStatus={preferredInviteStatusLabel}
                deliveryStatus={getDeliveryStatusLabel(preferredInvite?.deliveryStatus ?? null)}
                deliveryAttemptedAt={formatDateTime(preferredInvite?.deliveryAttemptedAt ?? null)}
                deliveryError={preferredInvite?.deliveryError ?? null}
                interestedLink={interestedLink}
                notAvailableLink={notAvailableLink}
                whatsappMessage={helperInviteMessage}
              />
            </div>
          </Card>

          {backupInvites.length > 0 ? (
            <Card className="bg-white">
              <div className="display-font text-2xl font-black">Additional invites</div>
              <p className="mt-3 text-sm leading-7 text-muted">
                Backup invites already exist for this lead, but Simple Mode keeps them out of the main workflow by default.
              </p>
              <div className="mt-5">
                <InviteGroupSection
                  title="Backup helper invites"
                  invites={backupInvites}
                  emptyMessage="No backup helper invites have been dispatched for this lead."
                />
              </div>
            </Card>
          ) : null}

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

function InviteGroupSection({
  title,
  invites,
  emptyMessage,
}: {
  title: string;
  invites: Array<{
    id: string;
    status: string;
    deliveryStatus: string;
    deliveryAttemptedAt: Date | null;
    deliveryError: string | null;
    sentAt: Date;
    respondedAt: Date | null;
    expiresAt: Date | null;
    estimatedPrice: number | null;
    availabilityNote: string | null;
    responseToken: string;
    helper: {
      id: string;
      name: string;
      status: string;
      isActive: boolean;
    };
  }>;
  emptyMessage: string;
}) {
  return (
    <div className="rounded-[22px] border-[3px] border-line bg-cream p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">{title}</div>
      {invites.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-muted">{emptyMessage}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="rounded-[18px] border-[3px] border-line bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-black">{invite.helper.name}</div>
                <span className="retro-pill bg-paper px-3 py-1 text-xs font-black uppercase text-ink">
                  {getInviteStatusLabel(invite.status, invite.expiresAt)}
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <InviteMeta
                  label="Helper Status"
                  value={`${titleizeEnum(invite.helper.status)}${invite.helper.isActive ? "" : " · Inactive"}`}
                />
                <InviteMeta label="Delivery Status" value={getDeliveryStatusLabel(invite.deliveryStatus)} />
                <InviteMeta label="Delivery Attempted" value={formatDateTime(invite.deliveryAttemptedAt)} />
                <InviteMeta label="Sent At" value={formatDateTime(invite.sentAt)} />
                <InviteMeta label="Responded At" value={formatDateTime(invite.respondedAt)} />
                <InviteMeta label="Expires At" value={formatDateTime(invite.expiresAt)} />
                <InviteMeta
                  label="Estimated Price"
                  value={invite.estimatedPrice ? formatCurrency(invite.estimatedPrice) : "-"}
                />
                <InviteMeta label="Availability Note" value={invite.availabilityNote ?? "-"} />
                <InviteMeta label="Delivery Error" value={invite.deliveryError ?? "-"} />
              </div>
              <a
                href={getLeadInviteResponseUrl(invite.responseToken, "accepted")}
                target="_blank"
                rel="noreferrer"
                className={`mt-3 ${buttonStyles({ tone: "yellow", size: "sm" })}`}
              >
                Open Helper Response Link
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InviteMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border-[3px] border-line bg-paper px-3 py-3">
      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function getInviteStatusLabel(status: string, expiresAt: Date | null) {
  if (status === "PENDING" && expiresAt && expiresAt.getTime() < Date.now()) {
    return "Expired";
  }

  if (status === "ACCEPTED") {
    return "Interested";
  }

  if (status === "DECLINED" || status === "UNAVAILABLE") {
    return "Not Available";
  }

  if (status === "PENDING") {
    return "Pending";
  }

  return titleizeEnum(status);
}

function getSimpleInviteStatusLabel(status: string | null, expiresAt: Date | null) {
  if (!status) {
    return "Not sent yet";
  }

  return getInviteStatusLabel(status, expiresAt);
}

function getDeliveryStatusLabel(status: string | null) {
  if (status === "SENT") {
    return "Sent";
  }

  if (status === "FAILED") {
    return "Failed";
  }

  return "Pending";
}
