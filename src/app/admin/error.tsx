"use client";

import { RouteError } from "@/components/route-error";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Admin data could not load"
      description="The admin workspace hit a temporary issue while loading the latest lead or helper data."
      reset={reset}
    />
  );
}
