"use client";

import { RouteError } from "@/components/route-error";

export default function RequirementsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Requirement form unavailable"
      description="We couldn't load the request form correctly. Please try again."
      reset={reset}
    />
  );
}
