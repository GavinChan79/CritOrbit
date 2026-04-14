"use client";

import { RouteError } from "@/components/route-error";

export default function HelperSelectError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Helper shortlist unavailable"
      description="We couldn't load the latest helper shortlist for this draft. Please try again."
      reset={reset}
    />
  );
}
