import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireApprovedHelper } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { getCategoryLabel, getTaskTypeLabel } from "@/lib/helpers";
import { buttonStyles, Card, EmptyState, SectionHeading, StatusBadge } from "@/components/ui";

export default async function HelperLeadsPage() {
  const { helper } = await requireApprovedHelper();
  const leads = await prisma.lead.findMany({
    where: {
      assignedHelperId: helper.id,
    },
    select: {
      id: true,
      category: true,
      taskType: true,
      urgency: true,
      deadline: true,
      budget: true,
      description: true,
      status: true,
      dealClosed: true,
      dealValue: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <SectionHeading
        eyebrow="Assigned Leads"
        title="Only jobs assigned to you"
        description="This page excludes selected-only leads and shows only the briefs admin has assigned to your helper record."
      />

      <div className="mt-8">
        {leads.length === 0 ? (
          <EmptyState
            title="No assigned leads yet"
            description="As soon as admin assigns a lead to your helper record, it will appear here."
            action={
              <Link href="/helper" className={buttonStyles({ tone: "purple", size: "md" })}>
                Back to overview
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <Card key={lead.id} className="bg-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="display-font text-2xl font-black">
                      {getCategoryLabel(lead.category)} · {getTaskTypeLabel(lead.taskType)}
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      Assigned brief created {formatDate(lead.createdAt)} · Deadline {formatDate(lead.deadline)} · Budget {formatCurrency(lead.budget)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Urgency {lead.urgency.toLowerCase()} · Deal value {formatCurrency(lead.dealValue)}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ink">{lead.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={lead.status} />
                    {lead.dealClosed ? (
                      <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
                        Closed
                      </span>
                    ) : null}
                    <span className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                      {lead.id.slice(0, 8)}
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
