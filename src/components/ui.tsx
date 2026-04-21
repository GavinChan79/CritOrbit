import "server-only";

import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { SiteHeaderClient } from "@/components/site-header-client";
import { buttonStyles } from "@/components/ui-primitives";
import { APP_NAME } from "@/lib/constants";
import { logServerDataLoadError } from "@/lib/server-load";

export {
  Badge,
  buttonStyles,
  Card,
  EmptyState,
  InputShell,
  MetricCard,
  SectionHeading,
  SiteFooter,
  StatusBadge,
} from "@/components/ui-primitives";

export async function SiteHeader() {
  noStore();
  try {
    const session = await getAuthSession();
    return renderSiteHeader({
      isAuthenticated: Boolean(session?.user),
      showAdminDashboard: session?.user?.role === "ADMIN",
      showLogout: Boolean(session?.user),
    });
  } catch (error) {
    console.error("DB ERROR:", error);
    logServerDataLoadError("site-header-session", error);
    return renderSiteHeader({
      isAuthenticated: false,
      showAdminDashboard: false,
      showLogout: false,
    });
  }
}

function renderSiteHeader({
  isAuthenticated,
  showAdminDashboard,
  showLogout,
}: {
  isAuthenticated: boolean;
  showAdminDashboard: boolean;
  showLogout: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="display-font text-2xl font-black uppercase tracking-tight">
          {APP_NAME}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/#how-it-works">How it Works</Link>
          <Link href="/requirements">Find a Helper</Link>
          <Link href="/become-helper">Become a Helper</Link>
          <Link href="/#faqs">FAQs</Link>
          {showAdminDashboard ? <Link href="/admin">Dashboard</Link> : null}
          {!isAuthenticated ? <Link href="/login">Login</Link> : null}
          {showLogout ? (
            <LogoutButton callbackUrl="/" label="Logout" tone="ink" size="sm" />
          ) : null}
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
