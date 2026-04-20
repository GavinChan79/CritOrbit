import { prisma } from "@/lib/prisma";
import { requireApprovedHelper } from "@/lib/auth";
import { getHelperAssignedLeadSummary } from "@/lib/helper-dashboard";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, EmptyState, MetricCard, SectionHeading, StatusBadge } from "@/components/ui";

export default async function HelperEarningsPage() {
  const { helper } = await requireApprovedHelper();
  const completedLeads = await prisma.lead.findMany({
    where: {
      assignedHelperId: helper.id,
      status: "COMPLETED",
    },
    select: {
      id: true,
      deadline: true,
      status: true,
      dealClosed: true,
      dealValue: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const summary = getHelperAssignedLeadSummary(completedLeads);

  return (
    <div>
      <SectionHeading
        eyebrow="Helper Earnings"
        title="Read-only earnings snapshot"
        description="This view is informational only for now. No payouts, escrow, or payment logic are included in this phase."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <MetricCard label="Completed Jobs" value={String(summary.completedJobsCount)} hint="Completed jobs assigned to you." />
        <MetricCard label="Total Deal Value" value={summary.totalDealValue > 0 ? formatCurrency(summary.totalDealValue) : "RM0"} hint="Closed completed jobs only." tone="green" />
        <MetricCard label="Estimated Earnings" value="Coming soon" hint="Placeholder until payout logic is introduced." tone="yellow" />
      </div>

      <div className="mt-8">
        {completedLeads.length === 0 ? (
          <EmptyState
            title="No completed jobs yet"
            description="Completed assigned leads will appear here once admin closes them."
          />
        ) : (
          <div className="space-y-4">
            {completedLeads.map((lead) => (
              <Card key={lead.id} className="bg-white">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="display-font text-2xl font-black">{lead.id.slice(0, 8)}</div>
                    <p className="mt-2 text-sm text-muted">
                      Created {formatDate(lead.createdAt)} · Deadline {formatDate(lead.deadline)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Deal value {formatCurrency(lead.dealValue)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={lead.status} />
                    <span className={`retro-pill px-3 py-1 text-xs font-black uppercase ${lead.dealClosed ? "bg-green text-white" : "bg-cream text-ink"}`}>
                      {lead.dealClosed ? "Closed deal" : "Pending close"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
