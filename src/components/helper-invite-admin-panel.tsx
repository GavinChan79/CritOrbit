"use client";

import { useState } from "react";
import { buttonStyles } from "@/components/ui-primitives";

export function HelperInviteAdminPanel(props: {
  preferredHelperName: string;
  inviteStatus: string;
  deliveryStatus: string;
  deliveryAttemptedAt?: string | null;
  deliveryError?: string | null;
  interestedLink?: string | null;
  notAvailableLink?: string | null;
  whatsappMessage?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    if (!props.whatsappMessage) {
      return;
    }

    try {
      await navigator.clipboard.writeText(props.whatsappMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <SimpleMeta label="Preferred Helper" value={props.preferredHelperName} />
        <SimpleMeta label="Invite Status" value={props.inviteStatus} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SimpleMeta label="Delivery Status" value={props.deliveryStatus} />
        <SimpleMeta
          label="Delivery Attempted"
          value={props.deliveryAttemptedAt ?? "Not attempted yet"}
        />
      </div>

      {props.deliveryError ? (
        <div className="rounded-[18px] border-[3px] border-line bg-pink px-4 py-4">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-muted">Delivery Error</div>
          <div className="mt-2 text-sm font-semibold text-ink">{props.deliveryError}</div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <InviteLinkCard
          label="Interested Link"
          href={props.interestedLink}
          emptyLabel="Preferred invite not ready yet."
        />
        <InviteLinkCard
          label="Not Available Link"
          href={props.notAvailableLink}
          emptyLabel="Preferred invite not ready yet."
        />
      </div>

      <div className="rounded-[20px] border-[3px] border-line bg-paper p-4">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
          Helper WhatsApp Message
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          If delivery fails or is still pending, copy this message and send it to the preferred helper manually.
        </p>
        <textarea
          readOnly
          value={props.whatsappMessage ?? "Preferred helper invite message will appear here once the invite exists."}
          className="mt-3 min-h-[220px] w-full rounded-[18px] border-[3px] border-line bg-white px-4 py-3 text-sm leading-6 outline-none"
        />
        <button
          type="button"
          onClick={copyMessage}
          disabled={!props.whatsappMessage}
          className={`mt-3 ${buttonStyles({ tone: "purple", size: "md" })}`}
        >
          {copied ? "Copied" : "Copy Helper WhatsApp Message"}
        </button>
      </div>
    </div>
  );
}

function SimpleMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border-[3px] border-line bg-paper px-4 py-4">
      <div className="text-xs font-black uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function InviteLinkCard({
  label,
  href,
  emptyLabel,
}: {
  label: string;
  href?: string | null;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-[18px] border-[3px] border-line bg-white p-4">
      <div className="text-xs font-black uppercase tracking-[0.14em] text-muted">{label}</div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={`mt-3 ${buttonStyles({ tone: "yellow", size: "sm" })}`}
        >
          Open Link
        </a>
      ) : (
        <p className="mt-3 text-sm font-semibold text-muted">{emptyLabel}</p>
      )}
    </div>
  );
}
