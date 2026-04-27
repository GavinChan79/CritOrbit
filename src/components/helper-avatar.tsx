"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function getHelperInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "CO";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function isLikelyAvatarImage(url?: string | null) {
  if (!url) {
    return false;
  }

  const normalized = url.toLowerCase();

  if (/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)(?:[?#]|$)/i.test(normalized)) {
    return false;
  }

  return true;
}

export function HelperAvatar({
  name,
  imageUrl,
  sizeClass = "h-20 w-20",
  roundedClass = "rounded-[22px]",
  textClass = "text-2xl",
  className,
}: {
  name: string;
  imageUrl?: string | null;
  sizeClass?: string;
  roundedClass?: string;
  textClass?: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = useMemo(() => getHelperInitials(name), [name]);
  const showImage = isLikelyAvatarImage(imageUrl) && !imageFailed;

  if (showImage) {
    return (
      <img
        src={imageUrl ?? undefined}
        alt={`${name} profile image`}
        loading="lazy"
        decoding="async"
        onError={() => setImageFailed(true)}
        className={cn(
          "border-[3px] border-line bg-paper object-cover shadow-[5px_5px_0_var(--line)]",
          sizeClass,
          roundedClass,
          className,
        )}
      />
    );
  }

  return (
    <div
      aria-label={`${name} avatar`}
      className={cn(
        "flex items-center justify-center border-[3px] border-line bg-gradient-to-br from-purple via-[#5f35c9] to-ink text-center text-white shadow-[5px_5px_0_var(--line)]",
        sizeClass,
        roundedClass,
        className,
      )}
    >
      <span
        className={cn(
          "display-font font-black uppercase tracking-[0.08em] text-white drop-shadow-[0_1px_0_rgba(31,27,24,0.45)]",
          textClass,
        )}
      >
        {initials}
      </span>
    </div>
  );
}
