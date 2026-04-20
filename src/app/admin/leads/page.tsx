import Link from "next/link";
import { subHours } from "date-fns";
import { Prisma } from "@prisma/client";
import { categoryOptions } from "@/lib/constants";
import { getCategoryLabel, getTaskTypeLabel } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { logServerDataLoadError } from "@/lib/server-load";
import { formatCurrency, formatDate, titleizeEnum } from "@/lib/format";
import { buttonStyles, Card, EmptyState, SectionHeading, StatusBadge } from "@/components/ui";

async function getAdminLeads(where: Prisma.LeadWhereInput) {
  return prisma.lead.findMany({
    where,
    select: {
      id: true,
      createdAt: true,
      category: true,
      taskType: true,
      urgency: true,
      status: true,
      leadScore: true,
      dealValue: true,
      dealClosed: true,
      user: {
        select: { name: true },
      },
      selectedHelper: {
        select: { name: true },
      },
      assignedHelper: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = readQuery(params.q);
  const category = readQuery(params.category);
  const status = readQuery(params.status);
  const from = readQuery(params.from);
  const to = readQuery(params.to);

  const where: Prisma.LeadWhereInput = {
    ...(query
      ? {
          OR: [
            { description: { contains: query } },
            { notes: { contains: query } },
            { selectedHelper: { name: { contains: query } } },
            { assignedHelper: { name: { contains: query } } },
            { user: { name: { contains: query } } },
          ],
        }
      : {}),
    ...(category && category !== "ALL" ? { category: category as never } : {}),
    ...(status && status !== "ALL" ? { status: status as never } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  let leads: Awaited<ReturnType<typeof getAdminLeads>> = [];

  try {
    leads = await getAdminLeads(where);
  } catch (error) {
    logServerDataLoadError("admin-leads-page", error);
  }

  return (
    <div>
      <SectionHeading
        eyebrow="CRM"
        title="Leads table"
        description="Filter the full lead list and keep selection, assignment, closure, and revenue visible in one place."
      />
      <form className="mt-8 retro-card grid gap-4 bg-white p-5 md:grid-cols-5">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search student, helper, notes"
          className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
        />
        <select
          name="category"
          defaultValue={category ?? "ALL"}
          className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
        >
          <option value="ALL">All categories</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? "ALL"}
          className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
        >
          <option value="ALL">All statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <input
          name="from"
          type="date"
          defaultValue={from}
          className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
        />
        <div className="flex gap-3">
          <input
            name="to"
            type="date"
            defaultValue={to}
            className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
          />
          <button className={buttonStyles({ tone: "purple", size: "md" })}>Filter</button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {leads.length === 0 && (query || category || status || from || to) ? (
          <div className="rounded-[20px] border-[3px] border-line bg-yellow px-5 py-4 text-sm font-semibold text-ink">
            Lead data is temporarily unavailable or no leads match these filters.
          </div>
        ) : null}
        {leads.length === 0 ? (
          <EmptyState
            title="No leads match these filters"
            description="Try clearing one or more filters to bring the current pipeline back into view."
          />
        ) : leads.map((lead) => {
          const stale = lead.status === "NEW" && lead.createdAt < subHours(new Date(), 24);

          return (
            <Card key={lead.id} className="bg-white">
              <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr_1fr_auto] lg:items-center">
                <div>
                  <div className="display-font text-2xl font-black">{lead.id.slice(0, 8)}</div>
                  <p className="mt-2 text-sm text-muted">
                    {lead.user?.name ?? "Guest lead"} · {formatDate(lead.createdAt)} · {getCategoryLabel(lead.category)} ·{" "}
                    {getTaskTypeLabel(lead.taskType)}
                  </p>
                </div>
                <div className="text-sm text-muted">
                  <div>
                    Preferred helper: <span className="font-black text-ink">{lead.selectedHelper?.name ?? "-"}</span>
                  </div>
                  <div>
                    Assigned helper: <span className="font-black text-ink">{lead.assignedHelper?.name ?? "-"}</span>
                  </div>
                  <div>
                    Urgency: <span className="font-black text-ink">{titleizeEnum(lead.urgency)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={lead.status} />
                  <span className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                    Score {lead.leadScore}
                  </span>
                  <span className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                    {formatCurrency(lead.dealValue)}
                  </span>
                  {lead.dealClosed ? (
                    <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
                      Closed
                    </span>
                  ) : null}
                  {stale ? (
                    <span className="retro-pill bg-red px-3 py-1 text-xs font-black uppercase text-white">
                      Stale 24h+
                    </span>
                  ) : null}
                </div>
                <Link href={`/admin/leads/${lead.id}`} className={buttonStyles({ tone: "yellow", size: "md" })}>
                  Open
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function readQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
