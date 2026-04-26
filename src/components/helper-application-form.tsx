"use client";

import { useState } from "react";
import { buttonStyles, InputShell } from "@/components/ui-primitives";
import {
  categoryOptions,
  helperExperienceLevelOptions,
  helperAgreementItems,
  helperPriceAnchorOptions,
  helperTypeOptions,
} from "@/lib/constants";
import {
  maxPortfolioFiles,
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

const defaultAgreements: AgreementState = {
  originalWork: false,
  noScamGhosting: false,
  platformLiability: false,
  deadlinesCommunication: false,
  serviceTerms: false,
};

const maxClientFileSizeBytes = 2 * 1024 * 1024;
const maxClientTotalUploadBytes = 5 * 1024 * 1024;

export function HelperApplicationForm() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [identityFrontFile, setIdentityFrontFile] = useState<File | null>(null);
  const [identityBackFile, setIdentityBackFile] = useState<File | null>(null);
  const allAgreementsAccepted = Object.values(form.confirmations).every(Boolean);
  const totalUploadMegabytes = formatMegabytes(
    getTotalUploadBytes(portfolioFiles, identityFrontFile, identityBackFile),
  );

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setError("");
    setSuccess("");
  }

  function appendPortfolioFiles(nextFiles: FileList | null) {
    const incomingFiles = Array.from(nextFiles ?? []);

    if (incomingFiles.length === 0) {
      return;
    }

    const oversizeFile = incomingFiles.find((file) => file.size > maxClientFileSizeBytes);

    if (oversizeFile) {
      setFieldErrors((current) => ({
        ...current,
        portfolioFiles: "Each file must be under 2MB",
      }));
      setError("Each file must be under 2MB");
      setSuccess("");
      return;
    }

    setPortfolioFiles((current) => {
      const merged = [...current];

      for (const file of incomingFiles) {
        const alreadyAdded = merged.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified,
        );

        if (!alreadyAdded && merged.length < maxPortfolioFiles) {
          merged.push(file);
        }
      }

      const totalBytes = getTotalUploadBytes(merged, identityFrontFile, identityBackFile);

      if (totalBytes > maxClientTotalUploadBytes) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          portfolioFiles: "Total upload size too large. Please reduce file size.",
        }));
        setError("Total upload size too large. Please reduce file size.");
        setSuccess("");
        return current;
      }

      return merged;
    });
    setFieldErrors((current) => ({ ...current, portfolioFiles: "" }));
    setError("");
    setSuccess("");
  }

  function updateIdentityFile(side: "front" | "back", file: File | null) {
    const fieldKey = side === "front" ? "identityFrontFile" : "identityBackFile";

    if (!file) {
      if (side === "front") {
        setIdentityFrontFile(null);
      } else {
        setIdentityBackFile(null);
      }
      setFieldErrors((current) => ({ ...current, [fieldKey]: "" }));
      setError("");
      setSuccess("");
      return;
    }

    if (file.size > maxClientFileSizeBytes) {
      setFieldErrors((current) => ({
        ...current,
        [fieldKey]: "Each file must be under 2MB",
      }));
      setError("Each file must be under 2MB");
      setSuccess("");
      return;
    }

    const nextFrontFile = side === "front" ? file : identityFrontFile;
    const nextBackFile = side === "back" ? file : identityBackFile;
    const totalBytes = getTotalUploadBytes(portfolioFiles, nextFrontFile, nextBackFile);

    if (totalBytes > maxClientTotalUploadBytes) {
      setFieldErrors((current) => ({
        ...current,
        [fieldKey]: "Total upload size too large. Please reduce file size.",
      }));
      setError("Total upload size too large. Please reduce file size.");
      setSuccess("");
      return;
    }

    if (side === "front") {
      setIdentityFrontFile(file);
    } else {
      setIdentityBackFile(file);
    }

    setFieldErrors((current) => ({ ...current, [fieldKey]: "" }));
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

    if (portfolioFiles.length === 0) {
      setFieldErrors({ portfolioFiles: "Upload at least one portfolio file." });
      setError("Upload at least one portfolio file.");
      setPending(false);
      return;
    }

    if (portfolioFiles.length > maxPortfolioFiles) {
      setFieldErrors({ portfolioFiles: `Upload up to ${maxPortfolioFiles} portfolio files.` });
      setError(`Upload up to ${maxPortfolioFiles} portfolio files.`);
      setPending(false);
      return;
    }

    const oversizePortfolio = portfolioFiles.find(
      (file) => file.size > maxClientFileSizeBytes,
    );
    if (oversizePortfolio) {
      setFieldErrors({ portfolioFiles: "Each file must be under 2MB" });
      setError("Each file must be under 2MB");
      setPending(false);
      return;
    }

    if (Boolean(identityFrontFile) !== Boolean(identityBackFile)) {
      setFieldErrors({
        identityFrontFile: identityFrontFile ? "" : "Upload both IC files or leave both blank.",
        identityBackFile: identityBackFile ? "" : "Upload both IC files or leave both blank.",
      });
      setError("Upload both IC files or leave both blank.");
      setPending(false);
      return;
    }

    const identityFiles = [identityFrontFile, identityBackFile].filter(
      (file): file is File => Boolean(file),
    );
    const oversizeIdentity = identityFiles.find(
      (file) => file.size > maxClientFileSizeBytes,
    );
    if (oversizeIdentity) {
      setError("Each file must be under 2MB");
      setFieldErrors({
        identityFrontFile:
          identityFrontFile?.size && identityFrontFile.size > maxClientFileSizeBytes
            ? "Each file must be under 2MB"
            : "",
        identityBackFile:
          identityBackFile?.size && identityBackFile.size > maxClientFileSizeBytes
            ? "Each file must be under 2MB"
            : "",
      });
      setPending(false);
      return;
    }

    const totalUploadBytes = getTotalUploadBytes(
      portfolioFiles,
      identityFrontFile,
      identityBackFile,
    );

    if (totalUploadBytes > maxClientTotalUploadBytes) {
      setFieldErrors({
        portfolioFiles: "Total upload size too large. Please reduce file size.",
        identityFrontFile: "Total upload size too large. Please reduce file size.",
        identityBackFile: "Total upload size too large. Please reduce file size.",
      });
      setError("Total upload size too large. Please reduce file size.");
      setPending(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", parsed.data.name);
      formData.append("type", parsed.data.type);
      if (parsed.data.teamSize) {
        formData.append("teamSize", String(parsed.data.teamSize));
      }
      formData.append("category", parsed.data.category);
      formData.append("experience", parsed.data.experience);
      formData.append("portfolioNote", parsed.data.portfolioNote ?? "");
      formData.append("priceAnchor", parsed.data.priceAnchor);
      formData.append("email", parsed.data.email);
      formData.append("whatsappNumber", parsed.data.whatsappNumber);
      for (const [key, value] of Object.entries(parsed.data.confirmations)) {
        formData.append(`confirmations.${key}`, String(value));
      }
      portfolioFiles.forEach((file) => formData.append("portfolioFiles", file));
      if (identityFrontFile) {
        formData.append("identityFrontFile", identityFrontFile);
      }
      if (identityBackFile) {
        formData.append("identityBackFile", identityBackFile);
      }

      const response = await fetch("/api/helpers/applications", {
        method: "POST",
        body: formData,
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
      setPortfolioFiles([]);
      setIdentityFrontFile(null);
      setIdentityBackFile(null);
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
            onChange={(event) => setField("whatsappNumber", event.target.value.replace(/[^\d]/g, ""))}
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
          Upload up to {maxPortfolioFiles} files. Supported: PNG, JPG, JPEG, PDF. Max 2MB per file. Recommended to compress images.
        </p>
        <div className="mt-4">
          <InputShell label="Portfolio Uploads" error={fieldErrors.portfolioFiles}>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              multiple
              onChange={(event) => {
                appendPortfolioFiles(event.target.files);
                event.target.value = "";
              }}
              className={inputClass(fieldErrors.portfolioFiles)}
            />
          </InputShell>
          {portfolioFiles.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {portfolioFiles.map((file, index) => (
                <button
                  key={`${file.name}-${file.lastModified}`}
                  type="button"
                  onClick={() =>
                    setPortfolioFiles((current) =>
                      current.filter((_, fileIndex) => fileIndex !== index),
                    )
                  }
                  className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase"
                >
                  {file.name} ×
                </button>
              ))}
            </div>
          ) : null}
          <p
            className={cn(
              "mt-3 text-xs font-semibold",
              totalUploadMegabytes > 4 ? "text-red" : "text-muted",
            )}
          >
            Uploaded: {totalUploadMegabytes.toFixed(1)} MB / 5 MB
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
              onChange={(event) => updateIdentityFile("front", event.target.files?.[0] ?? null)}
              className={inputClass(fieldErrors.identityFrontFile)}
            />
          </InputShell>
          <InputShell label="IC Back" error={fieldErrors.identityBackFile}>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(event) => updateIdentityFile("back", event.target.files?.[0] ?? null)}
              className={inputClass(fieldErrors.identityBackFile)}
            />
          </InputShell>
        </div>
        <p className="mt-4 text-sm text-muted">
          Max 2MB per file. Recommended to compress images.
        </p>
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

      <button type="submit" disabled={pending} className={buttonStyles({ tone: "purple", size: "lg" })}>
        {pending ? "Submitting..." : "Submit Helper Application"}
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
  portfolioFiles: File[],
  identityFrontFile: File | null,
  identityBackFile: File | null,
) {
  return (
    portfolioFiles.reduce((total, file) => total + file.size, 0) +
    (identityFrontFile?.size ?? 0) +
    (identityBackFile?.size ?? 0)
  );
}

function formatMegabytes(bytes: number) {
  return bytes / (1024 * 1024);
}
