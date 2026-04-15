"use client";

import Link from "next/link";
import { useState } from "react";

type SiteHeaderClientProps = {
  isAuthenticated: boolean;
  showAdminDashboard: boolean;
};

export function SiteHeaderClient({
  isAuthenticated,
  showAdminDashboard,
}: SiteHeaderClientProps) {
  const [open, setOpen] = useState(false);
  const authHref = showAdminDashboard ? "/admin" : "/login";
  const authLabel = showAdminDashboard ? "Dashboard" : "Login";

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center gap-3">
        {!isAuthenticated || showAdminDashboard ? (
          <Link href={authHref} className="text-sm font-semibold" onClick={closeMenu}>
            {authLabel}
          </Link>
        ) : null}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          className="flex h-11 w-11 items-center justify-center rounded-[16px] border-[3px] border-line bg-white text-xl font-black"
          onClick={() => setOpen((current) => !current)}
        >
          {"\u2630"}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="absolute left-0 right-0 top-full border-b-[3px] border-line bg-paper px-4 py-4 shadow-[0_6px_0_var(--line)]"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <Link href="/#how-it-works" className="text-sm font-semibold" onClick={closeMenu}>
              How it Works
            </Link>
            <Link href="/requirements" className="text-sm font-semibold" onClick={closeMenu}>
              Find a Helper
            </Link>
            <Link href="/#faqs" className="text-sm font-semibold" onClick={closeMenu}>
              FAQs
            </Link>
            <Link
              href="/requirements"
              className="display-font inline-flex w-full items-center justify-center rounded-[18px] border-[3px] border-line bg-[#7a5af8] px-4 py-2 text-sm font-black text-white shadow-[5px_5px_0_var(--line)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none [text-shadow:0_1px_0_rgba(0,0,0,0.12)]"
              onClick={closeMenu}
            >
              Get Help Now {"\u2192"}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
