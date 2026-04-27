"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonStyles } from "@/components/ui-primitives";
import { cn } from "@/lib/utils";

type AdminLeadStatus = "NEW" | "CONTACTED" | "ASSIGNED" | "COMPLETED" | "CANCELLED";

export function AdminLeadQuickActions({
  lead,
}: {
  lead: {
    id: string;
    status: AdminLeadStatus;
    assignedHelperId: string | null;
    dealClosed: boolean;
    dealValue: number | null;
    notes: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string>("");

  function runStatusAction(nextStatus: AdminLeadStatus, actionLabel: string, options?: { confirm?: boolean }) {
    if (pending) {
      return;
    }

    if (options?.confirm && !window.confirm(`Mark this lead as ${actionLabel.toLowerCase()}?`)) {
      return;
    }

    setError("");
    setPendingAction(actionLabel);

    startTransition(async () => {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          assignedHelperId: lead.assignedHelperId,
          dealClosed: lead.dealClosed,
          dealValue: lead.dealValue,
          notes: lead.notes,
        }),
      });

      const json = await response.json();
      setPendingAction("");

      if (!response.ok) {
        setError(json.error ?? "Could not update the lead status.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => runStatusAction("CONTACTED", "Contacted")}
          className={buttonStyles({ tone: "yellow", size: "sm" })}
        >
          {pendingAction === "Contacted" ? "Saving..." : "Mark Contacted"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => runStatusAction("ASSIGNED", "In Progress")}
          className={buttonStyles({ tone: "purple", size: "sm" })}
        >
          {pendingAction === "In Progress" ? "Saving..." : "Mark In Progress"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => runStatusAction("COMPLETED", "Completed")}
          className={buttonStyles({ tone: "green", size: "sm" })}
        >
          {pendingAction === "Completed" ? "Saving..." : "Mark Completed"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => runStatusAction("CANCELLED", "Cancelled", { confirm: true })}
          className={cn(buttonStyles({ tone: "ink", size: "sm" }), "bg-red text-white hover:bg-[#c73f3e] active:bg-[#af3534]")}
        >
          {pendingAction === "Cancelled" ? "Saving..." : "Mark Cancelled"}
        </button>
      </div>
      {error ? <p className="text-xs font-semibold text-red">{error}</p> : null}
    </div>
  );
}
