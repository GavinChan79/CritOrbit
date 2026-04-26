"use client";

import { useMemo, useState } from "react";
import {
  categoryOptions,
  getDefaultTaskTypeForCategory,
  getTaskTypeOptionsForCategory,
  helperDeliveryTimeOptions,
  helperPriceAnchorOptions,
  helperResponseTimeOptions,
  helperSpecialtyPresetOptions,
  maxHelperSpecialties,
} from "@/lib/constants";
import { buttonStyles, Card, InputShell } from "@/components/ui-primitives";
import { slugifySpecialtyLabel, type HelperSpecialty } from "@/lib/helpers";

type HelperProfileFormValues = {
  name: string;
  category: string;
  shortBio: string;
  portfolioNote: string;
  priceAnchor: string;
  publicPriceAnchor: string;
  priceLockedByAdmin: boolean;
  whatsappNumber: string;
  responseTime: string;
  deliveryTime: string;
  specialties: HelperSpecialty[];
};

const customSpecialtyValue = "__custom__";

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

  function updateSpecialty(index: number, patch: Partial<HelperSpecialty>) {
    setValues((current) => ({
      ...current,
      specialties: current.specialties.map((specialty, specialtyIndex) =>
        specialtyIndex === index ? { ...specialty, ...patch } : specialty,
      ),
    }));
    setStatus(null);
  }

  function addSpecialty() {
    if (values.specialties.length >= maxHelperSpecialties) {
      setStatus({
        tone: "error",
        message: `You can add up to ${maxHelperSpecialties} specialties.`,
      });
      return;
    }

    setValues((current) => ({
      ...current,
      specialties: [
        ...current.specialties,
        {
          code: "",
          label: "",
          taskTypes: [getDefaultTaskTypeForCategory(current.category)],
        },
      ],
    }));
    setStatus(null);
  }

  function removeSpecialty(index: number) {
    setValues((current) => ({
      ...current,
      specialties:
        current.specialties.length === 1
          ? [
              {
                code: "",
                label: "",
                taskTypes: [getDefaultTaskTypeForCategory(current.category)],
              },
            ]
          : current.specialties.filter((_, specialtyIndex) => specialtyIndex !== index),
    }));
    setStatus(null);
  }

  function applySpecialtyPreset(index: number, presetValue: string) {
    if (presetValue === customSpecialtyValue) {
      setValues((current) => ({
        ...current,
        specialties: current.specialties.map((specialty, specialtyIndex) =>
          specialtyIndex === index
            ? {
                ...specialty,
                label: specialty.label || "",
                code: specialty.label ? slugifySpecialtyLabel(specialty.label) : "",
              }
            : specialty,
        ),
      }));
      setStatus(null);
      return;
    }

    const preset = helperSpecialtyPresetOptions.find((item) => item.value === presetValue);
    if (!preset) {
      return;
    }

    const duplicate = values.specialties.some(
      (specialty, specialtyIndex) =>
        specialtyIndex !== index && specialty.code.toLowerCase() === preset.value,
    );

    if (duplicate) {
      setStatus({
        tone: "error",
        message: "That specialty is already added.",
      });
      return;
    }

    updateSpecialty(index, {
      code: preset.value,
      label: preset.label,
      taskTypes: [...preset.defaultTaskTypes],
    });
  }

  function updateCustomSpecialtyLabel(index: number, label: string) {
    updateSpecialty(index, {
      label,
      code: slugifySpecialtyLabel(label),
    });
  }

  function toggleTaskType(index: number, taskType: string) {
    setValues((current) => ({
      ...current,
      specialties: current.specialties.map((specialty, specialtyIndex) => {
        if (specialtyIndex !== index) {
          return specialty;
        }

        const exists = specialty.taskTypes.includes(taskType);
        const nextTaskTypes = exists
          ? specialty.taskTypes.filter((value) => value !== taskType)
          : [...specialty.taskTypes, taskType];

        return {
          ...specialty,
          taskTypes: nextTaskTypes.length
            ? nextTaskTypes
            : [getDefaultTaskTypeForCategory(current.category)],
        };
      }),
    }));
    setStatus(null);
  }

  const selectClass =
    "w-full appearance-none rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 pr-11 text-ink outline-none";
  const taskTypeOptions = getTaskTypeOptionsForCategory(values.category);

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
              className={selectClass}
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
          <InputShell
            label="Your Starting Price"
            hint={
              values.priceLockedByAdmin
                ? `Admin has locked the public starting price at ${values.publicPriceAnchor.replace("_PLUS", "+").replace("_", " ")}. Your update will be stored for review.`
                : "This is your submitted starting price. Admin may still review and adjust the public price."
            }
          >
            <select
              value={values.priceAnchor}
              onChange={(event) => updateValue("priceAnchor", event.target.value)}
              className={selectClass}
            >
              {helperPriceAnchorOptions
                .filter((option) => option.value !== "BELOW_RM100")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </InputShell>
          <InputShell label="WhatsApp Number">
            <input
              value={values.whatsappNumber}
              onChange={(event) => updateValue("whatsappNumber", event.target.value.replace(/[^\d]/g, ""))}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>
          <InputShell label="Response Time">
            <select
              value={values.responseTime}
              onChange={(event) => updateValue("responseTime", event.target.value)}
              className={selectClass}
            >
              {helperResponseTimeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </InputShell>
          <InputShell label="Delivery Time">
            <select
              value={values.deliveryTime}
              onChange={(event) => updateValue("deliveryTime", event.target.value)}
              className={selectClass}
            >
              {helperDeliveryTimeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </InputShell>
        </div>

        <div className="space-y-4 rounded-[22px] border-[3px] border-line bg-cream p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="display-font text-2xl font-black">Specialties / Tags</div>
              <p className="mt-2 text-sm text-muted">
                Pick up to {maxHelperSpecialties} specialties so students see your strongest capabilities clearly.
              </p>
            </div>
            <button
              type="button"
              onClick={addSpecialty}
              className={buttonStyles({ tone: "yellow", size: "sm" })}
            >
              Add Specialty
            </button>
          </div>

          {values.specialties.map((specialty, index) => {
            const availablePresets = helperSpecialtyPresetOptions.filter(
              (preset) =>
                (preset.categories as readonly string[]).includes(values.category) &&
                !values.specialties.some(
                  (currentSpecialty, specialtyIndex) =>
                    specialtyIndex !== index &&
                    currentSpecialty.code.toLowerCase() === preset.value,
                ),
            );
            const matchedPreset = helperSpecialtyPresetOptions.find(
              (preset) => preset.value === specialty.code,
            );
            const selectedPresetValue = matchedPreset?.value ?? customSpecialtyValue;

            return (
              <div
                key={`${specialty.code || "specialty"}-${index}`}
                className="rounded-[18px] border-[3px] border-line bg-white p-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <InputShell label="Specialty Preset">
                    <select
                      value={selectedPresetValue}
                      onChange={(event) => applySpecialtyPreset(index, event.target.value)}
                      className={selectClass}
                    >
                      {matchedPreset ? (
                        <option value={matchedPreset.value}>{matchedPreset.label}</option>
                      ) : null}
                      {availablePresets.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                      <option value={customSpecialtyValue}>Custom Specialty</option>
                    </select>
                  </InputShell>

                  <InputShell label="Label">
                    <input
                      value={specialty.label}
                      onChange={(event) =>
                        matchedPreset ? undefined : updateCustomSpecialtyLabel(index, event.target.value)
                      }
                      disabled={Boolean(matchedPreset)}
                      className="w-full rounded-[16px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
                      placeholder={matchedPreset ? matchedPreset.label : "Financial Modeling"}
                    />
                  </InputShell>
                </div>

                <div className="mt-3 rounded-[16px] border-[3px] border-line bg-paper px-4 py-3 text-sm text-muted">
                  <span className="font-black text-ink">Code:</span>{" "}
                  {specialty.code || "Will be generated automatically"}
                </div>

                <div className="mt-4">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                    Task Types
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {taskTypeOptions.map((option) => {
                      const active = specialty.taskTypes.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleTaskType(index, option.value)}
                          className={
                            active
                              ? "retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white"
                              : "retro-pill bg-white px-3 py-1 text-xs font-black uppercase text-ink"
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSpecialty(index)}
                  className={`mt-4 ${buttonStyles({ tone: "ink", size: "sm" })}`}
                >
                  Remove Specialty
                </button>
              </div>
            );
          })}
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
