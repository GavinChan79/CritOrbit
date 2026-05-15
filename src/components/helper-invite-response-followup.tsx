"use client";

import { useState, useTransition } from "react";
import { buttonStyles, Card, InputShell } from "@/components/ui-primitives";

export function HelperInviteResponseFollowUp(props: { token: string }) {
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [availabilityNote, setAvailabilityNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await fetch("/api/helper/opportunities/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: props.token,
          estimatedPrice: estimatedPrice || undefined,
          availabilityNote: availabilityNote || undefined,
        }),
      });

      const json = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        setError(json.error ?? "Could not save your note.");
        return;
      }

      setSuccess("Availability note saved.");
    });
  }

  return (
    <Card className="bg-white">
      <div className="display-font text-2xl font-black">Add estimated price or note</div>
      <p className="mt-3 text-sm leading-7 text-muted">
        Optional for admin review only. This does not expose your contact details or message the student directly.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <InputShell label="Estimated Price (RM)" hint="Optional whole-number estimate only.">
          <input
            value={estimatedPrice}
            onChange={(event) => setEstimatedPrice(event.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            placeholder="250"
          />
        </InputShell>
        <InputShell label="Availability Note" hint="Optional short note for admin, like available tonight or can deliver by tomorrow.">
          <textarea
            value={availabilityNote}
            onChange={(event) => setAvailabilityNote(event.target.value)}
            rows={4}
            className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            placeholder="Available to review tonight and confirm timing within an hour."
          />
        </InputShell>
        {error ? <p className="text-sm font-bold text-red">{error}</p> : null}
        {success ? <p className="text-sm font-bold text-green">{success}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className={buttonStyles({ tone: "purple", size: "md", fullWidth: true })}
        >
          {pending ? "Saving..." : "Save Optional Note"}
        </button>
      </form>
    </Card>
  );
}
