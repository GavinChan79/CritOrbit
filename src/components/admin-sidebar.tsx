"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { buttonStyles } from "@/components/ui-primitives";
import { APP_NAME, adminSidebarLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full overflow-visible border-b-[3px] border-line bg-paper px-4 py-5 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r-[3px] lg:px-6">
      <div className="display-font text-2xl font-black uppercase">{APP_NAME}</div>
      <p className="mt-2 text-sm text-muted">Admin workspace for lead routing and helper tracking.</p>
      <div className="mt-5 flex flex-col gap-3">
        <Link
          href="/"
          className={cn(buttonStyles({ tone: "yellow", size: "sm", fullWidth: true }), "tracking-[0.08em]")}
        >
          Back to Home
        </Link>
        <LogoutButton callbackUrl="/" label="Logout" tone="ink" size="sm" className="w-full" />
      </div>
      <nav className="mt-8 space-y-3">
        {adminSidebarLinks.map((link) => {
          const active =
            pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-[18px] border-[3px] border-line px-4 py-3 font-black uppercase tracking-[0.08em] shadow-[5px_5px_0_var(--line)] transition no-underline",
                active
                  ? "bg-purple !text-white visited:!text-white hover:!text-white active:!text-white"
                  : "bg-white text-ink visited:text-ink hover:bg-yellow hover:text-ink active:text-ink",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
