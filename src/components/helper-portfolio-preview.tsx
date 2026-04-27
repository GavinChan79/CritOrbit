"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type PortfolioPreviewItem = {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  externalLink?: string | null;
};

function isDocumentLikeItem(item: PortfolioPreviewItem) {
  return [item.externalLink, item.imageUrl].some((value) =>
    typeof value === "string" && /\.(pdf|doc|docx|ppt|pptx)(?:[?#]|$)/i.test(value.toLowerCase()),
  );
}

function getFileTypeLabel(item: PortfolioPreviewItem) {
  if ([item.externalLink, item.imageUrl].some((value) => typeof value === "string" && /\.pdf(?:[?#]|$)/i.test(value.toLowerCase()))) {
    return "PDF";
  }

  return "FILE";
}

function getPortfolioDisplayTitle(item: PortfolioPreviewItem) {
  return item.title?.trim() || "Portfolio sample";
}

export function HelperPortfolioPreview({
  item,
  variant = "compact",
  href,
  onClick,
  className,
}: {
  item: PortfolioPreviewItem;
  variant?: "compact" | "detail";
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const isDocument = isDocumentLikeItem(item) || imageFailed;
  const fileType = getFileTypeLabel(item);
  const title = getPortfolioDisplayTitle(item);
  const Wrapper = href ? "a" : "div";
  const wrapperProps =
    href
      ? {
          href,
          target: "_blank",
          rel: "noreferrer",
          onClick,
        }
      : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "block overflow-hidden rounded-[18px] border-[3px] border-line bg-cream shadow-[4px_4px_0_var(--line)]",
        href && "transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        variant === "detail" && "rounded-[22px]",
        className,
      )}
    >
      {!isDocument ? (
        <img
          src={item.imageUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className={cn(
            "w-full bg-paper object-cover",
            variant === "detail" ? "h-52" : "h-24",
          )}
        />
      ) : (
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br from-paper via-white to-[#efe7ff]",
            variant === "detail" ? "h-52 px-6 py-6" : "h-24 px-3 py-3",
          )}
        >
          <div className="absolute right-4 top-4 h-10 w-8 rounded-[8px] border-[3px] border-line bg-white shadow-[3px_3px_0_var(--line)]" />
          <div className="absolute right-[22px] top-4 h-3 w-3 rounded-bl-[6px] rounded-tr-[6px] border-b-[3px] border-l-[3px] border-line bg-yellow" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="retro-pill bg-purple px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                {fileType}
              </span>
            </div>
            <div>
              <div
                className={cn(
                  "display-font font-black text-ink",
                  variant === "detail" ? "text-2xl leading-tight" : "line-clamp-2 text-sm leading-tight",
                )}
              >
                {title}
              </div>
              <div
                className={cn(
                  "mt-2 font-semibold uppercase tracking-[0.14em] text-muted",
                  variant === "detail" ? "text-xs" : "text-[10px]",
                )}
              >
                Portfolio sample
              </div>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
}
