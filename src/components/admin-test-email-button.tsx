"use client";

import { useState } from "react";
import { buttonStyles, Card } from "@/components/ui-primitives";

const TEST_EMAIL_RECIPIENT = "your-test-email@example.com";
const TEST_EMAIL_NAME = "CritOrbit Admin Test";

export function AdminTestEmailButton() {
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: TEST_EMAIL_RECIPIENT,
          name: TEST_EMAIL_NAME,
        }),
      });

      const json = (await response.json()) as {
        error?: string;
        result?: {
          status?: string;
        };
      };

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: json.error ?? "Test email failed to send.",
        });
        return;
      }

      const resultLabel = json.result?.status ? ` (${json.result.status})` : "";
      setStatus({
        tone: "success",
        message: `Test email request completed${resultLabel} to ${TEST_EMAIL_RECIPIENT}.`,
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Test email failed to send.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="mt-8 bg-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="display-font text-2xl font-black">Temporary Test Email</div>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Sends an admin-only test email through <code>/api/test-email</code> to the fixed
            recipient in this component.
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Recipient: {TEST_EMAIL_RECIPIENT}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className={buttonStyles({ tone: "green", size: "md" })}
        >
          {isSending ? "Sending..." : "Send Test Email"}
        </button>
      </div>

      {status ? (
        <p
          className={
            status.tone === "success"
              ? "mt-4 text-sm font-semibold text-green"
              : "mt-4 text-sm font-semibold text-[#E24B4A]"
          }
        >
          {status.message}
        </p>
      ) : null}
    </Card>
  );
}
