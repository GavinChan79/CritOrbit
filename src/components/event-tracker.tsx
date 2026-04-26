"use client";

import { useEffect } from "react";
import { trackEvent, type EventPayload } from "@/lib/events";

export function TrackEventOnMount(props: EventPayload) {
  useEffect(() => {
    trackEvent(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
