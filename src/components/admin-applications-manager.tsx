"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles, Card, EmptyState } from "@/components/ui-primitives";
import {
  getCategoryLabel,
  getHelperExperienceLevelLabel,
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
  experienceLevel: string;
  submittedPriceAnchor: string;
  status: string;
  shortBio: string;
  portfolioNote: string | null;
  email: string | null;
  whatsappNumber: string | null;
  agreedToTerms: boolean;
  agreedAt: string | null;
  applicationFiles: Array<{
    id: string;
    kind: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }>;
  createdAt: string;
};

export function AdminApplicationsManager({
  applications,
}: {
  applications: ApplicationRecord[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(applications);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setItems(applications);
  }, [applications]);

  const filteredApplications = useMemo(
    () =>
      items.filter((application) => {
        if (activeFilter === "all") {
          return true;
        }

        if (activeFilter === "pending") {
          return application.status === "PENDING";
        }

        if (activeFilter === "approved") {
          return application.status === "APPROVED";
        }

        return application.status === "REJECTED";
      }),
    [activeFilter, items],
  );

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

      setItems((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status }
            : application,
        ),
      );
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
      <div className="flex flex-wrap gap-3">
        {[
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
          { value: "all", label: "All" },
        ].map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() =>
              setActiveFilter(filter.value as "all" | "pending" | "approved" | "rejected")
            }
            className={
              activeFilter === filter.value
                ? "retro-pill bg-purple px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white"
                : "retro-pill bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-ink"
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <EmptyState
          title="No applications in this filter"
          description="Try another filter or wait for more helper applications."
        />
      ) : filteredApplications.map((application) => {
        const itemFeedback = feedback[application.id];
        const isPending = application.status === "PENDING";
        const isApproved = application.status === "APPROVED";
        const portfolioFiles = application.applicationFiles.filter((file) => file.kind === "PORTFOLIO");
        const identityFront = application.applicationFiles.find((file) => file.kind === "IDENTITY_FRONT");
        const identityBack = application.applicationFiles.find((file) => file.kind === "IDENTITY_BACK");
        const isExpanded = expandedId === application.id;

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
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((current) =>
                        current === application.id ? null : application.id,
                      )
                    }
                    className={buttonStyles({ tone: "yellow", size: "sm" })}
                  >
                    {isExpanded ? "Hide Full Details" : "View Full Details"}
                  </button>
                </div>

                {isExpanded ? (
                  <div className="mt-4 space-y-4">
                    <ApplicationSection title="Basic Info">
                      <ApplicationField label="Name" value={application.name} />
                      <ApplicationField label="Email" value={application.email ?? "-"} />
                      <ApplicationField label="WhatsApp" value={application.whatsappNumber ?? "-"} />
                      <ApplicationField
                        label="Helper Type"
                        value={getHelperTypeLabel(application.type)}
                      />
                      <ApplicationField
                        label="Category"
                        value={getCategoryLabel(application.category)}
                      />
                    </ApplicationSection>

                    <ApplicationSection title="Experience">
                      <ApplicationField
                        label="Experience Level"
                        value={getHelperExperienceLevelLabel(application.experienceLevel)}
                      />
                      <ApplicationField
                        label="Description"
                        value={application.shortBio || "-"}
                        multiline
                      />
                    </ApplicationSection>

                    <ApplicationSection title="Pricing">
                      <ApplicationField
                        label="Starting Price"
                        value={application.submittedPriceAnchor.replace("_PLUS", "+").replace("_", " ")}
                      />
                    </ApplicationSection>

                    <ApplicationSection title="Portfolio">
                      <ApplicationField
                        label="Text"
                        value={application.portfolioNote ?? "-"}
                        multiline
                      />
                      <div className="rounded-[14px] border-[3px] border-line bg-white px-4 py-3">
                        <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                          Files
                        </div>
                        <div className="mt-3 space-y-2">
                          {portfolioFiles.length ? (
                            portfolioFiles.map((file) => (
                              <a
                                key={file.id}
                                href={`/api/helper-application-files/${file.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-[14px] border-[3px] border-line bg-cream px-3 py-2 font-semibold text-ink"
                              >
                                {file.fileName}
                              </a>
                            ))
                          ) : (
                            <p className="text-sm text-muted">No portfolio files uploaded.</p>
                          )}
                        </div>
                      </div>
                    </ApplicationSection>

                    <ApplicationSection title="Identity">
                      {[identityFront, identityBack].map((file, index) => (
                        <div
                          key={file?.id ?? `${application.id}-${index}`}
                          className="rounded-[14px] border-[3px] border-line bg-white px-4 py-3"
                        >
                          <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                            {index === 0 ? "IC Front" : "IC Back"}
                          </div>
                          {file ? (
                            <a
                              href={`/api/helper-application-files/${file.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block font-semibold text-purple underline decoration-2 underline-offset-2"
                            >
                              Open {file.fileName}
                            </a>
                          ) : (
                            <div className="mt-2 text-sm text-muted">Missing file</div>
                          )}
                        </div>
                      ))}
                    </ApplicationSection>

                    <ApplicationSection title="Agreement">
                      <ApplicationField
                        label="Agreement Status"
                        value={
                          application.agreedToTerms
                            ? `Accepted${application.agreedAt ? ` on ${formatDate(application.agreedAt)}` : ""}`
                            : "Not accepted"
                        }
                      />
                    </ApplicationSection>
                  </div>
                ) : null}
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

function ApplicationSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border-[3px] border-line bg-cream p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
        {title}
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function ApplicationField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-[14px] border-[3px] border-line bg-white px-4 py-3">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
        {label}
      </div>
      <div
        className={`mt-2 text-sm font-semibold text-ink ${
          multiline ? "whitespace-pre-wrap leading-7" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
