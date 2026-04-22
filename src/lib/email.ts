import {
  buildHelperOnboardingEmailTemplate,
  buildPasswordResetEmail,
  type HelperOnboardingEmailTemplate,
} from "@/lib/email-templates";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult =
  | { status: "sent"; provider: "resend"; id?: string }
  | { status: "skipped"; provider: "resend"; reason: "missing_config" | "missing_recipient" };

type HelperOnboardingRecipient = {
  email?: string | null;
  name: string;
};

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!input.to) {
    console.warn("[email] Email skipped: missing recipient.", {
      subject: input.subject,
    });
    return { status: "skipped", provider: "resend", reason: "missing_recipient" };
  }

  if (!apiKey || !from) {
    console.warn("[email] Email skipped: missing RESEND_API_KEY or RESEND_FROM_EMAIL.", {
      to: input.to,
      subject: input.subject,
    });
    return { status: "skipped", provider: "resend", reason: "missing_config" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${errorText}`);
  }

  const json = (await response.json()) as { id?: string };

  return {
    status: "sent",
    provider: "resend",
    id: json.id,
  };
}

export async function sendHelperOnboardingEmail(
  recipient: HelperOnboardingRecipient,
  template: HelperOnboardingEmailTemplate,
) {
  if (!recipient.email) {
    console.warn("[email] Helper onboarding email skipped: helper has no email.", {
      helperName: recipient.name,
      template,
    });
    return { status: "skipped", provider: "resend", reason: "missing_recipient" } as const;
  }

  const email = buildHelperOnboardingEmailTemplate(template, {
    name: recipient.name,
  });

  return sendEmail({
    to: recipient.email,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendPasswordResetEmail(input: {
  to?: string | null;
  resetUrl: string;
}) {
  if (!input.to) {
    console.warn("[email] Password reset email skipped: missing recipient.");
    return { status: "skipped", provider: "resend", reason: "missing_recipient" } as const;
  }

  const email = buildPasswordResetEmail({
    resetUrl: input.resetUrl,
  });

  return sendEmail({
    to: input.to,
    subject: email.subject,
    html: email.html,
  });
}
