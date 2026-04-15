import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ReactNode } from "react";
import { LeadStatus } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { SiteHeaderClient } from "@/components/site-header-client";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  noStore();
  const session = await getAuthSession();
  const showAdminDashboard = session?.user?.role === "ADMIN";
  const isAuthenticated = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="display-font text-2xl font-black uppercase tracking-tight">
          CritStudio
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/#how-it-works">How it Works</Link>
          <Link href="/requirements">Find a Helper</Link>
          <Link href="/#faqs">FAQs</Link>
          {showAdminDashboard ? <Link href="/admin">Dashboard</Link> : null}
          {!session?.user ? <Link href="/login">Login</Link> : null}
        </nav>
        <div className="hidden md:block">
          <Link href="/requirements" className={buttonStyles({ tone: "purple", size: "sm" })}>
            Get Help Now
          </Link>
        </div>
        <SiteHeaderClient
          isAuthenticated={isAuthenticated}
          showAdminDashboard={showAdminDashboard}
        />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-[3px] border-line bg-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <div className="display-font text-2xl font-black uppercase">CritStudio</div>
          <p className="mt-3 max-w-sm text-sm text-muted">
            A controlled student help platform for architecture and interior design submissions.
          </p>
        </div>
        <div className="space-y-2 text-sm font-semibold">
          <Link href="/requirements">Submit a Brief</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
        <p className="text-sm font-semibold text-muted">Made for Malaysian students 🇲🇾</p>
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
        "retro-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]",
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
      <div className={cn("retro-pill inline-flex w-fit px-3 py-1 text-xs font-black uppercase", accents[tone])}>
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
      <span className="text-sm font-black uppercase tracking-[0.14em] text-muted">{label}</span>
      {children}
      {error ? <span className="block text-xs font-semibold text-[#E24B4A]">{error}</span> : null}
      {!error && hint ? <span className="block text-xs text-muted">{hint}</span> : null}
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
    purple: "bg-[#7a5af8] text-white",
    yellow: "bg-yellow text-ink",
    pink: "bg-pink text-ink",
    ink: "bg-ink text-white",
    green: "bg-green text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-7 py-4 text-base",
  };

  return cn(
    "display-font inline-flex items-center justify-center rounded-[18px] border-[3px] border-line font-black transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
    tones[tone],
    sizes[size],
    fullWidth && "w-full",
    "shadow-[5px_5px_0_var(--line)] [text-shadow:0_1px_0_rgba(0,0,0,0.12)]",
  );
}
