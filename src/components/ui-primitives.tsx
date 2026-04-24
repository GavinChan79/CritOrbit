import Link from "next/link";
import { ReactNode } from "react";
import { LeadStatus } from "@prisma/client";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-[3px] border-line bg-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <div className="display-font text-2xl font-black uppercase">{APP_NAME}</div>
          <p className="mt-3 max-w-sm text-sm text-muted">{APP_TAGLINE}</p>
        </div>
        <div className="space-y-2 text-sm font-semibold">
          <Link href="/requirements">Submit a Brief</Link>
          <Link href="/become-helper">Become a Helper</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
        <p className="text-sm font-semibold text-muted">Made for Malaysian students.</p>
      </div>
    </footer>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("space-y-3", align === "center" && "text-center")}>
      {eyebrow ? (
        <div className="display-font text-sm font-black uppercase tracking-[0.24em] text-purple">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="display-font text-4xl font-black tracking-tight md:text-5xl">{title}</h2>
      {description ? (
        <p className="mx-auto max-w-2xl text-base leading-7 text-muted">{description}</p>
      ) : null}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("retro-card p-6", className)}>{children}</div>;
}

export function Badge({
  children,
  tone = "yellow",
  className,
}: {
  children: ReactNode;
  tone?: "yellow" | "pink" | "green" | "blue" | "purple" | "ink";
  className?: string;
}) {
  const tones = {
    yellow: "bg-yellow text-ink",
    pink: "bg-pink text-ink",
    green: "bg-green text-white",
    blue: "bg-blue text-white",
    purple: "bg-purple text-white",
    ink: "bg-ink text-white",
  };

  return (
    <span
      className={cn(
        "retro-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] shadow-[2px_2px_0_var(--line)]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="text-center">
      <h3 className="display-font text-2xl font-black">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

export function StatusBadge({ status }: { status: LeadStatus | string }) {
  const tone =
    status === "COMPLETED"
      ? "green"
      : status === "ASSIGNED"
        ? "purple"
        : status === "CONTACTED"
          ? "blue"
          : "yellow";

  return <Badge tone={tone}>{status.replaceAll("_", " ")}</Badge>;
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "purple",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "purple" | "pink" | "yellow" | "green";
}) {
  const accents = {
    purple: "bg-purple text-white",
    pink: "bg-pink text-ink",
    yellow: "bg-yellow text-ink",
    green: "bg-green text-white",
  };

  return (
    <Card className="gap-3">
      <div
        className={cn(
          "retro-pill inline-flex w-fit px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0_var(--line)]",
          accents[tone],
        )}
      >
        {label}
      </div>
      <div className="mt-4 display-font text-4xl font-black">{value}</div>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </Card>
  );
}

export function InputShell({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-black uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      {children}
      {error ? (
        <span className="block text-xs font-semibold text-[#E24B4A]">{error}</span>
      ) : null}
      {!error && hint ? <span className="block text-xs font-medium text-muted">{hint}</span> : null}
    </label>
  );
}

export function buttonStyles({
  tone = "purple",
  size = "md",
  fullWidth = false,
}: {
  tone?: "purple" | "yellow" | "pink" | "ink" | "green";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}) {
  const tones = {
    purple:
      "bg-purple text-white visited:text-white enabled:hover:bg-[#45239a] enabled:hover:text-white enabled:active:bg-[#351b77] enabled:active:text-white",
    yellow:
      "bg-yellow text-ink visited:text-ink enabled:hover:bg-[#f2b14a] enabled:hover:text-ink enabled:active:bg-[#df9f38] enabled:active:text-ink",
    pink:
      "bg-pink text-ink visited:text-ink enabled:hover:bg-[#ea6b96] enabled:hover:text-ink enabled:active:bg-[#d95984] enabled:active:text-ink",
    ink:
      "bg-ink text-white visited:text-white enabled:hover:bg-[#151311] enabled:hover:text-white enabled:active:bg-[#0f0d0c] enabled:active:text-white",
    green:
      "bg-green text-white visited:text-white enabled:hover:bg-[#007c4c] enabled:hover:text-white enabled:active:bg-[#006841] enabled:active:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-7 py-4 text-base",
  };

  return cn(
    "display-font inline-flex items-center justify-center rounded-[18px] border-[3px] border-line font-black no-underline transition enabled:hover:translate-x-[2px] enabled:hover:translate-y-[2px] enabled:hover:shadow-none enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] enabled:active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/30 disabled:cursor-not-allowed disabled:opacity-75 disabled:saturate-75",
    tones[tone],
    sizes[size],
    fullWidth && "w-full",
    "shadow-[5px_5px_0_var(--line)]",
  );
}
