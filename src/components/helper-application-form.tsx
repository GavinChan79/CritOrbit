"use client";

import { useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";
import { buttonStyles, InputShell } from "@/components/ui-primitives";
import {
  categoryOptions,
  helperAgreementItems,
  helperExperienceLevelOptions,
  helperPriceAnchorOptions,
  helperTypeOptions,
} from "@/lib/constants";
import {
  buildHelperApplicationUploadPathname,
  isAllowedApplicationFile,
  maxIdentityApplicationFileSizeBytes,
  maxPortfolioApplicationFileSizeBytes,
  maxPortfolioFiles,
  sanitizeApplicationFileName,
  type HelperApplicationUploadKind,
} from "@/lib/helper-applications";
import { cn } from "@/lib/utils";
import { helperApplicationSchema } from "@/lib/validators";

type AgreementState = {
  originalWork: boolean;
  noScamGhosting: boolean;
  platformLiability: boolean;
  deadlinesCommunication: boolean;
  serviceTerms: boolean;
};

type UploadedApplicationFile = {
  clientId: string;
  kind: HelperApplicationUploadKind;
  filename: string;
  contentType: string;
  size: number;
  pathname: string;
  url: string;
  progress: number;
  status: "uploading" | "uploaded" | "error";
  errorMessage?: string;
};

const defaultAgreements: AgreementState = {
  originalWork: false,
  noScamGhosting: false,
  platformLiability: false,
  deadlinesCommunication: false,
  serviceTerms: false,
};

export function HelperApplicationForm() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadKey, setUploadKey] = useState(createUploadKey);
  const [form, setForm] = useState({
    name: "",
    type: "INDIVIDUAL",
    teamSize: "",
    category: "INTERIOR_DESIGN",
    experience: "",
    portfolioNote: "",
    priceAnchor: "RM100",
    email: "",
    whatsappNumber: "",
    confirmations: defaultAgreements,
  });
  const [portfolioUploads, setPortfolioUploads] = useState<UploadedApplicationFile[]>([]);
  const [identityFrontUpload, setIdentityFrontUpload] =
    useState<UploadedApplicationFile | null>(null);
  const [identityBackUpload, setIdentityBackUpload] =
    useState<UploadedApplicationFile | null>(null);

  const allAgreementsAccepted = Object.values(form.confirmations).every(Boolean);
  const hasUploadingFiles = useMemo(
    () =>
      [...portfolioUploads, identityFrontUpload, identityBackUpload]
        .filter((file): file is UploadedApplicationFile => Boolean(file))
        .some((file) => file.status === "uploading"),
    [identityBackUpload, identityFrontUpload, portfolioUploads],
  );
  const totalUploadMegabytes = formatMegabytes(
    getTotalUploadBytes(portfolioUploads, identityFrontUpload, identityBackUpload),
  );

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setError("");
    setSuccess("");
  }

  async function appendPortfolioFiles(nextFiles: FileList | null) {
    const incomingFiles = Array.from(nextFiles ?? []);

    if (incomingFiles.length === 0) {
      return;
    }

    setError("");
    setSuccess("");
    setFieldErrors((current) => ({ ...current, portfolioFiles: "" }));

    const currentCount = portfolioUploads.filter((file) => file.status !== "error").length;
    if (currentCount + incomingFiles.length > maxPortfolioFiles) {
      const message = `Upload up to ${maxPortfolioFiles} portfolio files.`;
      setFieldErrors((current) => ({ ...current, portfolioFiles: message }));
      setError(message);
      return;
    }

    for (const file of incomingFiles) {
      const validationError = validateFile(file, "PORTFOLIO");
      if (validationError) {
        setFieldErrors((current) => ({ ...current, portfolioFiles: validationError }));
        setError(validationError);
        continue;
      }

      await uploadApplicationFile(file, "PORTFOLIO");
    }
  }

  async function updateIdentityFile(side: "front" | "back", file: File | null) {
    const kind = side === "front" ? "IDENTITY_FRONT" : "IDENTITY_BACK";
    const fieldKey = side === "front" ? "identityFrontFile" : "identityBackFile";

    if (!file) {
      if (side === "front") {
        setIdentityFrontUpload(null);
      } else {
        setIdentityBackUpload(null);
      }
      setFieldErrors((current) => ({ ...current, [fieldKey]: "" }));
      setError("");
      setSuccess("");
      return;
    }

    const validationError = validateFile(file, kind);
    if (validationError) {
      setFieldErrors((current) => ({ ...current, [fieldKey]: validationError }));
      setError(validationError);
      setSuccess("");
      return;
    }

    setFieldErrors((current) => ({ ...current, [fieldKey]: "" }));
    setError("");
    setSuccess("");
    await uploadApplicationFile(file, kind);
  }

  async function uploadApplicationFile(
    file: File,
    kind: HelperApplicationUploadKind,
  ) {
    const clientId = `${kind}-${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
    const baseEntry: UploadedApplicationFile = {
      clientId,
      kind,
      filename: sanitizeApplicationFileName(file.name),
      contentType: file.type || "application/octet-stream",
      size: file.size,
      pathname: "",
      url: "",
      progress: 0,
      status: "uploading",
    };

    setUploadState(kind, baseEntry);

    try {
      const pathname = buildHelperApplicationUploadPathname({
        uploadKey,
        kind,
        fileName: file.name,
      });
      const blob = await upload(pathname, file, {
        access: "private",
        handleUploadUrl: "/api/uploads/helper-application",
        clientPayload: JSON.stringify({
          kind,
          uploadKey,
          filename: file.name,
        }),
        multipart: file.size > 5 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => {
          setUploadProgress(kind, clientId, percentage);
        },
      });

      setUploadState(kind, {
        ...baseEntry,
        pathname: blob.pathname,
        url: blob.url,
        progress: 100,
        status: "uploaded",
      });
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "File upload failed. Please try again.";

      setUploadState(kind, {
        ...baseEntry,
        status: "error",
        progress: 0,
        errorMessage: message,
      });
      setFieldErrors((current) => ({
        ...current,
        [kind === "PORTFOLIO" ? "portfolioFiles" : kind === "IDENTITY_FRONT" ? "identityFrontFile" : "identityBackFile"]:
          message,
      }));
      setError(message);
      setSuccess("");
    }
  }

  function setUploadState(kind: HelperApplicationUploadKind, nextEntry: UploadedApplicationFile) {
    if (kind === "PORTFOLIO") {
      setPortfolioUploads((current) => {
        const existingIndex = current.findIndex((file) => file.clientId === nextEntry.clientId);
        if (existingIndex === -1) {
          return [...current, nextEntry];
        }

        const next = [...current];
        next[existingIndex] = nextEntry;
        return next;
      });
      return;
    }

    if (kind === "IDENTITY_FRONT") {
      setIdentityFrontUpload(nextEntry);
      return;
    }

    setIdentityBackUpload(nextEntry);
  }

  function setUploadProgress(
    kind: HelperApplicationUploadKind,
    clientId: string,
    progress: number,
  ) {
    if (kind === "PORTFOLIO") {
      setPortfolioUploads((current) =>
        current.map((file) =>
          file.clientId === clientId ? { ...file, progress } : file,
        ),
      );
      return;
    }

    if (kind === "IDENTITY_FRONT") {
      setIdentityFrontUpload((current) =>
        current?.clientId === clientId ? { ...current, progress } : current,
      );
      return;
    }

    setIdentityBackUpload((current) =>
      current?.clientId === clientId ? { ...current, progress } : current,
    );
  }

  function removePortfolioUpload(clientId: string) {
    setPortfolioUploads((current) => current.filter((file) => file.clientId !== clientId));
    setFieldErrors((current) => ({ ...current, portfolioFiles: "" }));
    setError("");
    setSuccess("");
  }

  function removeIdentityUpload(side: "front" | "back") {
    if (side === "front") {
      setIdentityFrontUpload(null);
      setFieldErrors((current) => ({ ...current, identityFrontFile: "" }));
    } else {
      setIdentityBackUpload(null);
      setFieldErrors((current) => ({ ...current, identityBackFile: "" }));
    }
    setError("");
    setSuccess("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    const payload = {
      name: form.name,
      type: form.type as "INDIVIDUAL" | "TEAM",
      teamSize: form.teamSize ? Number(form.teamSize) : null,
      category: form.category,
      experience: form.experience,
      portfolioNote: form.portfolioNote,
      priceAnchor: form.priceAnchor,
      email: form.email,
      whatsappNumber: form.whatsappNumber.replace(/[^\d]/g, ""),
      confirmations: form.confirmations,
    };

    const parsed = helperApplicationSchema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors = parsed.error.issues.reduce<Record<string, string>>((accumulator, issue) => {
        const key = String(issue.path[0] ?? "form");
        if (!accumulator[key]) {
          accumulator[key] = issue.message;
        }
        return accumulator;
      }, {});
      setFieldErrors(nextErrors);
      setError(parsed.error.issues[0]?.message ?? "Please review the application form.");
      setPending(false);
      return;
    }

    if (hasUploadingFiles) {
      setError("Please wait for all files to finish uploading before submitting.");
      setPending(false);
      return;
    }

    const uploadedPortfolioFiles = portfolioUploads.filter(
      (file): file is UploadedApplicationFile =>
        file.status === "uploaded" && file.kind === "PORTFOLIO",
    );

    if (uploadedPortfolioFiles.length === 0) {
      setFieldErrors({ portfolioFiles: "Upload at least one portfolio file." });
      setError("Upload at least one portfolio file.");
      setPending(false);
      return;
    }

    if (uploadedPortfolioFiles.length > maxPortfolioFiles) {
      setFieldErrors({ portfolioFiles: `Upload up to ${maxPortfolioFiles} portfolio files.` });
      setError(`Upload up to ${maxPortfolioFiles} portfolio files.`);
      setPending(false);
      return;
    }

    const uploadedIdentityFront =
      identityFrontUpload?.status === "uploaded" ? identityFrontUpload : null;
    const uploadedIdentityBack =
      identityBackUpload?.status === "uploaded" ? identityBackUpload : null;

    if (Boolean(uploadedIdentityFront) !== Boolean(uploadedIdentityBack)) {
      setFieldErrors({
        identityFrontFile: uploadedIdentityFront ? "" : "Upload both IC files or leave both blank.",
        identityBackFile: uploadedIdentityBack ? "" : "Upload both IC files or leave both blank.",
      });
      setError("Upload both IC files or leave both blank.");
      setPending(false);
      return;
    }

    const failedUpload = [
      ...portfolioUploads,
      identityFrontUpload,
      identityBackUpload,
    ]
      .filter((file): file is UploadedApplicationFile => Boolean(file))
      .find((file) => file.status === "error");

    if (failedUpload) {
      setError("Please remove failed uploads or upload the file again before submitting.");
      setPending(false);
      return;
    }

    try {
      const response = await fetch("/api/helpers/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          portfolioFiles: uploadedPortfolioFiles.map(serializeUploadedFile),
          identityFrontFile: uploadedIdentityFront
            ? serializeUploadedFile(uploadedIdentityFront)
            : null,
          identityBackFile: uploadedIdentityBack
            ? serializeUploadedFile(uploadedIdentityBack)
            : null,
        }),
      });
      const responseText = await response.text();
      const json = safeJsonParse(responseText);

      if (!response.ok) {
        setError(json.error ?? "Could not submit your application.");
        setPending(false);
        return;
      }

      setSuccess(json.message ?? "Application submitted successfully.");
      setForm({
        name: "",
        type: "INDIVIDUAL",
        teamSize: "",
        category: "INTERIOR_DESIGN",
        experience: "",
        portfolioNote: "",
        priceAnchor: "RM100",
        email: "",
        whatsappNumber: "",
        confirmations: defaultAgreements,
      });
      setPortfolioUploads([]);
      setIdentityFrontUpload(null);
      setIdentityBackUpload(null);
      setUploadKey(createUploadKey());
    } catch {
      setError("Could not submit your application. Please review the form and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="retro-card space-y-6 bg-white p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <InputShell label="Full Name" error={fieldErrors.name}>
          <input
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            className={inputClass(fieldErrors.name)}
          />
        </InputShell>

        <InputShell label="Helper Type" error={fieldErrors.type}>
          <div className="relative">
            <select
              value={form.type}
              onChange={(event) => {
                const value = event.target.value;
                setField("type", value);
                if (value === "INDIVIDUAL") {
                  setField("teamSize", "");
                }
              }}
              className={selectClass(fieldErrors.type)}
            >
              {helperTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label === "Studio" ? "Team / Studio" : option.label}
                </option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </InputShell>

        {form.type === "TEAM" ? (
          <InputShell label="Team Size" error={fieldErrors.teamSize}>
            <input
              type="number"
              min="1"
              value={form.teamSize}
              onChange={(event) => setField("teamSize", event.target.value)}
              className={inputClass(fieldErrors.teamSize)}
            />
          </InputShell>
        ) : null}

        <InputShell label="Category" error={fieldErrors.category}>
          <div className="relative">
            <select
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
              className={selectClass(fieldErrors.category)}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </InputShell>

        <InputShell label="Email" error={fieldErrors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            className={inputClass(fieldErrors.email)}
          />
        </InputShell>

        <InputShell label="WhatsApp Number" error={fieldErrors.whatsappNumber}>
          <input
            value={form.whatsappNumber}
            onChange={(event) =>
              setField("whatsappNumber", event.target.value.replace(/[^\d]/g, ""))
            }
            className={inputClass(fieldErrors.whatsappNumber)}
            placeholder="60123456789"
          />
        </InputShell>
      </div>

      <InputShell label="Experience" error={fieldErrors.experience}>
        <div className="relative">
          <select
            value={form.experience}
            onChange={(event) => setField("experience", event.target.value)}
            className={selectClass(fieldErrors.experience)}
          >
            <option value="" disabled>
              Select experience level
            </option>
            {helperExperienceLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <SelectArrow />
        </div>
      </InputShell>

      <InputShell label="Portfolio (link or text)" error={fieldErrors.portfolioNote}>
        <textarea
          rows={4}
          value={form.portfolioNote}
          onChange={(event) => setField("portfolioNote", event.target.value)}
          className={inputClass(fieldErrors.portfolioNote)}
        />
      </InputShell>

      <InputShell label="Starting Price" error={fieldErrors.priceAnchor}>
        <div className="relative">
          <select
            value={form.priceAnchor}
            onChange={(event) => setField("priceAnchor", event.target.value)}
            className={selectClass(fieldErrors.priceAnchor)}
          >
            {helperPriceAnchorOptions
              .filter((option) => option.value !== "BELOW_RM100")
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
          <SelectArrow />
        </div>
      </InputShell>

      <div className="rounded-[24px] border-[3px] border-line bg-cream p-5">
        <div className="display-font text-2xl font-black">Portfolio Files</div>
        <p className="mt-2 text-sm text-muted">
          Upload up to {maxPortfolioFiles} files. Supported: PNG, JPG, JPEG, PDF. Max 20MB per file.
        </p>
        <div className="mt-4">
          <InputShell label="Portfolio Uploads" error={fieldErrors.portfolioFiles}>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              multiple
              onChange={(event) => {
                void appendPortfolioFiles(event.target.files);
                event.target.value = "";
              }}
              className={inputClass(fieldErrors.portfolioFiles)}
            />
          </InputShell>
          {portfolioUploads.length ? (
            <div className="mt-3 space-y-2">
              {portfolioUploads.map((file) => (
                <UploadFileRow
                  key={file.clientId}
                  file={file}
                  onRemove={
                    file.status === "uploading"
                      ? undefined
                      : () => removePortfolioUpload(file.clientId)
                  }
                />
              ))}
            </div>
          ) : null}
          <p className="mt-3 text-xs font-semibold text-muted">
            Uploaded: {totalUploadMegabytes.toFixed(1)} MB total
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border-[3px] border-line bg-cream p-5">
        <div className="display-font text-2xl font-black">Identity Certification</div>
        <p className="mt-2 text-sm text-muted">
          Optional for application review. Submit both files if you want to qualify for the verified helper badge later.
        </p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <InputShell label="IC Front" error={fieldErrors.identityFrontFile}>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(event) =>
                void updateIdentityFile("front", event.target.files?.[0] ?? null)
              }
              className={inputClass(fieldErrors.identityFrontFile)}
            />
          </InputShell>
          <InputShell label="IC Back" error={fieldErrors.identityBackFile}>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(event) =>
                void updateIdentityFile("back", event.target.files?.[0] ?? null)
              }
              className={inputClass(fieldErrors.identityBackFile)}
            />
          </InputShell>
        </div>
        <p className="mt-4 text-sm text-muted">Max 10MB per file.</p>
        <div className="mt-4 space-y-2">
          {identityFrontUpload ? (
            <UploadFileRow
              file={identityFrontUpload}
              label="IC Front"
              onRemove={
                identityFrontUpload.status === "uploading"
                  ? undefined
                  : () => removeIdentityUpload("front")
              }
            />
          ) : null}
          {identityBackUpload ? (
            <UploadFileRow
              file={identityBackUpload}
              label="IC Back"
              onRemove={
                identityBackUpload.status === "uploading"
                  ? undefined
                  : () => removeIdentityUpload("back")
              }
            />
          ) : null}
        </div>
        <p className="mt-4 text-sm leading-7 text-muted">
          To protect both users and helpers and to maintain a reliable system, we will only use the information for internal verification purposes, and it will not be shared externally.
        </p>
      </div>

      <div className="rounded-[24px] border-[3px] border-line bg-cream p-5">
        <div className="display-font text-2xl font-black">Required Agreement</div>
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-3 rounded-[18px] border-[3px] border-line bg-yellow px-4 py-3 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={allAgreementsAccepted}
              onChange={(event) =>
                setField("confirmations", {
                  originalWork: event.target.checked,
                  noScamGhosting: event.target.checked,
                  platformLiability: event.target.checked,
                  deadlinesCommunication: event.target.checked,
                  serviceTerms: event.target.checked,
                })
              }
            />
            <span>I accept all required agreements</span>
          </label>
          {helperAgreementItems.map((label, index) => {
            const key = agreementKeyOrder[index];
            return (
              <label
                key={label}
                className="flex items-start gap-3 rounded-[18px] border-[3px] border-line bg-white px-4 py-3 text-sm font-semibold"
              >
                <input
                  type="checkbox"
                  checked={form.confirmations[key]}
                  onChange={(event) =>
                    setField("confirmations", {
                      ...form.confirmations,
                      [key]: event.target.checked,
                    })
                  }
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {error ? <p className="text-sm font-bold text-red">{error}</p> : null}
      {success ? <p className="text-sm font-bold text-green">{success}</p> : null}

      <button
        type="submit"
        disabled={pending || hasUploadingFiles}
        className={buttonStyles({ tone: "purple", size: "lg" })}
      >
        {pending
          ? "Submitting..."
          : hasUploadingFiles
            ? "Uploading files..."
            : "Submit Helper Application"}
      </button>
    </form>
  );
}

const agreementKeyOrder: Array<keyof AgreementState> = [
  "originalWork",
  "noScamGhosting",
  "platformLiability",
  "deadlinesCommunication",
  "serviceTerms",
];

function UploadFileRow({
  file,
  label,
  onRemove,
}: {
  file: UploadedApplicationFile;
  label?: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border-[3px] border-line bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black text-ink">
          {label ? `${label}: ` : ""}
          {file.filename}
        </div>
        <div className="mt-1 text-xs font-semibold text-muted">
          {formatMegabytes(file.size).toFixed(1)} MB
          {" · "}
          {file.status === "uploading"
            ? `Uploading ${Math.round(file.progress)}%`
            : file.status === "uploaded"
              ? "Uploaded"
              : file.errorMessage ?? "Upload failed"}
        </div>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className={buttonStyles({ tone: "ink", size: "sm" })}
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}

function inputClass(error?: string) {
  return cn(
    "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
    error ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
  );
}

function selectClass(error?: string) {
  return cn(
    "w-full appearance-none rounded-[18px] bg-[#efe3bf] px-4 py-3 pr-12 outline-none font-semibold text-ink",
    error ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
  );
}

function SelectArrow() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-ink/70">
      ▾
    </span>
  );
}

function safeJsonParse(value: string): { error?: string; message?: string } {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as { error?: string; message?: string };
  } catch {
    return {};
  }
}

function getTotalUploadBytes(
  portfolioFiles: UploadedApplicationFile[],
  identityFrontFile: UploadedApplicationFile | null,
  identityBackFile: UploadedApplicationFile | null,
) {
  return (
    portfolioFiles
      .filter((file) => file.status !== "error")
      .reduce((total, file) => total + file.size, 0) +
    (identityFrontFile?.status === "error" ? 0 : identityFrontFile?.size ?? 0) +
    (identityBackFile?.status === "error" ? 0 : identityBackFile?.size ?? 0)
  );
}

function formatMegabytes(bytes: number) {
  return bytes / (1024 * 1024);
}

function createUploadKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `helperapp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function validateFile(file: File, kind: HelperApplicationUploadKind) {
  if (!isAllowedApplicationFile(file.name, file.type || "")) {
    return "Only PDF, PNG, JPG, and JPEG files are supported.";
  }

  const sizeLimit =
    kind === "PORTFOLIO"
      ? maxPortfolioApplicationFileSizeBytes
      : maxIdentityApplicationFileSizeBytes;

  if (file.size > sizeLimit) {
    return kind === "PORTFOLIO"
      ? "Each portfolio file must be under 20MB"
      : "Each IC file must be under 10MB";
  }

  return "";
}

function serializeUploadedFile(file: UploadedApplicationFile) {
  return {
    url: file.url,
    pathname: file.pathname,
    filename: file.filename,
    contentType: file.contentType,
    size: file.size,
    kind: file.kind,
  };
}
