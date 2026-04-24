"use client";

import { signOut } from "next-auth/react";
import { buttonStyles } from "@/components/ui-primitives";
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
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl })}
      className={cn(
        buttonStyles({ tone, size }),
        className,
      )}
    >
      {label}
    </button>
  );
}
