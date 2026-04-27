import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAccessibleHelperByEmail, getAuthSession } from "@/lib/auth";
import {
  buildHelperPortfolioUploadPathname,
  getHelperApplicationFileSizeLimit,
  helperPortfolioUploadPrefix,
  isAllowedApplicationFile,
  sanitizeApplicationFileName,
} from "@/lib/helper-applications";

type UploadClientPayload = {
  kind: "PORTFOLIO";
  uploadKey: string;
  filename: string;
};

function parseClientPayload(value: string | null): UploadClientPayload | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as UploadClientPayload;
  } catch {
    return null;
  }
}

function isValidUploadKey(value: string) {
  return /^[a-zA-Z0-9_-]{8,80}$/.test(value);
}

function isValidPayload(payload: UploadClientPayload | null): payload is UploadClientPayload {
  return Boolean(
    payload &&
      payload.kind === "PORTFOLIO" &&
      isValidUploadKey(payload.uploadKey) &&
      payload.filename.trim().length > 0 &&
      isAllowedApplicationFile(payload.filename, ""),
  );
}

function isValidUploadPathname(pathname: string, payload: UploadClientPayload) {
  if (!pathname.startsWith(helperPortfolioUploadPrefix)) {
    return false;
  }

  const safeFileName = sanitizeApplicationFileName(payload.filename);
  const expectedPrefix = `${helperPortfolioUploadPrefix}${payload.uploadKey}/portfolio/`;

  return pathname.startsWith(expectedPrefix) && pathname.endsWith(`-${safeFileName}`);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 500 });
  }

  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const helper = await getAccessibleHelperByEmail(session.user.email);

  if (!helper) {
    return NextResponse.json({ error: "Approved helper access required." }, { status: 403 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parseClientPayload(clientPayload ?? null);

        if (!isValidPayload(payload)) {
          throw new Error("Invalid helper portfolio upload payload.");
        }

        if (!isValidUploadPathname(pathname, payload)) {
          throw new Error("Invalid upload destination.");
        }

        return {
          allowedContentTypes: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
          maximumSizeInBytes: getHelperApplicationFileSizeLimit("PORTFOLIO"),
          addRandomSuffix: false,
          tokenPayload: JSON.stringify(payload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = parseClientPayload(tokenPayload ?? null);
        console.info("[helper-portfolio-upload] blob upload completed", {
          pathname: blob.pathname,
          uploadKey: payload?.uploadKey ?? "UNKNOWN",
        });
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[helper-portfolio-upload] token generation failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not prepare the portfolio upload.",
      },
      { status: 400 },
    );
  }
}
