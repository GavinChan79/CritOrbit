import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Card, SectionHeading, buttonStyles } from "@/components/ui";
import { HelperInviteResponseFollowUp } from "@/components/helper-invite-response-followup";
import { getCategoryLabel, getTaskTypeLabel } from "@/lib/helpers";
import { formatDate } from "@/lib/format";
import { getLeadInviteByToken } from "@/lib/lead-invite-response";
import { prisma } from "@/lib/prisma";
import { helperInviteResponseDecisionSchema } from "@/lib/validators";

export default async function HelperInviteResponsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();
  const params = await searchParams;
  const token = getQueryValue(params.token);
  const decisionValue = getQueryValue(params.decision);
  const decision = helperInviteResponseDecisionSchema.safeParse(decisionValue);

  if (!token || !decision.success) {
    return <InviteState title="Invite link unavailable" description="This helper invite link is invalid or incomplete." tone="error" />;
  }

  const invite = await getLeadInviteByToken(token);

  if (!invite) {
    return <InviteState title="Invite not found" description="This invite link is invalid or has already been removed." tone="error" />;
  }

  if (invite.status === "PENDING" && invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    await prisma.leadInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });

    return <InviteState title="Invite expired" description="This opportunity has expired. You can ignore the link or wait for a new invite." tone="warning" />;
  }

  if (invite.status !== "PENDING") {
    return (
      <InviteState
        title="Response already recorded"
        description={`This invite was already marked as ${invite.status.toLowerCase()}. No further action is needed.`}
        tone="info"
      />
    );
  }

  const nextStatus = mapDecisionToStatus(decision.data);

  await prisma.leadInvite.update({
    where: { id: invite.id },
    data: {
      status: nextStatus,
      respondedAt: new Date(),
    },
  });

  const summary = `${getCategoryLabel(invite.lead.category)} · ${getTaskTypeLabel(invite.lead.taskType)} · Due ${formatDate(invite.lead.deadline)}`;

  if (nextStatus === "ACCEPTED") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <SectionHeading
          eyebrow="Helper Opportunity"
          title="You’ve marked yourself as interested."
          description="Thanks. Admin can now review your interest before deciding the final assignment."
        />
        <div className="mt-8 space-y-6">
          <Card className="bg-white">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">Invite Summary</div>
            <div className="mt-3 text-xl font-black">{invite.helper.name}</div>
            <p className="mt-2 text-sm leading-7 text-muted">{summary}</p>
          </Card>
          <HelperInviteResponseFollowUp token={token} />
        </div>
      </div>
    );
  }

  return (
    <InviteState
      title={nextStatus === "DECLINED" ? "You’ve declined this opportunity." : "You’ve marked yourself as unavailable."}
      description="Thanks for responding quickly. Admin will continue the invite flow without exposing any student contact details."
      tone="success"
    />
  );
}

function InviteState({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: "success" | "error" | "warning" | "info";
}) {
  const accentClass =
    tone === "success"
      ? "bg-green/20"
      : tone === "warning"
        ? "bg-yellow/40"
        : tone === "info"
          ? "bg-blue/18"
          : "bg-pink/30";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <SectionHeading eyebrow="Helper Opportunity" title={title} description={description} />
      <Card className={`mt-8 ${accentClass}`}>
        <p className="text-sm font-semibold leading-7 text-ink">
          This page is only for helper invite responses. Students are still routed to CritOrbit admin WhatsApp as usual.
        </p>
        <Link href="/" className={`mt-5 ${buttonStyles({ tone: "yellow", size: "md" })}`}>
          Back to CritOrbit
        </Link>
      </Card>
    </div>
  );
}

function getQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function mapDecisionToStatus(decision: "accepted" | "declined" | "unavailable") {
  if (decision === "accepted") {
    return "ACCEPTED" as const;
  }

  if (decision === "declined") {
    return "DECLINED" as const;
  }

  return "UNAVAILABLE" as const;
}
