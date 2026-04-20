"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles, Card, EmptyState } from "@/components/ui";
import {
  getCategoryLabel,
  getHelperStatusLabel,
  getHelperTypeLabel,
} from "@/lib/helpers";
import { formatDate } from "@/lib/format";

type ApplicationRecord = {
  id: string;
  name: string;
  type: string;
  teamSize: number | null;
  category: string;
  status: string;
  shortBio: string;
  portfolioNote: string | null;
  email: string | null;
  whatsappNumber: string | null;
  createdAt: string;
};

export function AdminApplicationsManager({
  applications,
}: {
  applications: ApplicationRecord[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  async function decideApplication(
    applicationId: string,
    status: "APPROVED" | "REJECTED",
  ) {
    if (busyId) {
      return;
    }

    setBusyId(applicationId);

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await response.json();

      if (!response.ok) {
        setFeedback((current) => ({
          ...current,
          [applicationId]: json.error ?? "Could not update application.",
        }));
        return;
      }

      setFeedback((current) => ({
        ...current,
        [applicationId]: `${json.message} Notifications were triggered automatically.`,
      }));
      router.refresh();
    } catch {
      setFeedback((current) => ({
        ...current,
        [applicationId]: "Could not update application.",
      }));
    } finally {
      setBusyId("");
    }
  }

  return applications.length === 0 ? (
    <EmptyState
      title="No helper applications yet"
      description="New helper applications from /become-helper will appear here for review."
    />
  ) : (
    <div className="space-y-4">
      {applications.map((application) => {
        const itemFeedback = feedback[application.id];
        const isPending = application.status === "PENDING";
        const isApproved = application.status === "APPROVED";

        return (
          <Card key={application.id} className="bg-white">
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.95fr_auto] xl:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="display-font text-2xl font-black">
                    {application.name}
                  </div>
                  <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">
                    {getHelperTypeLabel(application.type)}
                  </span>
                  <span className="retro-pill bg-yellow px-3 py-1 text-xs font-black uppercase text-ink">
                    {getHelperStatusLabel(application.status)}
                  </span>
                  {application.teamSize ? (
                    <span className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                      {application.teamSize} people
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted">
                  {getCategoryLabel(application.category)} | Submitted{" "}
                  {formatDate(application.createdAt)}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {application.shortBio}
                </p>
                <div className="mt-3 inline-flex rounded-[16px] border-[3px] border-line bg-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-ink">
                  Experience snippet: {application.shortBio.slice(0, 90)}
                  {application.shortBio.length > 90 ? "..." : ""}
                </div>
                {application.portfolioNote ? (
                  <p className="mt-3 rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm leading-7 text-muted">
                    <span className="font-black text-ink">Portfolio:</span>{" "}
                    {application.portfolioNote}
                  </p>
                ) : null}
                <div className="mt-3 text-sm text-muted">
                  <div>
                    Email:{" "}
                    <span className="font-black text-ink">
                      {application.email ?? "-"}
                    </span>
                  </div>
                  <div>
                    WhatsApp:{" "}
                    <span className="font-black text-ink">
                      {application.whatsappNumber ?? "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border-[3px] border-line bg-cream p-4 text-sm text-muted">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Flow
                </div>
                <p className="mt-2">Pending means submitted.</p>
                <p>Approved means reviewed but still hidden from public.</p>
                <p>Activation still happens from the helper roster.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!isPending || busyId === application.id}
                  onClick={() => decideApplication(application.id, "APPROVED")}
                  className={buttonStyles({ tone: "green", size: "sm" })}
                >
                  {busyId === application.id && isPending ? "Saving..." : "Approve"}
                </button>
                <button
                  type="button"
                  disabled={(!isPending && !isApproved) || busyId === application.id}
                  onClick={() => decideApplication(application.id, "REJECTED")}
                  className={buttonStyles({ tone: "ink", size: "sm" })}
                >
                  {busyId === application.id && !isPending ? "Saving..." : "Reject"}
                </button>
              </div>
            </div>

            {itemFeedback ? (
              <div className="mt-5 rounded-[20px] border-[3px] border-line bg-cream p-4">
                <div className="text-sm font-bold text-ink">{itemFeedback}</div>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
