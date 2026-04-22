export type HelperOnboardingEmailTemplate = "submitted" | "approved" | "rejected";

type HelperOnboardingEmailInput = {
  name: string;
};

type EmailTemplateResult = {
  subject: string;
  html: string;
};

type PasswordResetEmailInput = {
  resetUrl: string;
};

export function buildHelperApplicationSubmittedEmail(
  input: HelperOnboardingEmailInput,
): EmailTemplateResult {
  return {
    subject: "CritOrbit application received",
    html: renderEmailTemplate({
      greeting: `Hi ${input.name},`,
      paragraphs: [
        "Thanks for applying to join CritOrbit.",
        "Your application is under review (3-7 working days).",
        "We'll update you soon.",
      ],
    }),
  };
}

export function buildHelperApplicationApprovedEmail(
  input: HelperOnboardingEmailInput,
): EmailTemplateResult {
  return {
    subject: "CritOrbit helper application approved",
    html: renderEmailTemplate({
      greeting: `Congratulations ${input.name},`,
      paragraphs: [
        "You've been approved as a CritOrbit Helper.",
        "We are preparing your profile.",
        "You'll be notified once it's live.",
      ],
    }),
  };
}

export function buildHelperApplicationRejectedEmail(
  input: HelperOnboardingEmailInput,
): EmailTemplateResult {
  return {
    subject: "CritOrbit helper application update",
    html: renderEmailTemplate({
      greeting: `Hi ${input.name},`,
      paragraphs: [
        "Thank you for applying to CritOrbit.",
        "At this time, we're unable to onboard you.",
        "We'll reach out again if suitable opportunities arise.",
      ],
    }),
  };
}

export function buildHelperOnboardingEmailTemplate(
  template: HelperOnboardingEmailTemplate,
  input: HelperOnboardingEmailInput,
): EmailTemplateResult {
  if (template === "submitted") {
    return buildHelperApplicationSubmittedEmail(input);
  }

  if (template === "approved") {
    return buildHelperApplicationApprovedEmail(input);
  }

  return buildHelperApplicationRejectedEmail(input);
}

export function buildPasswordResetEmail(
  input: PasswordResetEmailInput,
): EmailTemplateResult {
  return {
    subject: "Reset your CritOrbit password",
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f1b18;background:#fffaf1;padding:24px;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:3px solid #1f1b18;border-radius:18px;padding:28px;">
          <div style="font-size:28px;font-weight:800;margin:0 0 20px;">CritOrbit</div>
          <p style="margin:0 0 14px;font-size:15px;color:#473f39;">We received a request to reset your password.</p>
          <p style="margin:0 0 20px;font-size:15px;color:#473f39;">If this was you, use the secure link below. This link expires in 1 hour.</p>
          <p style="margin:0 0 20px;">
            <a href="${escapeHtml(input.resetUrl)}" style="display:inline-block;background:#7a5af8;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;">Reset Password</a>
          </p>
          <p style="margin:0 0 12px;font-size:14px;color:#473f39;">If you did not request this, you can ignore this email safely.</p>
          <p style="margin:0;font-size:13px;color:#6e645c;word-break:break-all;">${escapeHtml(input.resetUrl)}</p>
        </div>
      </div>
    `,
  };
}

function renderEmailTemplate(input: {
  greeting: string;
  paragraphs: string[];
}) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f1b18;background:#fffaf1;padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:3px solid #1f1b18;border-radius:18px;padding:28px;">
        <div style="font-size:28px;font-weight:800;margin:0 0 20px;">CritOrbit</div>
        <p style="margin:0 0 16px;font-size:16px;font-weight:700;">${escapeHtml(input.greeting)}</p>
        ${input.paragraphs
          .map(
            (paragraph) =>
              `<p style="margin:0 0 14px;font-size:15px;color:#473f39;">${escapeHtml(paragraph)}</p>`,
          )
          .join("")}
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
