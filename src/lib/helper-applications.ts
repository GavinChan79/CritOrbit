export type HelperApplicationNotificationStatus =
  | "SUBMIT"
  | "APPROVED"
  | "REJECTED";

export function getHelperApplicationMessage(
  status: HelperApplicationNotificationStatus,
  name: string,
) {
  if (status === "SUBMIT") {
    return [
      `Hi ${name},`,
      "",
      "Thanks for applying to join CritOrbit 🪐",
      "",
      "Your application is under review (3-7 working days).",
      "We'll update you soon.",
      "",
      "---",
    ].join("\n");
  }

  if (status === "APPROVED") {
    return [
      `Congratulations ${name} 🎉`,
      "",
      "You've been approved as a CritOrbit Helper.",
      "",
      "We are preparing your profile.",
      "You'll be notified once it's live.",
      "",
      "---",
    ].join("\n");
  }

  return [
    `Hi ${name},`,
    "",
    "Thank you for applying to CritOrbit.",
    "",
    "At this time, we're unable to onboard you.",
    "We'll reach out again if suitable opportunities arise.",
    "",
    "---",
  ].join("\n");
}

export function getHelperApplicationEmailSubject(
  status: HelperApplicationNotificationStatus,
) {
  if (status === "SUBMIT") {
    return "CritOrbit application received";
  }

  if (status === "APPROVED") {
    return "CritOrbit helper application approved";
  }

  return "CritOrbit helper application update";
}

export function getHelperApplicationEmailHtml(
  status: HelperApplicationNotificationStatus,
  name: string,
) {
  const lines = getHelperApplicationMessage(status, name)
    .split("\n")
    .filter((line) => line !== "---");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f1b18;">
      ${lines
        .map((line) =>
          line
            ? `<p style="margin:0 0 12px;">${escapeHtml(line)}</p>`
            : `<div style="height:8px;"></div>`,
        )
        .join("")}
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
