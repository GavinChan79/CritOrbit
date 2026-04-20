import {
  getHelperApplicationEmailHtml,
  getHelperApplicationEmailSubject,
  getHelperApplicationMessage,
  type HelperApplicationNotificationStatus,
} from "@/lib/helper-applications";
import { sendEmail } from "@/lib/email";
import { buildWhatsappUrlForNumber } from "@/lib/whatsapp";

type HelperNotificationRecipient = {
  id: string;
  name: string;
  email?: string | null;
  whatsappNumber?: string | null;
};

type WhatsappPayload = {
  phone: string;
  message: string;
};

export async function sendHelperApplicationReceived(
  helper: HelperNotificationRecipient,
) {
  return sendHelperNotification(helper, "SUBMIT");
}

export async function sendHelperApproved(helper: HelperNotificationRecipient) {
  return sendHelperNotification(helper, "APPROVED");
}

export async function sendHelperRejected(helper: HelperNotificationRecipient) {
  return sendHelperNotification(helper, "REJECTED");
}

export async function sendWhatsAppMessage({ phone, message }: WhatsappPayload) {
  const provider = process.env.WHATSAPP_PROVIDER?.toLowerCase() ?? "wa_me";

  if (provider === "twilio") {
    return sendWhatsAppViaTwilio({ phone, message });
  }

  const fallbackUrl = buildWhatsappUrlForNumber(phone, message);
  console.warn("[notifications] WhatsApp fallback prepared. Configure WHATSAPP_PROVIDER=twilio for automatic sending.", {
    phone,
    fallbackUrl,
  });

  return {
    status: "fallback" as const,
    provider: "wa_me",
    fallbackUrl,
  };
}

async function sendHelperNotification(
  helper: HelperNotificationRecipient,
  status: HelperApplicationNotificationStatus,
) {
  const message = getHelperApplicationMessage(status, helper.name);
  const emailSubject = getHelperApplicationEmailSubject(status);
  const emailHtml = getHelperApplicationEmailHtml(status, helper.name);

  const results = {
    whatsapp: null as Awaited<ReturnType<typeof sendWhatsAppMessage>> | null,
    email: null as Awaited<ReturnType<typeof sendEmail>> | null,
  };

  if (helper.whatsappNumber) {
    results.whatsapp = await sendWhatsAppMessage({
      phone: helper.whatsappNumber,
      message,
    });
  }

  if (helper.email) {
    results.email = await sendEmail({
      to: helper.email,
      subject: emailSubject,
      html: emailHtml,
    });
  }

  return results;
}

async function sendWhatsAppViaTwilio({
  phone,
  message,
}: WhatsappPayload) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    const fallbackUrl = buildWhatsappUrlForNumber(phone, message);
    console.warn("[notifications] Twilio WhatsApp skipped: missing Twilio config.", {
      phone,
      fallbackUrl,
    });

    return {
      status: "fallback" as const,
      provider: "wa_me",
      fallbackUrl,
    };
  }

  const body = new URLSearchParams({
    To: normalizeWhatsappNumber(phone),
    From: normalizeWhatsappSender(from),
    Body: message,
  });

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio WhatsApp request failed (${response.status}): ${errorText}`);
  }

  return {
    status: "sent" as const,
    provider: "twilio",
  };
}

function normalizeWhatsappNumber(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `whatsapp:+${digits}`;
}

function normalizeWhatsappSender(value: string) {
  return value.startsWith("whatsapp:") ? value : `whatsapp:${value}`;
}
