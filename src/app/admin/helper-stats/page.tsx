import Link from "next/link";
import { subDays } from "date-fns";
import { getCategoryLabel } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Card, EmptyState, SectionHeading } from "@/components/ui";

export default async function HelperStatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = readQuery(params.range) ?? "all";
  const fromDate =
    range === "week" ? subDays(new Date(), 7) : range === "month" ? subDays(new Date(), 30) : null;

  const [helpers, leads] = await Promise.all([
    prisma.helper.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
      },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.lead.findMany({
      where: fromDate ? { createdAt: { gte: fromDate } } : {},
      select: {
        selectedHelperId: true,
        assignedHelperId: true,
        dealClosed: true,
        dealValue: true,
      },
    }),
  ]);

  const rows = helpers.map((helper) => {
    const selected = leads.filter((lead) => lead.selectedHelperId === helper.id);
    const assigned = leads.filter((lead) => lead.assignedHelperId === helper.id);
    const closed = assigned.filter((lead) => lead.dealClosed);
    const revenue = closed.reduce((sum, lead) => sum + (lead.dealValue ?? 0), 0);
    const conversion = selected.length ? Math.round((closed.length / selected.length) * 100) : 0;

    return {
      helper,
      selected: selected.length,
      assigned: assigned.length,
      closed: closed.length,
      revenue,
      conversion,
    };
  });

  return (
    <div>
      <SectionHeading
        eyebrow="Performance"
        title="Helper stats"
        description="User-selected, admin-assigned, and closed counts are tracked separately. Conversion is closed deals divided by user-selected count."
      />
      <div className="mt-6 flex flex-wrap gap-3">
        {[
          ["week", "This Week"],
          ["month", "This Month"],
          ["all", "All Time"],
        ].map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/helper-stats?range=${value}`}
            className={`retro-pill px-4 py-2 text-sm font-black uppercase ${range === value ? "bg-purple text-white" : "bg-white"}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        {rows.length === 0 ? (
          <EmptyState
            title="No helpers to analyze yet"
            description="Create at least one active helper to start tracking selections, assignments, closures, and revenue."
          />
        ) : rows.map((row) => (
          <Card key={row.helper.id} className="bg-white">
            <div className="grid gap-4 lg:grid-cols-6 lg:items-center">
              <div>
                <div className="display-font text-2xl font-black">{row.helper.name}</div>
                <p className="mt-2 text-sm text-muted">
                  {getCategoryLabel(row.helper.category)}
                  {!row.helper.isActive ? " · Inactive" : ""}
                </p>
              </div>
              <Stat label="User Selected" value={String(row.selected)} />
              <Stat label="Admin Assigned" value={String(row.assigned)} />
              <Stat label="Closed Deals" value={String(row.closed)} />
              <Stat label="Conversion Rate" value={`${row.conversion}%`} />
              <Stat label="Estimated Revenue" value={formatCurrency(row.revenue)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border-[3px] border-line bg-cream p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</div>
      <div className="mt-2 text-lg font-black">{value}</div>
    </div>
  );
}

function readQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
