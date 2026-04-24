"use client";

import { buttonStyles } from "@/components/ui-primitives";

type RouteErrorProps = {
  title: string;
  description: string;
  reset: () => void;
};

export function RouteError({ title, description, reset }: RouteErrorProps) {
  return (
    <div className="retro-card mx-auto max-w-2xl bg-white p-8 text-center">
      <div className="display-font text-3xl font-black">{title}</div>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
      <button
        type="button"
        onClick={reset}
        className={`mt-6 ${buttonStyles({ tone: "purple", size: "md" })}`}
      >
        Try Again
      </button>
    </div>
  );
}
