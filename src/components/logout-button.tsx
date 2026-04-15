"use client";

import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  label = "Logout",
  callbackUrl = "/",
  tone = "ink",
  size = "sm",
}: {
  className?: string;
  label?: string;
  callbackUrl?: string;
  tone?: "purple" | "yellow" | "pink" | "ink" | "green";
  size?: "sm" | "md" | "lg";
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

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl })}
      className={cn(
        "display-font inline-flex items-center justify-center rounded-[18px] border-[3px] border-line font-black transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[5px_5px_0_var(--line)] [text-shadow:0_1px_0_rgba(0,0,0,0.12)]",
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {label}
    </button>
  );
}
