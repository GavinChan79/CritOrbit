"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles, Card, EmptyState, InputShell } from "@/components/ui-primitives";
import {
  buildHelperPortfolioUploadPathname,
  getHelperApplicationFileSizeLimit,
  sanitizeApplicationFileName,
} from "@/lib/helper-applications";

type PortfolioItemRecord = {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  externalLink?: string | null;
  displayOrder: number;
  sourceApplicationFileId?: string | null;
};

const allowedPortfolioMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

function isAllowedPortfolioFile(file: File) {
  const lowerCaseName = file.name.toLowerCase();
  const hasAllowedExtension =
    lowerCaseName.endsWith(".pdf") ||
    lowerCaseName.endsWith(".png") ||
    lowerCaseName.endsWith(".jpg") ||
    lowerCaseName.endsWith(".jpeg");

  if (!hasAllowedExtension) {
    return false;
  }

  if (!file.type) {
    return true;
  }

  return allowedPortfolioMimeTypes.has(file.type.toLowerCase());
}

function getPortfolioUploadErrorMessage(error: unknown) {
  if (
    error instanceof SyntaxError ||
    (error instanceof Error && /unexpected token|<html|<!doctype|request en/i.test(error.message))
  ) {
    return "File is too large. Please upload a smaller PDF.";
  }

  if (
    error instanceof Error &&
    /payload too large|request entity too large|413|body exceeded|entity too large/i.test(
      error.message,
    )
  ) {
    return "File is too large. Please upload a smaller PDF.";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Portfolio upload failed.";
}

export function HelperPortfolioManager(props: {
  items: PortfolioItemRecord[];
}) {
  const router = useRouter();
  const maxPortfolioFileSizeBytes = getHelperApplicationFileSizeLimit("PORTFOLIO");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!file) {
      setStatus({
        tone: "error",
        message: "Choose a portfolio file before uploading.",
      });
      return;
    }

    if (file.size > maxPortfolioFileSizeBytes) {
      setStatus({
        tone: "error",
        message: "File is too large. Please upload a smaller PDF.",
      });
      return;
    }

    if (!isAllowedPortfolioFile(file)) {
      setStatus({
        tone: "error",
        message: "Only PDF, PNG, JPG, and JPEG files are supported.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const pathname = buildHelperPortfolioUploadPathname({
        uploadKey,
        fileName: file.name,
      });

      const blob = await upload(pathname, file, {
        access: "private",
        handleUploadUrl: "/api/uploads/helper-portfolio",
        clientPayload: JSON.stringify({
          kind: "PORTFOLIO",
          uploadKey,
          filename: sanitizeApplicationFileName(file.name),
        }),
        multipart: file.size > 5 * 1024 * 1024,
      });

      const response = await fetch("/api/helper/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          displayOrder,
          uploadedFile: {
            url: blob.url,
            pathname: blob.pathname,
            filename: file.name,
            contentType: file.type,
            size: file.size,
            kind: "PORTFOLIO",
          },
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      const json = contentType.includes("application/json")
        ? ((await response.json()) as { error?: string })
        : null;

      if (!response.ok) {
        setStatus({
          tone: "error",
          message:
            json?.error ??
            (response.status === 413
              ? "File is too large. Please upload a smaller PDF."
              : "Portfolio upload failed."),
        });
        return;
      }

      setTitle("");
      setDescription("");
      setDisplayOrder("0");
      setFile(null);
      const fileInput = document.getElementById("helper-portfolio-file") as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }
      setStatus({
        tone: "success",
        message: "Portfolio item uploaded successfully.",
      });
      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        message: getPortfolioUploadErrorMessage(error),
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteItem(itemId: string, itemTitle: string) {
    const confirmed = window.confirm(`Delete portfolio item "${itemTitle}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(itemId);
    setStatus(null);

    try {
      const response = await fetch(`/api/helper/portfolio/${itemId}`, {
        method: "DELETE",
      });
      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: json.error ?? "Portfolio delete failed.",
        });
        return;
      }

      setStatus({
        tone: "success",
        message: "Portfolio item deleted.",
      });
      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Portfolio delete failed.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="bg-white">
        <div className="display-font text-3xl font-black">Upload portfolio work</div>
        <p className="mt-3 text-sm text-muted">
          Upload one portfolio file at a time. Supported formats: PNG, JPG, JPEG, PDF. Maximum 20MB per file.
        </p>

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <InputShell label="Portfolio Title" hint="Optional. If empty, the file name becomes the title.">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>

          <InputShell label="Description" hint="Optional short context for the public helper page.">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>

          <InputShell label="Display Order" hint="Lower numbers appear first on your public profile.">
            <input
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value.replace(/[^\d]/g, ""))}
              type="number"
              min="0"
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>

          <InputShell label="Portfolio File">
            <input
              id="helper-portfolio-file"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;

                if (nextFile) {
                  if (nextFile.size > maxPortfolioFileSizeBytes) {
                    setFile(null);
                    setStatus({
                      tone: "error",
                      message: "File is too large. Please upload a smaller PDF.",
                    });
                    event.currentTarget.value = "";
                    return;
                  }

                  if (!isAllowedPortfolioFile(nextFile)) {
                    setFile(null);
                    setStatus({
                      tone: "error",
                      message: "Only PDF, PNG, JPG, and JPEG files are supported.",
                    });
                    event.currentTarget.value = "";
                    return;
                  }
                }

                setFile(nextFile);
                setStatus(null);
              }}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none file:mr-4 file:rounded-[14px] file:border-0 file:bg-yellow file:px-4 file:py-2 file:font-black"
            />
          </InputShell>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="submit"
              disabled={isUploading}
              className={buttonStyles({ tone: "purple", size: "md" })}
            >
              {isUploading ? "Uploading..." : "Upload Portfolio Item"}
            </button>
            {status ? (
              <p className={status.tone === "success" ? "text-sm font-semibold text-green" : "text-sm font-semibold text-[#E24B4A]"}>
                {status.message}
              </p>
            ) : null}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {props.items.length === 0 ? (
          <EmptyState
            title="No portfolio items yet"
            description="Your uploads will appear here and on the public helper page automatically once your helper profile is visible."
          />
        ) : (
          props.items.map((item) => (
            <Card key={item.id} className="bg-white">
              <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-start">
                <div className="overflow-hidden rounded-[18px] border-[3px] border-line bg-cream">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={240}
                    height={240}
                    unoptimized
                    className="h-24 w-full object-cover"
                  />
                </div>
                <div>
                  <div className="display-font text-2xl font-black">{item.title}</div>
                  <p className="mt-2 text-sm text-muted">Display order {item.displayOrder}</p>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                  ) : null}
                  {item.externalLink ? (
                    <a
                      href={item.externalLink}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-3 inline-flex ${buttonStyles({ tone: "ink", size: "sm" })}`}
                    >
                      Open Portfolio File
                    </a>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id, item.title)}
                  disabled={deletingId === item.id}
                  className={buttonStyles({ tone: "ink", size: "sm" })}
                >
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
