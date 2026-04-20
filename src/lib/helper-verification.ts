import { maxApplicationFileSizeBytes } from "@/lib/helper-applications";

const allowedVerificationFileExtensions = [".png", ".jpg", ".jpeg"] as const;
const allowedVerificationMimeTypes = ["image/png", "image/jpeg"] as const;

export const helperVerificationStatusLabelMap = {
  NONE: "Not submitted",
  PENDING: "Pending review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
} as const;

export function isAllowedVerificationFile(fileName: string, mimeType: string) {
  const lowerCaseName = fileName.toLowerCase();
  const hasAllowedExtension = allowedVerificationFileExtensions.some((extension) =>
    lowerCaseName.endsWith(extension),
  );

  return (
    hasAllowedExtension &&
    allowedVerificationMimeTypes.includes(
      mimeType.toLowerCase() as (typeof allowedVerificationMimeTypes)[number],
    )
  );
}

export function getVerificationFileSizeLimit() {
  return maxApplicationFileSizeBytes;
}

export function getHelperVerificationFilePath(side: "front" | "back") {
  return `/api/helper/verification/file/${side}`;
}

export function getAdminHelperVerificationFilePath(
  helperId: string,
  side: "front" | "back",
) {
  return `/api/admin/helpers/${helperId}/verification-file/${side}`;
}

export function getHelperVerificationStatusLabel(
  status: "NONE" | "PENDING" | "VERIFIED" | "REJECTED",
) {
  return helperVerificationStatusLabelMap[status];
}
