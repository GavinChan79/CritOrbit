export type HelperApplicationNotificationStatus =
  | "SUBMIT"
  | "APPROVED"
  | "REJECTED";

const allowedApplicationFileExtensions = [".png", ".jpg", ".jpeg", ".pdf"] as const;
const allowedApplicationMimeTypes = [
  "image/png",
  "image/jpeg",
  "application/pdf",
] as const;

export const maxPortfolioFiles = 5;
export const maxApplicationFileSizeBytes = 20 * 1024 * 1024;
export const maxPortfolioApplicationFileSizeBytes = 20 * 1024 * 1024;
export const maxIdentityApplicationFileSizeBytes = 10 * 1024 * 1024;
export const helperApplicationUploadPrefix = "helper-applications/";
export const helperPortfolioUploadPrefix = "helper-portfolio/";
export const helperApplicationUploadKinds = [
  "PORTFOLIO",
  "IDENTITY_FRONT",
  "IDENTITY_BACK",
] as const;

export type HelperApplicationUploadKind =
  (typeof helperApplicationUploadKinds)[number];

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

export function isAllowedApplicationFile(fileName: string, mimeType: string) {
  const lowerCaseName = fileName.toLowerCase();
  const hasAllowedExtension = allowedApplicationFileExtensions.some((extension) =>
    lowerCaseName.endsWith(extension),
  );
  const normalizedMimeType = mimeType.toLowerCase().trim();

  if (!hasAllowedExtension) {
    return false;
  }

  if (!normalizedMimeType) {
    return true;
  }

  if (allowedApplicationMimeTypes.includes(
    normalizedMimeType as (typeof allowedApplicationMimeTypes)[number],
  )) {
    return true;
  }

  if (normalizedMimeType === "image/jpg") {
    return true;
  }

  return false;
}

export function sanitizeApplicationFileName(fileName: string) {
  return fileName.replace(/[^\w.\- ]/g, "_");
}

export function isValidHelperApplicationUploadKind(
  value: string,
): value is HelperApplicationUploadKind {
  return (
    helperApplicationUploadKinds as readonly string[]
  ).includes(value);
}

export function getHelperApplicationFileSizeLimit(kind: HelperApplicationUploadKind) {
  return kind === "PORTFOLIO"
    ? maxPortfolioApplicationFileSizeBytes
    : maxIdentityApplicationFileSizeBytes;
}

export function buildHelperApplicationUploadPathname(params: {
  uploadKey: string;
  kind: HelperApplicationUploadKind;
  fileName: string;
}) {
  const folder =
    params.kind === "PORTFOLIO" ? "portfolio" : "identity";
  const safeFileName = sanitizeApplicationFileName(params.fileName);

  return `${helperApplicationUploadPrefix}${params.uploadKey}/${folder}/${Date.now()}-${safeFileName}`;
}

export function isHelperApplicationBlobPathname(pathname: string) {
  return pathname.startsWith(helperApplicationUploadPrefix);
}

export function isHelperPortfolioBlobPathname(pathname: string) {
  return pathname.startsWith(helperPortfolioUploadPrefix);
}

export function buildHelperPortfolioUploadPathname(params: {
  uploadKey: string;
  fileName: string;
}) {
  const safeFileName = sanitizeApplicationFileName(params.fileName);
  return `${helperPortfolioUploadPrefix}${params.uploadKey}/portfolio/${Date.now()}-${safeFileName}`;
}

export function getApplicationFileTitle(fileName: string, fallback: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "").trim();
  return withoutExtension || fallback;
}

export function getApplicationFileDownloadPath(fileId: string) {
  return `/api/helper-application-files/${fileId}`;
}

export function getPortfolioPreviewImageUrl(fileId: string, mimeType: string, fileName: string) {
  if (mimeType.startsWith("image/")) {
    return getApplicationFileDownloadPath(fileId);
  }

  const label = getApplicationFileTitle(fileName, "Portfolio PDF").replace(/[<&>]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#f4ead3"/><rect x="80" y="70" width="640" height="460" rx="34" fill="#ffffff" stroke="#1f1b18" stroke-width="12"/><text x="400" y="255" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="700" fill="#e24b4a">PDF</text><text x="400" y="340" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600" fill="#1f1b18">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
