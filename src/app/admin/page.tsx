import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { logServerDataLoadError } from "@/lib/server-load";
import { calculateLeadFunnel } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";
import { getCategoryLabel, getTaskTypeLabel } from "@/lib/helpers";
import {
  buttonStyles,
  Card,
  EmptyState,
  MetricCard,
  SectionHeading,
  StatusBadge,
} from "@/components/ui";
import { AdminTestEmailButton } from "@/components/admin-test-email-button";

export default async function AdminOverviewPage() {
  const [allLeadsResult, recentLeadsResult, eventSummaryResult, recentEventsResult] = await Promise.allSettled([
    prisma.lead.findMany({
      select: {
        status: true,
        selectedHelperId: true,
        assignedHelperId: true,
        dealClosed: true,
        dealValue: true,
      },
    }),
    prisma.lead.findMany({
      select: {
        id: true,
        category: true,
        taskType: true,
        createdAt: true,
        status: true,
        leadScore: true,
        dealClosed: true,
        dealValue: true,
        selectedHelper: {
          select: { name: true },
        },
        assignedHelper: {
          select: { name: true },
        },
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.eventLog.groupBy({
      by: ["eventType"],
      _count: {
        _all: true,
      },
      orderBy: {
        eventType: "asc",
      },
    }),
    prisma.eventLog.findMany({
      select: {
        id: true,
        eventType: true,
        helperId: true,
        draftId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  if (allLeadsResult.status === "rejected") {
    logServerDataLoadError("admin-overview-funnel", allLeadsResult.reason);
  }

  if (recentLeadsResult.status === "rejected") {
    logServerDataLoadError("admin-overview-recent-leads", recentLeadsResult.reason);
  }

  if (eventSummaryResult.status === "rejected") {
    logServerDataLoadError("admin-overview-event-summary", eventSummaryResult.reason);
  }

  if (recentEventsResult.status === "rejected") {
    logServerDataLoadError("admin-overview-recent-events", recentEventsResult.reason);
  }

  const allLeads = allLeadsResult.status === "fulfilled" ? allLeadsResult.value : [];
  const recentLeads =
    recentLeadsResult.status === "fulfilled" ? recentLeadsResult.value : [];
  const eventSummary: Array<{ eventType: string; _count: { _all: number } }> =
    eventSummaryResult.status === "fulfilled" ? eventSummaryResult.value : [];
  const recentEvents: Array<{
    id: string;
    eventType: string;
    helperId: string | null;
    draftId: string | null;
    createdAt: Date;
  }> = recentEventsResult.status === "fulfilled" ? recentEventsResult.value : [];
  const funnelUnavailable = allLeadsResult.status === "rejected";
  const recentLeadsUnavailable = recentLeadsResult.status === "rejected";
  const eventsUnavailable =
    eventSummaryResult.status === "rejected" || recentEventsResult.status === "rejected";

  const funnel = calculateLeadFunnel(allLeads);

  return (
    <div>
      <SectionHeading
        eyebrow="Admin Dashboard"
        title="Lead overview"
        description="Keep the entire controlled funnel visible: student selection, admin assignment, closed deals, and revenue."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="User Selected" value={String(funnel.userSelectedCount)} hint="Leads with a chosen helper" />
        <MetricCard label="Admin Assigned" value={String(funnel.adminAssignedCount)} hint="Leads manually assigned by admin" tone="pink" />
        <MetricCard label="Closed Deals" value={String(funnel.closedDealsCount)} hint={`Conversion ${funnel.conversionRate}%`} tone="green" />
        <MetricCard label="Estimated Revenue" value={formatCurrency(funnel.revenue)} hint="Summed from closed deal values" tone="yellow" />
      </div>

      {funnelUnavailable ? (
        <div className="mt-5 rounded-[20px] border-[3px] border-line bg-yellow px-5 py-4 text-sm font-semibold text-ink">
          Pipeline metrics are temporarily unavailable. The dashboard is still usable while the database reconnects.
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-white">
          <div className="display-font text-3xl font-black">Pipeline snapshot</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <PipelineStat label="Total leads" value={String(funnel.totalLeads)} />
            <PipelineStat label="Contacted" value={String(funnel.contactedCount)} />
            <PipelineStat label="User selected" value={String(funnel.userSelectedCount)} />
            <PipelineStat label="Admin assigned" value={String(funnel.adminAssignedCount)} />
            <PipelineStat label="Closed deals" value={String(funnel.closedDealsCount)} />
            <PipelineStat label="Revenue" value={formatCurrency(funnel.revenue)} />
          </div>
        </Card>

        <Card className="bg-yellow">
          <div className="display-font text-3xl font-black">Working rules</div>
          <div className="mt-5 grid gap-3 text-sm font-semibold">
            <p>Students pick a preferred helper, but admin still owns the actual assignment decision.</p>
            <p>Lead temperature stays derived from score, not manually edited.</p>
            <p>Revenue only reflects closed deals with a stored deal value.</p>
            <p>Inactive helpers remain visible historically in admin metrics and records.</p>
          </div>
        </Card>
      </div>

      <AdminTestEmailButton />

      <div className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-white">
          <div className="display-font text-3xl font-black">Event funnel</div>
          <p className="mt-2 text-sm text-muted">
            Lightweight visibility into helper discovery, profile views, CTA clicks, WhatsApp handoff, and form submits.
          </p>
          {eventsUnavailable ? (
            <div className="mt-5 rounded-[20px] border-[3px] border-line bg-cream px-5 py-4 text-sm font-semibold text-ink">
              Event tracking data could not load right now. The rest of the dashboard remains available.
            </div>
          ) : null}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {eventSummary.length === 0 ? (
              <EmptyState
                title="No event activity yet"
                description="Event totals will appear here once helper discovery traffic starts flowing."
              />
            ) : eventSummary.map((entry) => (
              <PipelineStat
                key={entry.eventType}
                label={entry.eventType.replaceAll("_", " ")}
                value={String(entry._count._all)}
              />
            ))}
          </div>
        </Card>

        <Card className="bg-cream">
          <div className="display-font text-3xl font-black">Recent event logs</div>
          <p className="mt-2 text-sm text-muted">
            A quick operational view of the latest customer-side funnel actions.
          </p>
          <div className="mt-6 space-y-3">
            {recentEvents.length === 0 ? (
              <EmptyState
                title="No recent events"
                description="Recent helper list views, card clicks, and redirects will show up here."
              />
            ) : recentEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-[18px] border-[3px] border-line bg-white px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="display-font text-xl font-black">
                    {event.eventType.replaceAll("_", " ")}
                  </div>
                  <span className="retro-pill bg-yellow px-3 py-1 text-xs font-black uppercase text-ink">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  Helper {event.helperId ? event.helperId.slice(0, 8) : "-"} · Draft{" "}
                  {event.draftId ? event.draftId.slice(0, 8) : "-"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-10 retro-card bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="display-font text-3xl font-black">Recent leads</div>
            <p className="mt-2 text-sm text-muted">Jump into the live pipeline and keep the data loop moving.</p>
          </div>
          <Link href="/admin/leads" className={buttonStyles({ tone: "purple", size: "md" })}>
            Open Leads Table
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {recentLeadsUnavailable ? (
            <div className="rounded-[20px] border-[3px] border-line bg-cream px-5 py-4 text-sm font-semibold text-ink">
              Recent leads could not load right now. Try refreshing in a moment.
            </div>
          ) : null}
          {recentLeads.length === 0 ? (
            <EmptyState
              title="No leads yet"
              description="New student requests will appear here as soon as the first brief is matched."
            />
          ) : recentLeads.map((lead) => (
            <Card key={lead.id} className="bg-cream">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center">
                <div>
                  <div className="display-font text-2xl font-black">
                    {lead.id.slice(0, 8)} · {lead.user?.name ?? "Guest lead"}
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {getCategoryLabel(lead.category)} · {getTaskTypeLabel(lead.taskType)} · created {formatDate(lead.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Selected {lead.selectedHelper?.name ?? "-"} · Assigned {lead.assignedHelper?.name ?? "-"} · Revenue{" "}
                    {formatCurrency(lead.dealValue)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={lead.status} />
                  <span className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase">
                    Score {lead.leadScore}
                  </span>
                  {lead.dealClosed ? (
                    <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
                      Closed
                    </span>
                  ) : null}
                </div>
                <Link href={`/admin/leads/${lead.id}`} className={buttonStyles({ tone: "yellow", size: "sm" })}>
                  Manage
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function PipelineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border-[3px] border-line bg-cream p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</div>
      <div className="mt-2 text-xl font-black">{value}</div>
    </div>
  );
}
