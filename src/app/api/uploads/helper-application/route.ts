import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import {
  getHelperApplicationFileSizeLimit,
  helperApplicationUploadPrefix,
  isAllowedApplicationFile,
  isValidHelperApplicationUploadKind,
  sanitizeApplicationFileName,
} from "@/lib/helper-applications";

type UploadClientPayload = {
  kind: string;
  uploadKey: string;
  filename: string;
};

function parseClientPayload(value: string | null): UploadClientPayload | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as UploadClientPayload;
    return parsed;
  } catch {
    return null;
  }
}

function isValidUploadKey(value: string) {
  return /^[a-zA-Z0-9_-]{8,80}$/.test(value);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage is not configured." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parseClientPayload(clientPayload ?? null);

        if (!payload || !isValidApplicationUploadPayload(payload)) {
          throw new Error("Invalid helper application upload payload.");
        }

        if (!isValidUploadPathname(pathname, payload)) {
          throw new Error("Invalid upload destination.");
        }

        return {
          allowedContentTypes: getAllowedContentTypes(payload.kind),
          maximumSizeInBytes: getHelperApplicationFileSizeLimit(payload.kind),
          addRandomSuffix: false,
          tokenPayload: JSON.stringify(payload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = parseClientPayload(tokenPayload ?? null);
        console.info("[helper-application-upload] blob upload completed", {
          pathname: blob.pathname,
          kind: payload?.kind ?? "UNKNOWN",
          uploadKey: payload?.uploadKey ?? "UNKNOWN",
        });
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[helper-application-upload] token generation failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not prepare the helper application upload.",
      },
      { status: 400 },
    );
  }
}

function isValidApplicationUploadPayload(
  payload: UploadClientPayload,
): payload is UploadClientPayload & {
  kind: "PORTFOLIO" | "IDENTITY_FRONT" | "IDENTITY_BACK";
} {
  return (
    isValidHelperApplicationUploadKind(payload.kind) &&
    isValidUploadKey(payload.uploadKey) &&
    payload.filename.trim().length > 0 &&
    isAllowedApplicationFile(payload.filename, "")
  );
}

function getAllowedContentTypes(kind: "PORTFOLIO" | "IDENTITY_FRONT" | "IDENTITY_BACK") {
  if (kind === "PORTFOLIO") {
    return ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  }

  return ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
}

function isValidUploadPathname(pathname: string, payload: UploadClientPayload) {
  if (!pathname.startsWith(helperApplicationUploadPrefix)) {
    return false;
  }

  const expectedFolder = payload.kind === "PORTFOLIO" ? "portfolio" : "identity";
  const safeFileName = sanitizeApplicationFileName(payload.filename);
  const expectedPrefix = `${helperApplicationUploadPrefix}${payload.uploadKey}/${expectedFolder}/`;

  return pathname.startsWith(expectedPrefix) && pathname.endsWith(`-${safeFileName}`);
}
