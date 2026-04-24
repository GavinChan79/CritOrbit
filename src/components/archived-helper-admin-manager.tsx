"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles, Card, EmptyState } from "@/components/ui-primitives";

type ArchivedHelperRecord = {
  id: string;
  name: string;
  email: string | null;
  categoryLabel: string;
  statusLabel: string;
  typeLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  portfolioCount: number;
  selectedLeadCount: number;
  assignedLeadCount: number;
  applicationFileCount: number;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function ArchivedHelperAdminManager({
  helpers,
}: {
  helpers: ArchivedHelperRecord[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function restoreHelper(helperId: string) {
    setBusyId(helperId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/helpers/${helperId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Could not restore helper.");
        return;
      }

      setSuccess("Helper restored to the main roster as frozen and not public.");
      router.refresh();
    } catch {
      setError("Could not restore helper.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteHelper(helperId: string) {
    const confirmed = window.confirm(
      "Permanently delete this archived helper? This only works when there are no historical records attached.",
    );

    if (!confirmed) {
      return;
    }

    setBusyId(helperId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/helpers/${helperId}`, {
        method: "DELETE",
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Could not permanently delete helper.");
        return;
      }

      setSuccess("Archived helper permanently deleted.");
      router.refresh();
    } catch {
      setError("Could not permanently delete helper.");
    } finally {
      setBusyId(null);
    }
  }

  if (!helpers.length) {
    return (
      <EmptyState
        title="No archived helpers"
        description="Archived helpers will appear here after they are removed from the main roster."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-[20px] border-[3px] border-line bg-[#ffd9d7] px-5 py-4 text-sm font-semibold text-ink">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-[20px] border-[3px] border-line bg-[#d7f5db] px-5 py-4 text-sm font-semibold text-ink">
          {success}
        </div>
      ) : null}

      {helpers.map((helper) => {
        const hasHistoricalRecords =
          helper.selectedLeadCount > 0 ||
          helper.assignedLeadCount > 0 ||
          helper.applicationFileCount > 0 ||
          helper.portfolioCount > 0;

        return (
          <Card key={helper.id} className="bg-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="display-font text-2xl font-black">{helper.name}</div>
                  <span className="retro-pill bg-ink px-3 py-1 text-xs font-black uppercase text-white">
                    {helper.statusLabel}
                  </span>
                  <span className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                    {helper.typeLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {helper.categoryLabel}
                  {helper.email ? ` · ${helper.email}` : ""}
                </p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-muted">
                  Operational visibility {helper.isActive ? "on" : "off"} · Created {formatDate(helper.createdAt)} · Updated {formatDate(helper.updatedAt)}
                </p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-muted">
                  {helper.portfolioCount} portfolio items · {helper.selectedLeadCount} selected leads · {helper.assignedLeadCount} assigned leads
                </p>
                {hasHistoricalRecords ? (
                  <p className="mt-3 text-sm text-muted">
                    This helper has historical records and cannot be permanently deleted. It can only remain archived.
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted">
                    No historical records found. Permanent delete is allowed.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => restoreHelper(helper.id)}
                  disabled={busyId === helper.id}
                  className={buttonStyles({ tone: "yellow", size: "sm" })}
                >
                  {busyId === helper.id ? "Working..." : "Restore Helper"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteHelper(helper.id)}
                  disabled={busyId === helper.id || hasHistoricalRecords}
                  className={buttonStyles({ tone: "ink", size: "sm" })}
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
