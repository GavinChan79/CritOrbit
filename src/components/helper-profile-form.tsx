"use client";

import { useState } from "react";
import { categoryOptions } from "@/lib/constants";
import { buttonStyles, Card, InputShell } from "@/components/ui";

type HelperProfileFormValues = {
  name: string;
  category: string;
  shortBio: string;
  portfolioNote: string;
  whatsappNumber: string;
  responseTime: string;
  deliveryTime: string;
};

export function HelperProfileForm(props: {
  initialValues: HelperProfileFormValues;
}) {
  const [values, setValues] = useState(props.initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  function updateValue<Key extends keyof HelperProfileFormValues>(
    key: Key,
    value: HelperProfileFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/helper/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: json.error ?? "Profile update failed.",
        });
        return;
      }

      setStatus({
        tone: "success",
        message: "Profile updated successfully.",
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Profile update failed.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="bg-white">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <InputShell label="Display Name">
            <input
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>
          <InputShell label="Category">
            <select
              value={values.category}
              onChange={(event) => updateValue("category", event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </InputShell>
        </div>

        <InputShell label="Short Bio" hint="Visible as your main helper introduction.">
          <textarea
            value={values.shortBio}
            onChange={(event) => updateValue("shortBio", event.target.value)}
            rows={5}
            className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
          />
        </InputShell>

        <InputShell label="Portfolio Note" hint="Short trust note for future public profile modules.">
          <textarea
            value={values.portfolioNote}
            onChange={(event) => updateValue("portfolioNote", event.target.value)}
            rows={4}
            className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
          />
        </InputShell>

        <div className="grid gap-5 md:grid-cols-3">
          <InputShell label="WhatsApp Number">
            <input
              value={values.whatsappNumber}
              onChange={(event) => updateValue("whatsappNumber", event.target.value.replace(/[^\d]/g, ""))}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>
          <InputShell label="Response Time">
            <input
              value={values.responseTime}
              onChange={(event) => updateValue("responseTime", event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>
          <InputShell label="Delivery Time">
            <input
              value={values.deliveryTime}
              onChange={(event) => updateValue("deliveryTime", event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button
            type="submit"
            disabled={isSaving}
            className={buttonStyles({ tone: "purple", size: "md" })}
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
          {status ? (
            <p className={status.tone === "success" ? "text-sm font-semibold text-green" : "text-sm font-semibold text-[#E24B4A]"}>
              {status.message}
            </p>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
