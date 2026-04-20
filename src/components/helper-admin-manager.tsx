"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ZodError } from "zod";
import { buttonStyles, Card, EmptyState, InputShell } from "@/components/ui";
import {
  categoryOptions,
  getDefaultTaskTypeForCategory,
  helperPriceTierOptions,
  helperStatusOptions,
  helperTypeOptions,
  getTaskTypeOptionsForCategory,
} from "@/lib/constants";
import {
  getCategoryLabel,
  getHelperStatusLabel,
  getHelperTypeLabel,
  type HelperPortfolioItem,
  type HelperSpecialty,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { helperPortfolioSchema, helperSchema } from "@/lib/validators";

type HelperRecord = {
  id: string;
  name: string;
  type: string;
  teamSize: number | null;
  isVerified: boolean;
  projectsCompleted: number;
  impressionCount: number;
  responseTime: string | null;
  deliveryTime: string | null;
  repeatClients: number | null;
  priceTier: string;
  clickCount: number;
  selectionCount: number;
  status: string;
  category: string;
  shortBio: string;
  portfolioNote: string | null;
  email: string | null;
  whatsappNumber: string | null;
  agreedToTerms: boolean;
  agreedAt: string | null;
  displayOrder: number;
  isActive: boolean;
  specialties: HelperSpecialty[];
  portfolioItems: HelperPortfolioItem[];
};

type HelperFormState = {
  name: string;
  type: string;
  teamSize: string;
  isVerified: boolean;
  projectsCompleted: string;
  responseTime: string;
  deliveryTime: string;
  repeatClients: string;
  priceTier: string;
  status: string;
  category: string;
  shortBio: string;
  portfolioNote: string;
  email: string;
  whatsappNumber: string;
  displayOrder: string;
  isActive: boolean;
  specialties: HelperSpecialty[];
};

type PortfolioFormState = {
  title: string;
  imageUrl: string;
  description: string;
  externalLink: string;
  displayOrder: string;
};

type FieldErrors = Record<string, string>;

const emptySpecialty = (category = "INTERIOR_DESIGN"): HelperSpecialty => ({
  code: "",
  label: "",
  taskTypes: [getDefaultTaskTypeForCategory(category)],
});

const emptyForm = (): HelperFormState => ({
  name: "",
  type: "INDIVIDUAL",
  teamSize: "",
  isVerified: false,
  projectsCompleted: "0",
  responseTime: "",
  deliveryTime: "",
  repeatClients: "",
  priceTier: "STANDARD",
  status: "ACTIVE",
  category: "INTERIOR_DESIGN",
  shortBio: "",
  portfolioNote: "",
  email: "",
  whatsappNumber: "",
  displayOrder: "0",
  isActive: true,
  specialties: [emptySpecialty()],
});

const emptyPortfolioForm = (): PortfolioFormState => ({
  title: "",
  imageUrl: "",
  description: "",
  externalLink: "",
  displayOrder: "0",
});

export function HelperAdminManager({ helpers }: { helpers: HelperRecord[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [form, setForm] = useState<HelperFormState>(emptyForm());
  const [portfolioForm, setPortfolioForm] = useState<PortfolioFormState>(emptyPortfolioForm());
  const [helperErrors, setHelperErrors] = useState<FieldErrors>({});
  const [portfolioErrors, setPortfolioErrors] = useState<FieldErrors>({});
  const [helperError, setHelperError] = useState("");
  const [portfolioError, setPortfolioError] = useState("");
  const [helperSuccess, setHelperSuccess] = useState("");
  const [portfolioSuccess, setPortfolioSuccess] = useState("");
  const [savingHelper, setSavingHelper] = useState(false);
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<string | null>(null);

  const taskTypeOptions = getTaskTypeOptionsForCategory(form.category);
  const editingHelper = useMemo(
    () => helpers.find((helper) => helper.id === editingId) ?? null,
    [editingId, helpers],
  );
  const sortedHelpers = useMemo(
    () =>
      [...helpers].sort((left, right) => {
        if (left.displayOrder !== right.displayOrder) {
          return left.displayOrder - right.displayOrder;
        }
        return left.name.localeCompare(right.name);
      }),
    [helpers],
  );

  useEffect(() => {
    if (helpers.length === 0) {
      setEditingId(null);
    }
  }, [helpers.length]);

  function scrollFormIntoView() {
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function startCreate() {
    setEditingId(null);
    setEditingPortfolioId(null);
    setHelperErrors({});
    setPortfolioErrors({});
    setHelperError("");
    setPortfolioError("");
    setHelperSuccess("");
    setPortfolioSuccess("");
    setForm(emptyForm());
    setPortfolioForm(emptyPortfolioForm());
    scrollFormIntoView();
  }

  function loadHelper(helper: HelperRecord) {
    setEditingId(helper.id);
    setEditingPortfolioId(null);
    setHelperErrors({});
    setPortfolioErrors({});
    setHelperError("");
    setPortfolioError("");
    setHelperSuccess("");
    setPortfolioSuccess("");
    setForm({
      name: helper.name,
      type: helper.type,
      teamSize: helper.teamSize ? String(helper.teamSize) : "",
      isVerified: helper.isVerified,
      projectsCompleted: String(helper.projectsCompleted),
      responseTime: helper.responseTime ?? "",
      deliveryTime: helper.deliveryTime ?? "",
      repeatClients: helper.repeatClients ? String(helper.repeatClients) : "",
      priceTier: helper.priceTier,
      status: helper.status,
      category: helper.category,
      shortBio: helper.shortBio,
      portfolioNote: helper.portfolioNote ?? "",
      email: helper.email ?? "",
      whatsappNumber: helper.whatsappNumber ?? "",
      displayOrder: String(helper.displayOrder),
      isActive: helper.isActive,
      specialties: helper.specialties.length
        ? helper.specialties.map((specialty) => ({
            ...specialty,
            taskTypes: [...specialty.taskTypes],
          }))
        : [emptySpecialty(helper.category)],
    });
    setPortfolioForm(emptyPortfolioForm());
    scrollFormIntoView();
  }

  function cancelEdit() {
    startCreate();
  }

  function updateField<K extends keyof HelperFormState>(key: K, value: HelperFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setHelperErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setHelperError("");
    setHelperSuccess("");
  }

  function updateSpecialty(index: number, patch: Partial<HelperSpecialty>) {
    setForm((current) => ({
      ...current,
      specialties: current.specialties.map((specialty, specialtyIndex) =>
        specialtyIndex === index ? { ...specialty, ...patch } : specialty,
      ),
    }));
    setHelperError("");
    setHelperSuccess("");
  }

  function toggleTaskType(index: number, taskType: string) {
    setForm((current) => ({
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
    setHelperError("");
    setHelperSuccess("");
  }

  function addSpecialty() {
    setForm((current) => ({
      ...current,
      specialties: [...current.specialties, emptySpecialty(current.category)],
    }));
    setHelperError("");
    setHelperSuccess("");
  }

  function removeSpecialty(index: number) {
    setForm((current) => ({
      ...current,
      specialties:
        current.specialties.length === 1
          ? [emptySpecialty(current.category)]
          : current.specialties.filter((_, specialtyIndex) => specialtyIndex !== index),
    }));
    setHelperError("");
    setHelperSuccess("");
  }

  function startPortfolioEdit(item: HelperPortfolioItem) {
    setEditingPortfolioId(item.id);
    setPortfolioErrors({});
    setPortfolioError("");
    setPortfolioSuccess("");
    setPortfolioForm({
      title: item.title,
      imageUrl: item.imageUrl,
      description: item.description ?? "",
      externalLink: item.externalLink ?? "",
      displayOrder: String(item.displayOrder),
    });
    scrollFormIntoView();
  }

  function resetPortfolioForm() {
    setEditingPortfolioId(null);
    setPortfolioErrors({});
    setPortfolioError("");
    setPortfolioSuccess("");
    setPortfolioForm(emptyPortfolioForm());
  }

  function updatePortfolioField<K extends keyof PortfolioFormState>(
    key: K,
    value: PortfolioFormState[K],
  ) {
    setPortfolioForm((current) => ({ ...current, [key]: value }));
    setPortfolioErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setPortfolioError("");
    setPortfolioSuccess("");
  }

  function mapZodErrors(error: ZodError): FieldErrors {
    return error.issues.reduce<FieldErrors>((accumulator, issue) => {
      const key = issue.path.join(".") || "form";
      if (!accumulator[key]) {
        accumulator[key] = issue.message;
      }
      return accumulator;
    }, {});
  }

  async function submitHelper(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      ...form,
      name: form.name.trim(),
      shortBio: form.shortBio.trim(),
      portfolioNote: form.portfolioNote.trim() || undefined,
      email: form.email.trim() ? form.email.trim().toLowerCase() : undefined,
      whatsappNumber: form.whatsappNumber.trim() || undefined,
      teamSize: form.type === "TEAM" && form.teamSize ? Number(form.teamSize) : null,
      projectsCompleted: Number(form.projectsCompleted || 0),
      responseTime: form.responseTime.trim() || undefined,
      deliveryTime: form.deliveryTime.trim() || undefined,
      repeatClients: form.repeatClients ? Number(form.repeatClients) : null,
      priceTier:
        form.priceTier || (form.type === "TEAM" ? "PREMIUM" : "STANDARD"),
      displayOrder: Number(form.displayOrder),
      specialties: form.specialties.map((specialty) => ({
        code: specialty.code.trim(),
        label: specialty.label.trim(),
        taskTypes: specialty.taskTypes,
      })),
    };

    const parsed = helperSchema.safeParse(payload);
    if (!parsed.success) {
      setHelperErrors(mapZodErrors(parsed.error));
      setHelperError(parsed.error.issues[0]?.message ?? "Please review the helper form.");
      return;
    }

    setSavingHelper(true);
    setHelperErrors({});
    setHelperError("");
    setHelperSuccess("");

    try {
      const response = await fetch(
        editingId ? `/api/admin/helpers/${editingId}` : "/api/admin/helpers",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );

      const json = await response.json();

      if (!response.ok) {
        setHelperError(json.error ?? "Could not save helper.");
        return;
      }

      if (!editingId && json.helper?.id) {
        setEditingId(json.helper.id);
      }

      setHelperSuccess(
        editingId
          ? "Helper updated successfully."
          : "Helper created successfully. You can add portfolio items below.",
      );
      router.refresh();
    } catch {
      setHelperError("Could not save helper.");
    } finally {
      setSavingHelper(false);
    }
  }

  async function submitPortfolio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) {
      setPortfolioError("Create or save the helper first before adding portfolio items.");
      return;
    }

    const payload = {
      title: portfolioForm.title.trim(),
      imageUrl: portfolioForm.imageUrl.trim(),
      description: portfolioForm.description.trim(),
      externalLink: portfolioForm.externalLink.trim(),
      displayOrder: Number(portfolioForm.displayOrder),
    };

    const parsed = helperPortfolioSchema.safeParse(payload);
    if (!parsed.success) {
      setPortfolioErrors(mapZodErrors(parsed.error));
      setPortfolioError(parsed.error.issues[0]?.message ?? "Please review the portfolio form.");
      return;
    }

    setSavingPortfolio(true);
    setPortfolioErrors({});
    setPortfolioError("");
    setPortfolioSuccess("");

    try {
      const response = await fetch(
        editingPortfolioId
          ? `/api/admin/helpers/${editingId}/portfolio/${editingPortfolioId}`
          : `/api/admin/helpers/${editingId}/portfolio`,
        {
          method: editingPortfolioId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );

      const json = await response.json();

      if (!response.ok) {
        setPortfolioError(json.error ?? "Could not save portfolio item.");
        return;
      }

      setPortfolioSuccess(
        editingPortfolioId ? "Portfolio item updated." : "Portfolio item added.",
      );
      resetPortfolioForm();
      router.refresh();
    } catch {
      setPortfolioError("Could not save portfolio item.");
    } finally {
      setSavingPortfolio(false);
    }
  }

  async function deletePortfolioItem(item: HelperPortfolioItem) {
    if (!editingId || deletingPortfolioId) {
      return;
    }

    const confirmed = window.confirm(`Delete portfolio item "${item.title}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingPortfolioId(item.id);
    setPortfolioError("");
    setPortfolioSuccess("");

    try {
      const response = await fetch(
        `/api/admin/helpers/${editingId}/portfolio/${item.id}`,
        { method: "DELETE" },
      );
      const json = await response.json();

      if (!response.ok) {
        setPortfolioError(json.error ?? "Could not delete portfolio item.");
        return;
      }

      if (editingPortfolioId === item.id) {
        resetPortfolioForm();
      }
      setPortfolioSuccess("Portfolio item deleted.");
      router.refresh();
    } catch {
      setPortfolioError("Could not delete portfolio item.");
    } finally {
      setDeletingPortfolioId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border-[3px] border-line bg-white p-5 shadow-[6px_6px_0_var(--line)] md:flex-row md:items-center md:justify-between">
        <div>
          <div className="display-font text-3xl font-black">Helper roster controls</div>
          <p className="mt-2 text-sm text-muted">
            Add helpers, update roster details, and manage portfolio examples from one admin workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className={buttonStyles({ tone: "purple", size: "md" })}
        >
          Add Helper
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {sortedHelpers.length === 0 ? (
            <EmptyState
              title="No helpers yet"
              description="Create the first helper so the public matching flow has someone to show."
              action={
                <button
                  type="button"
                  onClick={startCreate}
                  className={buttonStyles({ tone: "purple", size: "md" })}
                >
                  Add First Helper
                </button>
              }
            />
          ) : (
            sortedHelpers.map((helper) => {
              const isEditing = helper.id === editingId;

              return (
                <Card
                  key={helper.id}
                  className={cn("bg-white", isEditing && "ring-4 ring-purple/20")}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="display-font text-2xl font-black">{helper.name}</div>
                        <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">
                          {getHelperTypeLabel(helper.type)}
                        </span>
                        <span
                          className={cn(
                            "retro-pill px-3 py-1 text-xs font-black uppercase",
                            helper.isActive ? "bg-green text-white" : "bg-ink text-white",
                          )}
                        >
                          {helper.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                          {getHelperStatusLabel(helper.status)}
                        </span>
                        {helper.isVerified ? (
                          <span className="retro-pill bg-blue px-3 py-1 text-xs font-black uppercase text-white">
                            Verified
                          </span>
                        ) : null}
                        {isEditing ? (
                          <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">
                            Editing
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {getCategoryLabel(helper.category)}
                        {helper.teamSize ? ` · ${helper.teamSize} people` : ""}
                        {` · Sort order ${helper.displayOrder} · `}
                        {helper.portfolioItems.length} portfolio item
                        {helper.portfolioItems.length === 1 ? "" : "s"}
                      </p>
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-muted">
                        {helper.projectsCompleted}+ projects · {helper.priceTier} · {helper.impressionCount} impressions · {helper.clickCount} clicks · {helper.selectionCount} selections
                      </p>
                      <p className="mt-2 text-sm leading-7 text-muted">{helper.shortBio}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {helper.specialties.map((specialty) => (
                          <span
                            key={`${helper.id}-${specialty.code}`}
                            className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase"
                          >
                            {specialty.label}
                          </span>
                        ))}
                      </div>
                      {helper.portfolioItems.length ? (
                        <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-sm">
                          {helper.portfolioItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="overflow-hidden rounded-[16px] border-[3px] border-line bg-cream"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="h-20 w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
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
              );
            })
          )}
        </div>

        <div ref={formRef} className="space-y-6">
          <form onSubmit={submitHelper} className="retro-card h-fit space-y-5 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="display-font text-3xl font-black">
                  {editingId ? "Edit helper" : "Create helper"}
                </div>
                <p className="mt-2 text-sm text-muted">
                  {editingId
                    ? "Update helper details, availability, specialties, and sort order."
                    : "Add a helper to the live roster with the minimum details needed for matching."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startCreate}
                  className={buttonStyles({ tone: "purple", size: "sm" })}
                >
                  Add Helper
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className={buttonStyles({ tone: "ink", size: "sm" })}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>

            <InputShell label="Helper Name" error={helperErrors.name}>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={cn(
                  "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                  helperErrors.name ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                )}
              />
            </InputShell>

            <div className="grid gap-4 md:grid-cols-2">
              <InputShell label="Helper Type" error={helperErrors.type}>
                <select
                  value={form.type}
                  onChange={(event) => {
                    const nextType = event.target.value;
                    updateField("type", nextType);
                    updateField(
                      "priceTier",
                      nextType === "TEAM" ? "PREMIUM" : form.priceTier || "STANDARD",
                    );
                    if (nextType !== "TEAM") {
                      updateField("teamSize", "");
                    }
                  }}
                  className={cn(
                    "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                    helperErrors.type ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                  )}
                >
                  {helperTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label === "Studio" ? "Team / Studio" : option.label}
                    </option>
                  ))}
                </select>
              </InputShell>

              {form.type === "TEAM" ? (
                <InputShell label="Team Size" error={helperErrors.teamSize}>
                  <input
                    type="number"
                    min="1"
                    value={form.teamSize}
                    onChange={(event) => updateField("teamSize", event.target.value)}
                    className={cn(
                      "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                      helperErrors.teamSize ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                    )}
                  />
                </InputShell>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputShell label="Projects Completed" error={helperErrors.projectsCompleted}>
                <input
                  type="number"
                  min="0"
                  value={form.projectsCompleted}
                  onChange={(event) => updateField("projectsCompleted", event.target.value)}
                  className={cn(
                    "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                    helperErrors.projectsCompleted ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                  )}
                />
              </InputShell>

              <InputShell label="Price Tier" error={helperErrors.priceTier}>
                <select
                  value={form.priceTier}
                  onChange={(event) => updateField("priceTier", event.target.value)}
                  className={cn(
                    "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                    helperErrors.priceTier ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                  )}
                >
                  {helperPriceTierOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value} - {option.label}
                    </option>
                  ))}
                </select>
              </InputShell>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputShell label="Response Time" error={helperErrors.responseTime}>
                <input
                  value={form.responseTime}
                  onChange={(event) => updateField("responseTime", event.target.value)}
                  className={cn(
                    "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                    helperErrors.responseTime ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                  )}
                  placeholder="Within 1 hour"
                />
              </InputShell>

              <InputShell label="Delivery Time" error={helperErrors.deliveryTime}>
                <input
                  value={form.deliveryTime}
                  onChange={(event) => updateField("deliveryTime", event.target.value)}
                  className={cn(
                    "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                    helperErrors.deliveryTime ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                  )}
                  placeholder="24-48h"
                />
              </InputShell>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputShell label="Repeat Clients" error={helperErrors.repeatClients}>
                <input
                  type="number"
                  min="0"
                  value={form.repeatClients}
                  onChange={(event) => updateField("repeatClients", event.target.value)}
                  className={cn(
                    "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                    helperErrors.repeatClients ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                  )}
                  placeholder="Optional"
                />
              </InputShell>

              <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Live Counters
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {editingHelper
                    ? `${editingHelper.impressionCount} impressions · ${editingHelper.clickCount} clicks · ${editingHelper.selectionCount} selections`
                    : "Counters start after the helper goes live."}
                </p>
              </div>
            </div>

            <InputShell label="Category / Discipline" error={helperErrors.category}>
              <select
                value={form.category}
                onChange={(event) => {
                  const nextCategory = event.target.value;
                  const allowedTaskTypes = new Set<string>(
                    getTaskTypeOptionsForCategory(nextCategory).map((option) => option.value),
                  );

                  updateField("category", nextCategory);
                  setForm((current) => ({
                    ...current,
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
                  }));
                }}
                className={cn(
                  "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                  helperErrors.category ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                )}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </InputShell>

            <InputShell label="Short Description / Bio" error={helperErrors.shortBio}>
              <textarea
                rows={4}
                value={form.shortBio}
                onChange={(event) => updateField("shortBio", event.target.value)}
                className={cn(
                  "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                  helperErrors.shortBio ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                )}
              />
            </InputShell>

            <div className="grid gap-4 md:grid-cols-2">
              <InputShell label="Application Status" error={helperErrors.status}>
                <select
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                  className={cn(
                    "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                    helperErrors.status ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                  )}
                >
                  {helperStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </InputShell>

              <InputShell label="Display Order" error={helperErrors.displayOrder}>
                <input
                  type="number"
                  min="0"
                  value={form.displayOrder}
                  onChange={(event) => updateField("displayOrder", event.target.value)}
                  className={cn(
                    "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                    helperErrors.displayOrder ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                  )}
                />
              </InputShell>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 font-semibold">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateField("isActive", event.target.checked)}
                />
                Active helper
              </label>

              <label className="flex items-center gap-3 rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 font-semibold">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(event) => updateField("isVerified", event.target.checked)}
                />
                Verified helper
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputShell label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
                />
              </InputShell>

              <InputShell label="WhatsApp Number">
                <input
                  value={form.whatsappNumber}
                  onChange={(event) => updateField("whatsappNumber", event.target.value.replace(/[^\d]/g, ""))}
                  className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
                />
              </InputShell>
            </div>

            <InputShell label="Application Portfolio Note">
              <textarea
                rows={3}
                value={form.portfolioNote}
                onChange={(event) => updateField("portfolioNote", event.target.value)}
                className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
              />
            </InputShell>

            {editingHelper?.agreedToTerms ? (
              <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm text-muted">
                Agreement accepted
                {editingHelper.agreedAt
                  ? ` on ${new Date(editingHelper.agreedAt).toLocaleDateString()}`
                  : ""}
                .
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-black uppercase tracking-[0.14em] text-muted">
                  Specialties / Tags
                </div>
                <button
                  type="button"
                  onClick={addSpecialty}
                  className={buttonStyles({ tone: "yellow", size: "sm" })}
                >
                  Add Specialty
                </button>
              </div>

              {form.specialties.map((specialty, index) => (
                <div
                  key={`${specialty.code || "specialty"}-${index}`}
                  className="rounded-[20px] border-[3px] border-line bg-cream p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputShell
                      label="Code"
                      error={
                        helperErrors[`specialties.${index}.code`] ||
                        helperErrors["specialties"]
                      }
                    >
                      <input
                        value={specialty.code}
                        onChange={(event) => updateSpecialty(index, { code: event.target.value })}
                        className="w-full rounded-[16px] border-[3px] border-line bg-white px-4 py-3 outline-none"
                        placeholder="financial-analysis"
                      />
                    </InputShell>
                    <InputShell label="Label" error={helperErrors[`specialties.${index}.label`]}>
                      <input
                        value={specialty.label}
                        onChange={(event) => updateSpecialty(index, { label: event.target.value })}
                        className="w-full rounded-[16px] border-[3px] border-line bg-white px-4 py-3 outline-none"
                        placeholder="Financial Analysis"
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
                            className={cn(
                              "retro-pill px-3 py-1 text-xs font-black uppercase",
                              active ? "bg-purple text-white" : "bg-white text-ink",
                            )}
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
              ))}
            </div>

            {helperError ? <p className="text-sm font-bold text-red">{helperError}</p> : null}
            {helperSuccess ? <p className="text-sm font-bold text-green">{helperSuccess}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={savingHelper}
                className={buttonStyles({ tone: "purple", size: "md" })}
              >
                {savingHelper
                  ? "Saving..."
                  : editingId
                    ? "Save Helper"
                    : "Create Helper"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className={buttonStyles({ tone: "yellow", size: "md" })}
                >
                  Back to Helper List
                </button>
              ) : null}
            </div>
          </form>

          <div className="retro-card space-y-5 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="display-font text-3xl font-black">Portfolio</div>
                <p className="mt-2 text-sm text-muted">
                  {editingId
                    ? "Add visual examples that help students evaluate this helper quickly."
                    : "Save the helper first, then add portfolio examples here."}
                </p>
              </div>
              {editingPortfolioId ? (
                <button
                  type="button"
                  onClick={resetPortfolioForm}
                  className={buttonStyles({ tone: "ink", size: "sm" })}
                >
                  Cancel
                </button>
              ) : null}
            </div>

            {!editingId ? (
              <EmptyState
                title="Portfolio unlocks after helper creation"
                description="Create the helper record first so portfolio items can be attached safely."
              />
            ) : (
              <>
                <form
                  onSubmit={submitPortfolio}
                  className="space-y-4 rounded-[22px] border-[3px] border-line bg-cream p-4"
                >
                  <div className="display-font text-2xl font-black">
                    {editingPortfolioId ? "Edit portfolio item" : "Add portfolio item"}
                  </div>

                  <InputShell label="Title" error={portfolioErrors.title}>
                    <input
                      value={portfolioForm.title}
                      onChange={(event) => updatePortfolioField("title", event.target.value)}
                      className={cn(
                        "w-full rounded-[16px] bg-white px-4 py-3 outline-none",
                        portfolioErrors.title ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                      )}
                    />
                  </InputShell>

                  <InputShell label="Image URL" error={portfolioErrors.imageUrl}>
                    <input
                      value={portfolioForm.imageUrl}
                      onChange={(event) => updatePortfolioField("imageUrl", event.target.value)}
                      className={cn(
                        "w-full rounded-[16px] bg-white px-4 py-3 outline-none",
                        portfolioErrors.imageUrl ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                      )}
                      placeholder="https://..."
                    />
                  </InputShell>

                  <InputShell label="Description" error={portfolioErrors.description}>
                    <textarea
                      rows={3}
                      value={portfolioForm.description}
                      onChange={(event) => updatePortfolioField("description", event.target.value)}
                      className="w-full rounded-[16px] border-[3px] border-line bg-white px-4 py-3 outline-none"
                    />
                  </InputShell>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InputShell label="External Link" error={portfolioErrors.externalLink}>
                      <input
                        value={portfolioForm.externalLink}
                        onChange={(event) => updatePortfolioField("externalLink", event.target.value)}
                        className={cn(
                          "w-full rounded-[16px] bg-white px-4 py-3 outline-none",
                          portfolioErrors.externalLink ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                        )}
                        placeholder="https://..."
                      />
                    </InputShell>

                    <InputShell label="Display Order" error={portfolioErrors.displayOrder}>
                      <input
                        type="number"
                        min="0"
                        value={portfolioForm.displayOrder}
                        onChange={(event) => updatePortfolioField("displayOrder", event.target.value)}
                        className={cn(
                          "w-full rounded-[16px] bg-white px-4 py-3 outline-none",
                          portfolioErrors.displayOrder ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
                        )}
                      />
                    </InputShell>
                  </div>

                  {portfolioError ? <p className="text-sm font-bold text-red">{portfolioError}</p> : null}
                  {portfolioSuccess ? <p className="text-sm font-bold text-green">{portfolioSuccess}</p> : null}

                  <button
                    type="submit"
                    disabled={savingPortfolio}
                    className={buttonStyles({ tone: "purple", size: "md" })}
                  >
                    {savingPortfolio
                      ? "Saving..."
                      : editingPortfolioId
                        ? "Save Portfolio Item"
                        : "Add Portfolio Item"}
                  </button>
                </form>

                <div className="space-y-4">
                  {editingHelper?.portfolioItems.length ? (
                    editingHelper.portfolioItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[22px] border-[3px] border-line bg-white p-4"
                      >
                        <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-start">
                          <div className="overflow-hidden rounded-[18px] border-[3px] border-line bg-cream">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-24 w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="display-font text-2xl font-black">{item.title}</div>
                            <p className="mt-2 text-sm text-muted">
                              Order {item.displayOrder}
                              {item.externalLink ? " · External link attached" : ""}
                            </p>
                            {item.description ? (
                              <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => startPortfolioEdit(item)}
                              className={buttonStyles({ tone: "yellow", size: "sm" })}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deletePortfolioItem(item)}
                              disabled={deletingPortfolioId === item.id}
                              className={buttonStyles({ tone: "ink", size: "sm" })}
                            >
                              {deletingPortfolioId === item.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No portfolio items yet"
                      description="Add the first portfolio example so students can see work quality before matching."
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
