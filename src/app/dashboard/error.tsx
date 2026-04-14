"use client";

import { RouteError } from "@/components/route-error";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Dashboard unavailable right now"
      description="We couldn't load the latest request status data. Please try again."
      reset={reset}
    />
  );
}
