"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles, Card, EmptyState } from "@/components/ui";
import { getHelperVerificationStatusLabel } from "@/lib/helper-verification";

type VerificationHelperRecord = {
  id: string;
  name: string;
  isVerified: boolean;
  verification: {
    status: "PENDING" | "VERIFIED" | "REJECTED" | null;
    adminNote: string | null;
    updatedAt: string | null;
    icFrontUrl: string | null;
    icBackUrl: string | null;
  } | null;
};

export function AdminHelperVerificationManager(props: {
  helpers: VerificationHelperRecord[];
  activeFilter: "all" | "pending" | "verified" | "rejected";
}) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  async function updateVerification(helperId: string, nextStatus: "VERIFIED" | "REJECTED") {
    setSavingId(helperId);
    setStatus("");

    try {
      const response = await fetch(`/api/admin/helpers/${helperId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(json.error ?? "Verification update failed.");
        return;
      }

      setStatus(`Verification updated to ${nextStatus.toLowerCase()}.`);
      router.refresh();
    } catch {
      setStatus("Verification update failed.");
    } finally {
      setSavingId(null);
    }
  }

  const filteredHelpers = props.helpers.filter((helper) => {
    if (props.activeFilter === "all") {
      return true;
    }

    if (props.activeFilter === "pending") {
      return helper.verification?.status === "PENDING";
    }

    if (props.activeFilter === "verified") {
      return helper.verification?.status === "VERIFIED";
    }

    return helper.verification?.status === "REJECTED";
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="display-font text-3xl font-black">Verification review</div>
        <p className="mt-2 text-sm text-muted">
          Review private IC uploads and mark helpers as verified or rejected without exposing any files publicly.
        </p>
        {status ? <p className="mt-3 text-sm font-semibold text-muted">{status}</p> : null}
      </div>

      {filteredHelpers.length === 0 ? (
        <EmptyState
          title="No helpers in this filter"
          description="Try another verification filter or wait for more helper verification activity."
        />
      ) : (
        filteredHelpers.map((helper) => {
          const verificationStatus = helper.verification?.status ?? "PENDING";

          return (
            <Card key={helper.id} className="bg-white">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="display-font text-2xl font-black">{helper.name}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                      {getHelperVerificationStatusLabel(verificationStatus)}
                    </span>
                    {helper.isVerified ? (
                      <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
                        Public badge on
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {helper.verification?.icFrontUrl ? (
                      <a
                        href={helper.verification.icFrontUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonStyles({ tone: "yellow", size: "sm" })}
                      >
                        View IC Front
                      </a>
                    ) : null}
                    {helper.verification?.icBackUrl ? (
                      <a
                        href={helper.verification.icBackUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonStyles({ tone: "yellow", size: "sm" })}
                      >
                        View IC Back
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => updateVerification(helper.id, "VERIFIED")}
                    disabled={savingId === helper.id}
                    className={buttonStyles({ tone: "green", size: "sm" })}
                  >
                    {savingId === helper.id ? "Saving..." : "Mark Verified"}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateVerification(helper.id, "REJECTED")}
                    disabled={savingId === helper.id}
                    className={buttonStyles({ tone: "ink", size: "sm" })}
                  >
                    {savingId === helper.id ? "Saving..." : "Mark Rejected"}
                  </button>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
