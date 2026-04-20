"use client";

import { useState } from "react";
import { buttonStyles, InputShell } from "@/components/ui";
import {
  categoryOptions,
  helperAgreementItems,
  helperTypeOptions,
} from "@/lib/constants";
import {
  maxApplicationFileSizeBytes,
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
    email: "",
    whatsappNumber: "",
    confirmations: defaultAgreements,
  });
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [identityFrontFile, setIdentityFrontFile] = useState<File | null>(null);
  const [identityBackFile, setIdentityBackFile] = useState<File | null>(null);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
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
      (file) => file.size > maxApplicationFileSizeBytes,
    );
    if (oversizePortfolio) {
      setFieldErrors({ portfolioFiles: `${oversizePortfolio.name} exceeds 10MB.` });
      setError(`${oversizePortfolio.name} exceeds 10MB.`);
      setPending(false);
      return;
    }

    if (!identityFrontFile || !identityBackFile) {
      setFieldErrors({
        identityFrontFile: identityFrontFile ? "" : "IC Front is required.",
        identityBackFile: identityBackFile ? "" : "IC Back is required.",
      });
      setError("Identity certification files are required.");
      setPending(false);
      return;
    }

    const identityFiles = [identityFrontFile, identityBackFile];
    const oversizeIdentity = identityFiles.find(
      (file) => file.size > maxApplicationFileSizeBytes,
    );
    if (oversizeIdentity) {
      setError(`${oversizeIdentity.name} exceeds 10MB.`);
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
      formData.append("email", parsed.data.email);
      formData.append("whatsappNumber", parsed.data.whatsappNumber);
      for (const [key, value] of Object.entries(parsed.data.confirmations)) {
        formData.append(`confirmations.${key}`, String(value));
      }
      portfolioFiles.forEach((file) => formData.append("portfolioFiles", file));
      formData.append("identityFrontFile", identityFrontFile);
      formData.append("identityBackFile", identityBackFile);

      const response = await fetch("/api/helpers/applications", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Could not submit your application.");
        setPending(false);
        return;
      }

      setSuccess(json.message);
      setForm({
        name: "",
        type: "INDIVIDUAL",
        teamSize: "",
        category: "INTERIOR_DESIGN",
        experience: "",
        portfolioNote: "",
        email: "",
        whatsappNumber: "",
        confirmations: defaultAgreements,
      });
      setPortfolioFiles([]);
      setIdentityFrontFile(null);
      setIdentityBackFile(null);
    } catch {
      setError("Could not submit your application.");
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
          <select
            value={form.type}
            onChange={(event) => {
              const value = event.target.value;
              setField("type", value);
              if (value === "INDIVIDUAL") {
                setField("teamSize", "");
              }
            }}
            className={inputClass(fieldErrors.type)}
          >
            {helperTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label === "Studio" ? "Team / Studio" : option.label}
              </option>
            ))}
          </select>
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
          <select
            value={form.category}
            onChange={(event) => setField("category", event.target.value)}
            className={inputClass(fieldErrors.category)}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
        <textarea
          rows={4}
          value={form.experience}
          onChange={(event) => setField("experience", event.target.value)}
          className={inputClass(fieldErrors.experience)}
        />
      </InputShell>

      <InputShell label="Portfolio (link or text)" error={fieldErrors.portfolioNote}>
        <textarea
          rows={4}
          value={form.portfolioNote}
          onChange={(event) => setField("portfolioNote", event.target.value)}
          className={inputClass(fieldErrors.portfolioNote)}
        />
      </InputShell>

      <div className="rounded-[24px] border-[3px] border-line bg-cream p-5">
        <div className="display-font text-2xl font-black">Portfolio Files</div>
        <p className="mt-2 text-sm text-muted">
          Upload up to {maxPortfolioFiles} files. Supported: PNG, JPG, JPEG, PDF. Max 10MB each.
        </p>
        <div className="mt-4">
          <InputShell label="Portfolio Uploads" error={fieldErrors.portfolioFiles}>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              multiple
              onChange={(event) => setPortfolioFiles(Array.from(event.target.files ?? []).slice(0, maxPortfolioFiles))}
              className={inputClass(fieldErrors.portfolioFiles)}
            />
          </InputShell>
          {portfolioFiles.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {portfolioFiles.map((file) => (
                <span
                  key={`${file.name}-${file.lastModified}`}
                  className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase"
                >
                  {file.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[24px] border-[3px] border-line bg-cream p-5">
        <div className="display-font text-2xl font-black">Identity Certification</div>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <InputShell label="IC Front" error={fieldErrors.identityFrontFile}>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(event) => setIdentityFrontFile(event.target.files?.[0] ?? null)}
              className={inputClass(fieldErrors.identityFrontFile)}
            />
          </InputShell>
          <InputShell label="IC Back" error={fieldErrors.identityBackFile}>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(event) => setIdentityBackFile(event.target.files?.[0] ?? null)}
              className={inputClass(fieldErrors.identityBackFile)}
            />
          </InputShell>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted">
          To protect both users and helpers and to maintain a reliable system, we will only use the information for internal verification purposes, and it will not be shared externally.
        </p>
      </div>

      <div className="rounded-[24px] border-[3px] border-line bg-cream p-5">
        <div className="display-font text-2xl font-black">Required Agreement</div>
        <div className="mt-4 space-y-3">
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
