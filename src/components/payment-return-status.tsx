"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { buttonStyles } from "@/components/ui-primitives";

type PaymentStatusValue =
  | "UNPAID"
  | "PAYMENT_LINK_SENT"
  | "PAID"
  | "REFUNDED"
  | "RELEASE_READY"
  | "RELEASED"
  | "PAYMENT_FAILED"
  | "PAYMENT_EXPIRED";

type Props = {
  leadId?: string;
  billCode?: string;
  initialStatus: PaymentStatusValue;
  initialStatusLabel: string;
};

export function PaymentReturnStatus({
  leadId,
  billCode,
  initialStatus,
  initialStatusLabel,
}: Props) {
  const [status, setStatus] = useState<PaymentStatusValue>(initialStatus);
  const [statusLabel, setStatusLabel] = useState(initialStatusLabel);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const canFetch = Boolean(leadId && billCode);
  const isPaid = status === "PAID";
  const isVerifying = !isPaid && status !== "PAYMENT_FAILED" && status !== "PAYMENT_EXPIRED" && status !== "REFUNDED";

  async function refreshStatus() {
    if (!canFetch) {
      return;
    }

    setError("");

    const response = await fetch(
      `/api/payments/status?leadId=${encodeURIComponent(leadId!)}&billCode=${encodeURIComponent(billCode!)}`,
      {
        cache: "no-store",
      },
    );

    const json = await response.json();

    if (!response.ok) {
      setError(json.error ?? "Could not refresh payment status.");
      return;
    }

    if (!json.found) {
      setError("We could not verify this payment yet. Please try again shortly.");
      return;
    }

    setStatus(json.lead.paymentStatus);
    setStatusLabel(json.lead.paymentStatusLabel);
  }

  useEffect(() => {
    if (!canFetch || isPaid) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      if (cancelled || attempts >= 4) {
        return;
      }

      attempts += 1;
      const response = await fetch(
        `/api/payments/status?leadId=${encodeURIComponent(leadId!)}&billCode=${encodeURIComponent(billCode!)}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        return;
      }

      const json = await response.json();
      if (cancelled || !json?.found) {
        return;
      }

      setStatus(json.lead.paymentStatus);
      setStatusLabel(json.lead.paymentStatusLabel);
    };

    const timer = window.setInterval(poll, 4000);
    void poll();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [billCode, canFetch, isPaid, leadId]);

  const headline = useMemo(() => {
    if (isPaid) {
      return "Payment received by CritOrbit.";
    }

    if (isVerifying) {
      return "Payment is being verified...";
    }

    return "Payment submitted";
  }, [isPaid, isVerifying]);

  const body = useMemo(() => {
    if (isPaid) {
      return "We'll continue your request shortly.";
    }

    if (isVerifying) {
      return "This may take a few seconds.";
    }

    return "Source of truth remains the webhook and admin confirmation flow.";
  }, [isPaid, isVerifying]);

  return (
    <div className="mt-8 rounded-[28px] border-[3px] border-line bg-white p-6 shadow-[5px_5px_0_var(--line)]">
      <div className="display-font text-3xl font-black">{headline}</div>
      <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
      <div className="mt-4 rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-semibold text-ink">
        {statusLabel}
      </div>
      {!isPaid && canFetch ? (
        <p className="mt-4 text-sm leading-7 text-muted">
          If you've completed payment but this page has not updated yet, our team will verify it shortly.
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm font-bold text-red">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => startTransition(refreshStatus)}
          disabled={pending || !canFetch}
          className={buttonStyles({ tone: "purple", size: "md" })}
        >
          {pending ? "Refreshing..." : "Refresh Status"}
        </button>
        <Link
          href="mailto:admin@critorbit.com?subject=CritOrbit%20Payment%20Support"
          className={buttonStyles({ tone: "yellow", size: "md" })}
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
