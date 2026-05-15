import "server-only";

type SendWhatsappInput = {
  to: string;
  message: string;
};

type SendWhatsappResult = {
  provider: string;
  providerMessageId?: string | null;
};

export async function sendWhatsappMessage(
  input: SendWhatsappInput,
): Promise<SendWhatsappResult> {
  const provider = (
    process.env.WHATSAPP_PROVIDER ??
    (process.env.NODE_ENV === "development" ? "mock" : "")
  )
    .trim()
    .toLowerCase();

  if (!provider) {
    throw new Error(
      "WhatsApp provider is not configured. Set WHATSAPP_PROVIDER=mock for development or configure a real provider.",
    );
  }

  if (provider === "mock") {
    console.info("[helper-invites][whatsapp] mock send", {
      to: maskPhone(input.to),
      preview: truncateMessage(input.message),
    });

    return {
      provider: "mock",
      providerMessageId: `mock-${Date.now()}`,
    };
  }

  if (provider === "meta") {
    return sendViaMeta(input);
  }

  throw new Error(`Unsupported WhatsApp provider: ${provider}`);
}

async function sendViaMeta(input: SendWhatsappInput): Promise<SendWhatsappResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp provider config missing. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.");
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${encodeURIComponent(phoneNumberId)}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizeWhatsappNumber(input.to),
        type: "text",
        text: {
          preview_url: false,
          body: input.message,
        },
      }),
    },
  );

  const rawText = await response.text();
  const parsed = tryParseJson(rawText);

  if (!response.ok) {
    console.warn("[helper-invites][whatsapp] meta send failed", {
      status: response.status,
      to: maskPhone(input.to),
      body: sanitizeProviderPayload(parsed ?? rawText),
    });
    throw new Error(`WhatsApp send failed (${response.status}).`);
  }

  const messageId =
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { messages?: Array<{ id?: string }> }).messages)
      ? ((parsed as { messages?: Array<{ id?: string }> }).messages?.[0]?.id ?? null)
      : null;

  return {
    provider: "meta",
    providerMessageId: messageId,
  };
}

function normalizeWhatsappNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function maskPhone(value: string) {
  const digits = normalizeWhatsappNumber(value);
  if (digits.length <= 4) {
    return digits;
  }

  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function truncateMessage(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 120) {
    return normalized;
  }

  return `${normalized.slice(0, 117)}...`;
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function sanitizeProviderPayload(value: unknown) {
  if (typeof value === "string") {
    return value.slice(0, 300);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const candidate = value as {
    error?: {
      message?: string;
      type?: string;
      code?: number;
      error_subcode?: number;
    };
  };

  if (!candidate.error) {
    return value;
  }

  return {
    error: {
      message: candidate.error.message,
      type: candidate.error.type,
      code: candidate.error.code,
      error_subcode: candidate.error.error_subcode,
    },
  };
}
