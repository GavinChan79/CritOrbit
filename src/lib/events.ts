export const eventTypeValues = [
  "VIEW_HELPER_LIST",
  "CLICK_HELPER_CARD",
  "VIEW_HELPER_PROFILE",
  "CLICK_GET_HELP",
  "WHATSAPP_REDIRECT",
  "FORM_SUBMIT",
] as const;

export type EventType = (typeof eventTypeValues)[number];

export type EventPayload = {
  eventType: EventType;
  helperId?: string;
  draftId?: string;
  metadata?: Record<string, unknown>;
};

export function trackEvent(payload: EventPayload) {
  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/events", blob)) {
        return;
      }
    }
  } catch {
    // Ignore and fall back to fetch.
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Logging should never block the UI.
  });
}
