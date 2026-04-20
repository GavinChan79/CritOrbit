"use client";

import { useState } from "react";
import { buttonStyles, InputShell } from "@/components/ui";
import {
  categoryOptions,
  helperAgreementItems,
  helperTypeOptions,
} from "@/lib/constants";
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

    try {
      const response = await fetch("/api/helpers/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
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
