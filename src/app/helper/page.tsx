import { prisma } from "@/lib/prisma";
import { requireApprovedHelper } from "@/lib/auth";
import { getHelperAssignedLeadSummary, getHelperProfileCompletion } from "@/lib/helper-dashboard";
import { getCategoryLabel, getHelperStatusLabel, getHelperTypeLabel } from "@/lib/helpers";
import { formatCurrency } from "@/lib/format";
import { Card, MetricCard, SectionHeading } from "@/components/ui";

export default async function HelperOverviewPage() {
  const { helper } = await requireApprovedHelper();
  const leads = await prisma.lead.findMany({
    where: {
      assignedHelperId: helper.id,
    },
    select: {
      status: true,
      dealClosed: true,
      dealValue: true,
    },
  });

  const summary = getHelperAssignedLeadSummary(leads);
  const profileCompletion = getHelperProfileCompletion(helper);
  const completionHighlights = profileCompletion.checks.filter((check) => !check.complete).slice(0, 3);

  return (
    <div>
      <SectionHeading
        eyebrow="Helper Dashboard"
        title={`${helper.name.split(" ")[0]}'s PowerDashboard`}
        description="This view uses only leads assigned to you by admin, so the workload and earnings snapshot stay clean."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assigned Leads" value={String(summary.totalAssignedLeads)} hint="Only admin-assigned jobs appear here." />
        <MetricCard label="Completed Jobs" value={String(summary.completedJobsCount)} hint="Completed based on assigned lead status." tone="green" />
        <MetricCard label="Deal Value" value={summary.totalDealValue > 0 ? formatCurrency(summary.totalDealValue) : "RM0"} hint="Closed completed jobs only." tone="yellow" />
        <MetricCard label="Profile Completion" value={profileCompletion.label} hint={`${profileCompletion.completed}/${profileCompletion.total} fields complete`} tone="pink" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="bg-white">
          <div className="display-font text-3xl font-black">Helper status</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoRow label="Name" value={helper.name} />
            <InfoRow label="Type" value={getHelperTypeLabel(helper.type)} />
            <InfoRow label="Status" value={getHelperStatusLabel(helper.status)} />
            <InfoRow label="Category" value={getCategoryLabel(helper.category)} />
            <InfoRow label="Projects completed" value={`${helper.projectsCompleted}+`} />
            <InfoRow label="Team size" value={helper.type === "TEAM" ? String(helper.teamSize ?? "-") : "Individual"} />
          </div>
        </Card>

        <Card className="bg-yellow">
          <div className="display-font text-3xl font-black">Trust & completion</div>
          <div className="mt-4 h-4 overflow-hidden rounded-full border-[3px] border-line bg-white">
            <div
              className="h-full bg-green transition-all"
              style={{ width: `${profileCompletion.percent}%` }}
            />
          </div>
          <div className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-ink/70">
            {profileCompletion.label}
          </div>
          <div className="mt-5 grid gap-3 text-sm font-semibold">
            <p>Only leads where admin set your id as the assigned helper.</p>
            <p>No access to other helpers, admin metrics, or student-only selections.</p>
            <p>Profile editing is limited to your own helper record.</p>
            <p>Payments and payouts are intentionally not part of this phase.</p>
          </div>
          {completionHighlights.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {completionHighlights.map((item) => (
                <span
                  key={item.key}
                  className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase"
                >
                  Finish {item.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
                Trust profile complete
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border-[3px] border-line bg-cream p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</div>
      <div className="mt-2 text-base font-black">{value}</div>
    </div>
  );
}
