import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryLabel, getTaskTypeLabel } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate, titleizeEnum } from "@/lib/format";
import { buttonStyles, Card, SectionHeading, SiteHeader, StatusBadge } from "@/components/ui";

const timelineSteps = [
  { key: "NEW", label: "New", description: "Your request has been saved and is waiting for admin follow-up." },
  { key: "CONTACTED", label: "Contacted", description: "Admin has started handling the request." },
  { key: "ASSIGNED", label: "Assigned", description: "A helper has been manually assigned to the request." },
  { key: "COMPLETED", label: "Completed", description: "The assignment cycle has been marked complete." },
] as const;

export default async function StudentRequestDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const session = await requireUser();
  const { leadId } = await params;

  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      userId: session.user.id,
    },
    include: {
      selectedHelper: true,
      assignedHelper: true,
    },
  });

  if (!lead) {
    notFound();
  }

  const currentStepIndex = timelineSteps.findIndex((step) => step.key === lead.status);

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className={buttonStyles({ tone: "ink", size: "sm" })}>
            Back to Home
          </Link>
          <Link href="/dashboard" className={buttonStyles({ tone: "yellow", size: "sm" })}>
            Back to Dashboard
          </Link>
          <StatusBadge status={lead.status} />
        </div>

        <div className="mt-5">
          <SectionHeading
            eyebrow="Request Detail"
            title={`${getCategoryLabel(lead.category)} · ${getTaskTypeLabel(lead.taskType)}`}
            description="A single view of your request summary, current status, helper choices, and progress timeline."
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Card className="bg-white">
              <div className="display-font text-2xl font-black">Request summary</div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Detail label="Current Status" value={titleizeEnum(lead.status)} />
                <Detail label="Deadline" value={formatDate(lead.deadline)} />
                <Detail label="Budget" value={formatCurrency(lead.budget)} />
                <Detail label="Lead Temperature" value={titleizeEnum(lead.leadTemperature)} />
                <Detail label="Selected Helper" value={lead.selectedHelper?.name ?? "No helper selected"} />
                <Detail label="Assigned Helper" value={lead.assignedHelper?.name ?? "Not assigned yet"} />
              </div>
            </Card>

            <Card className="bg-white">
              <div className="display-font text-2xl font-black">Description</div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{lead.description}</p>
            </Card>
          </div>

          <Card className="bg-white">
            <div className="display-font text-2xl font-black">Status timeline</div>
            <div className="mt-6 space-y-4">
              {timelineSteps.map((step, index) => {
                const completed = index <= currentStepIndex;
                const current = step.key === lead.status;

                return (
                  <div
                    key={step.key}
                    className={`rounded-[20px] border-[3px] border-line p-4 ${
                      current ? "bg-yellow" : completed ? "bg-green text-white" : "bg-cream"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="display-font text-xl font-black">{step.label}</div>
                      <span className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase text-ink">
                        {current ? "Current" : completed ? "Reached" : "Pending"}
                      </span>
                    </div>
                    <p className={`mt-3 text-sm leading-7 ${completed && !current ? "text-white/85" : "text-muted"}`}>
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
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
