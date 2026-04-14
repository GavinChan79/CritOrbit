"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles, Card, InputShell } from "@/components/ui";
import {
  categoryOptions,
  getDefaultTaskTypeForCategory,
  getTaskTypeOptionsForCategory,
} from "@/lib/constants";
import { getCategoryLabel, type HelperSpecialty } from "@/lib/helpers";

type HelperRecord = {
  id: string;
  name: string;
  category: string;
  shortBio: string;
  displayOrder: number;
  isActive: boolean;
  specialties: HelperSpecialty[];
};

type HelperFormState = {
  name: string;
  category: string;
  shortBio: string;
  displayOrder: string;
  isActive: boolean;
  specialties: HelperSpecialty[];
};

const emptySpecialty = (): HelperSpecialty => ({
  code: "",
  label: "",
  taskTypes: [getDefaultTaskTypeForCategory("INTERIOR_DESIGN")],
});

const emptyForm = (): HelperFormState => ({
  name: "",
  category: "INTERIOR_DESIGN",
  shortBio: "",
  displayOrder: "0",
  isActive: true,
  specialties: [emptySpecialty()],
});

export function HelperAdminManager({ helpers }: { helpers: HelperRecord[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HelperFormState>(emptyForm());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();
  const taskTypeOptions = getTaskTypeOptionsForCategory(form.category);

  function loadHelper(helper: HelperRecord) {
    setEditingId(helper.id);
    setError("");
    setSuccess("");
    setForm({
      name: helper.name,
      category: helper.category,
      shortBio: helper.shortBio,
      displayOrder: String(helper.displayOrder),
      isActive: helper.isActive,
      specialties: helper.specialties.length ? helper.specialties : [emptySpecialty()],
    });
  }

  function resetForm() {
    setEditingId(null);
    setError("");
    setSuccess("");
    setForm(emptyForm());
  }

  function updateSpecialty(index: number, patch: Partial<HelperSpecialty>) {
    setForm((current) => ({
      ...current,
      specialties: current.specialties.map((specialty, specialtyIndex) =>
        specialtyIndex === index ? { ...specialty, ...patch } : specialty,
      ),
    }));
  }

  function toggleTaskType(index: number, taskType: string) {
    setForm((current) => ({
      ...current,
      specialties: current.specialties.map((specialty, specialtyIndex) => {
        if (specialtyIndex !== index) {
          return specialty;
        }

        const exists = specialty.taskTypes.includes(taskType);

        return {
          ...specialty,
          taskTypes: exists
            ? specialty.taskTypes.filter((value) => value !== taskType)
            : [...specialty.taskTypes, taskType],
        };
      }),
    }));
  }

  function addSpecialty() {
    setForm((current) => ({
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
  }

  function removeSpecialty(index: number) {
    setForm((current) => ({
      ...current,
      specialties:
        current.specialties.length === 1
          ? [emptySpecialty()]
          : current.specialties.filter((_, specialtyIndex) => specialtyIndex !== index),
    }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      displayOrder: Number(form.displayOrder),
      specialties: form.specialties.map((specialty) => ({
        code: specialty.code.trim(),
        label: specialty.label.trim(),
        taskTypes: specialty.taskTypes,
      })),
    };

    startTransition(async () => {
      const response = await fetch(
        editingId ? `/api/admin/helpers/${editingId}` : "/api/admin/helpers",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Could not save helper.");
        return;
      }

      setSuccess(editingId ? "Helper updated." : "Helper created.");
      if (!editingId) {
        setForm(emptyForm());
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        {helpers.map((helper) => (
          <Card key={helper.id} className="bg-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="display-font text-2xl font-black">{helper.name}</div>
                <p className="mt-2 text-sm text-muted">
                  {getCategoryLabel(helper.category)} ·
                  order {helper.displayOrder} · {helper.isActive ? "Active" : "Inactive"}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">{helper.shortBio}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {helper.specialties.map((specialty) => (
                    <span key={specialty.code} className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                      {specialty.label}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => loadHelper(helper)}
                className={buttonStyles({ tone: "yellow", size: "sm" })}
              >
                Edit
              </button>
            </div>
          </Card>
        ))}
      </div>

      <form onSubmit={submit} className="retro-card h-fit space-y-5 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="display-font text-3xl font-black">
              {editingId ? "Edit helper" : "Create helper"}
            </div>
            <p className="mt-2 text-sm text-muted">
              Keep this lean: core info, specialties, ordering, and active state.
            </p>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className={buttonStyles({ tone: "ink", size: "sm" })}
            >
              New
            </button>
          ) : null}
        </div>

        <InputShell label="Helper Name">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
          />
        </InputShell>

        <InputShell label="Category">
          <select
            value={form.category}
            onChange={(event) =>
              setForm((current) => {
                const nextCategory = event.target.value;
                const allowedTaskTypes = new Set<string>(
                  getTaskTypeOptionsForCategory(nextCategory).map((option) => option.value),
                );

                return {
                  ...current,
                  category: nextCategory,
                  specialties: current.specialties.map((specialty) => {
                    const nextTaskTypes = specialty.taskTypes.filter((taskType) =>
                      allowedTaskTypes.has(taskType),
                    );

                    return {
                      ...specialty,
                      taskTypes: nextTaskTypes.length
                        ? nextTaskTypes
                        : [getDefaultTaskTypeForCategory(nextCategory)],
                    };
                  }),
                };
              })
            }
            className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </InputShell>

        <InputShell label="Short Bio">
          <textarea
            rows={4}
            value={form.shortBio}
            onChange={(event) =>
              setForm((current) => ({ ...current, shortBio: event.target.value }))
            }
            className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
          />
        </InputShell>

        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Display Order">
            <input
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayOrder: event.target.value }))
              }
              className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
            />
          </InputShell>

          <label className="flex items-center gap-3 rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 font-semibold">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Active helper
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-black uppercase tracking-[0.14em] text-muted">Specialties</div>
            <button
              type="button"
              onClick={addSpecialty}
              className={buttonStyles({ tone: "yellow", size: "sm" })}
            >
              Add specialty
            </button>
          </div>

          {form.specialties.map((specialty, index) => (
            <div key={`${specialty.code}-${index}`} className="rounded-[20px] border-[3px] border-line bg-cream p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InputShell label="Code">
                  <input
                    value={specialty.code}
                    onChange={(event) => updateSpecialty(index, { code: event.target.value })}
                    className="w-full rounded-[16px] border-[3px] border-line bg-white px-4 py-3 outline-none"
                    placeholder="rendering"
                  />
                </InputShell>
                <InputShell label="Label">
                  <input
                    value={specialty.label}
                    onChange={(event) => updateSpecialty(index, { label: event.target.value })}
                    className="w-full rounded-[16px] border-[3px] border-line bg-white px-4 py-3 outline-none"
                    placeholder="Rendering"
                  />
                </InputShell>
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
                        className={`retro-pill px-3 py-1 text-xs font-black uppercase ${
                          active ? "bg-purple text-white" : "bg-white text-ink"
                        }`}
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
                Remove specialty
              </button>
            </div>
          ))}
        </div>

        {error ? <p className="text-sm font-bold text-red">{error}</p> : null}
        {success ? <p className="text-sm font-bold text-green">{success}</p> : null}

        <button type="submit" disabled={pending} className={buttonStyles({ tone: "purple", size: "md" })}>
          {pending ? "Saving..." : editingId ? "Save helper" : "Create helper"}
        </button>
      </form>
    </div>
  );
}
