import Link from "next/link";
import { getCategoryLabel, getTaskTypeLabel } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getUserRequestSummary } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  buttonStyles,
  Card,
  EmptyState,
  SectionHeading,
  SiteHeader,
  StatusBadge,
} from "@/components/ui";

export default async function DashboardPage() {
  const session = await requireUser();
  const leads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      category: true,
      taskType: true,
      deadline: true,
      budget: true,
      dealValue: true,
      status: true,
      leadTemperature: true,
      selectedHelper: {
        select: { name: true },
      },
      assignedHelper: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const summary = getUserRequestSummary(leads);

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className={buttonStyles({ tone: "yellow", size: "sm" })}>
            Back to Home
          </Link>
        </div>

        <SectionHeading
          eyebrow="Dashboard"
          title={`Hi ${session.user.name.split(" ")[0]}, here's your request board`}
          description="Track every brief, see whether admin has assigned a helper, and know what still needs follow-up."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card className="bg-yellow">
            <div className="text-sm font-black uppercase tracking-[0.16em]">Submitted Requests</div>
            <div className="mt-3 display-font text-5xl font-black">{leads.length}</div>
          </Card>
          <Card className="bg-purple text-white">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-white">Active Requests</div>
            <div className="mt-3 display-font text-5xl font-black text-white">{summary.activeCount}</div>
            <div className="mt-2 text-sm font-semibold text-white/85">Requests still in progress</div>
          </Card>
          <Card className="bg-white">
            <div className="text-sm font-black uppercase tracking-[0.16em]">Waiting For Admin</div>
            <div className="mt-3 display-font text-5xl font-black">{summary.waitingForAdminCount}</div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="bg-white">
            <div className="text-sm font-black uppercase tracking-[0.16em]">Quick Action</div>
            <Link
              href="/requirements"
              className={`mt-4 ${buttonStyles({ tone: "purple", size: "md" })}`}
            >
              Start New Request
            </Link>
          </Card>
          <Card className="bg-pink">
            <div className="display-font text-2xl font-black">How statuses work</div>
            <div className="mt-4 grid gap-2 text-sm font-semibold">
              <p>New: your brief is saved and waiting for admin follow-up.</p>
              <p>Contacted: admin has started handling your request.</p>
              <p>Assigned: a helper has been manually assigned.</p>
              <p>Completed: the assignment cycle is closed.</p>
            </div>
          </Card>
        </div>

        <div className="mt-10">
          {leads.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Create your first assignment brief and we'll line up a helper shortlist for you."
              action={
                <Link href="/requirements" className={buttonStyles({ tone: "purple", size: "md" })}>
                  Start a brief
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="bg-white">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="display-font text-2xl font-black">
                        {getCategoryLabel(lead.category)} · {getTaskTypeLabel(lead.taskType)}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        Deadline {formatDate(lead.deadline)} · Budget {formatCurrency(lead.budget)} ·
                        Preferred helper {lead.selectedHelper?.name ?? "Not selected"}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-muted">
                        Assigned helper {lead.assignedHelper?.name ?? "Pending admin assignment"} · Deal
                        value {formatCurrency(lead.dealValue)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={lead.status} />
                      <span className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                        {lead.leadTemperature}
                      </span>
                      <Link
                        href={`/dashboard/requests/${lead.id}`}
                        className={buttonStyles({ tone: "yellow", size: "sm" })}
                      >
                        View Request
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
