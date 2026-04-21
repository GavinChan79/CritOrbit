"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonStyles } from "@/components/ui-primitives";
import { leadMatchPayloadSchema } from "@/lib/validators";

export function HelperDetailActions({
  helperId,
  draftId,
}: {
  helperId: string;
  draftId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleMatch() {
    if (!draftId || loading) {
      return;
    }

    const payload = {
      draftId,
      selectedHelperId: helperId,
    };

    const validatedPayload = leadMatchPayloadSchema.safeParse(payload);

    if (!validatedPayload.success) {
      setError(
        validatedPayload.error.issues[0]?.message ??
          "Your request details are incomplete. Please return to the requirement form.",
      );
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/leads/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(json.error ?? "Could not create the lead.");
      return;
    }

    window.location.assign(json.whatsappUrl);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {draftId ? (
          <>
            <button
              type="button"
              onClick={handleMatch}
              disabled={loading}
              className={buttonStyles({ tone: "green", size: "md" })}
            >
              {loading ? "Saving..." : "Get Help Now \u2192"}
            </button>
            <Link
              href={`/helpers/select?draftId=${draftId}`}
              className={buttonStyles({ tone: "yellow", size: "md" })}
            >
              Back to Helper Selection
            </Link>
          </>
        ) : (
          <>
            <Link href="/requirements" className={buttonStyles({ tone: "purple", size: "md" })}>
              Get Help Now \u2192
            </Link>
            <Link href="/#helpers" className={buttonStyles({ tone: "yellow", size: "md" })}>
              Back to Homepage
            </Link>
          </>
        )}
      </div>
      {error ? (
        <div className="rounded-[18px] border-[3px] border-line bg-red px-4 py-3 text-sm font-bold text-white">
          {error}
        </div>
      ) : null}
    </div>
  );
}
