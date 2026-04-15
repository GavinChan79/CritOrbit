"use client";

import { useMemo, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import { buttonStyles, EmptyState, InputShell } from "@/components/ui";
import {
  getHelperMatchPriority,
  getCategoryLabel,
  helperMatchesRequest,
  getTaskTypeLabel,
  specialtyMatchesTaskType,
  type HelperPortfolioItem,
  type HelperSpecialty,
} from "@/lib/helpers";
import {
  APP_NAME,
  categoryOptions,
  getTaskTypeOptionsForCategory,
  statusOptions,
  urgencyOptions,
} from "@/lib/constants";
import { getLeadTemperatureLabel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import {
  leadMatchPayloadSchema,
  loginSchema,
  registerSchema,
  requirementSchema,
} from "@/lib/validators";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>>({});
  const [pending, startTransition] = useTransition();

  function updateField(field: "name" | "email" | "password" | "confirmPassword", value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const schema = mode === "register" ? registerSchema : loginSchema;
    const schemaInput =
      mode === "register"
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
    const parsed = schema.safeParse(schemaInput);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue?.path[0];

      if (
        field === "name" ||
        field === "email" ||
        field === "password" ||
        field === "confirmPassword"
      ) {
        setFieldErrors({ [field]: firstIssue.message });
      } else {
        setError(firstIssue?.message ?? "Please check your form.");
      }

      return;
    }

    if (mode === "register" && form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    startTransition(async () => {
      if (mode === "register") {
        const registerResponse = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });

        const registerJson = await registerResponse.json();

        if (!registerResponse.ok) {
          setError(registerJson.error ?? "Could not create your account.");
          return;
        }
      }

      const signInResponse = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (signInResponse?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="retro-card space-y-5 bg-white p-8">
      <div>
        <h1 className="display-font text-4xl font-black">
          {mode === "login" ? `Welcome to ${APP_NAME}` : `Join ${APP_NAME}`}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "login"
            ? "Log in to track your requests and pick the right helper."
            : "Create your student account and keep your requests organized."}
        </p>
      </div>

      {mode === "register" ? (
        <InputShell label="Name" error={fieldErrors.name}>
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={cn(
              "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
              fieldErrors.name ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
            )}
            placeholder="Aina Rahman"
          />
        </InputShell>
      ) : null}

      <InputShell label="Email" error={fieldErrors.email}>
        <input
          value={form.email}
          type="email"
          onChange={(event) => updateField("email", event.target.value)}
          className={cn(
            "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
            fieldErrors.email ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
          )}
          placeholder="you@student.edu.my"
        />
      </InputShell>

      <InputShell label="Password" error={fieldErrors.password}>
        <input
          value={form.password}
          type="password"
          onChange={(event) => updateField("password", event.target.value)}
          className={cn(
            "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
            fieldErrors.password ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
          )}
          placeholder="At least 8 characters"
        />
      </InputShell>

      {mode === "register" ? (
        <InputShell label="Confirm Password" error={fieldErrors.confirmPassword}>
          <input
            value={form.confirmPassword}
            type="password"
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            className={cn(
              "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
              fieldErrors.confirmPassword ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
            )}
            placeholder="Confirm Password"
          />
        </InputShell>
      ) : null}

      {error ? <p className="text-sm font-bold text-red">{error}</p> : null}

      <button type="submit" disabled={pending} className={buttonStyles({ tone: "purple", size: "lg", fullWidth: true })}>
        {pending ? "Working..." : mode === "login" ? "Log In" : "Create Account"}
      </button>
    </form>
  );
}

export function RequirementForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"category" | "taskType" | "urgency" | "deadline" | "budget" | "description", string>>
  >({});
  const [form, setForm] = useState<{
    category: string;
    taskType: string;
    urgency: string;
    deadline: string;
    budget: string;
    description: string;
  }>({
    category: "",
    taskType: "",
    urgency: "",
    deadline: "",
    budget: "",
    description: "",
  });

  const taskTypeOptions = form.category ? getTaskTypeOptionsForCategory(form.category) : [];

  function updateField(
    field: "category" | "taskType" | "urgency" | "deadline" | "budget" | "description",
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  }

  function focusFirstInvalidField(
    errors: Partial<Record<"category" | "taskType" | "urgency" | "deadline" | "budget" | "description", string>>,
  ) {
    const fieldOrder: Array<keyof typeof errors> = [
      "category",
      "taskType",
      "urgency",
      "deadline",
      "description",
      "budget",
    ];

    const firstInvalid = fieldOrder.find((field) => errors[field]);
    if (!firstInvalid) {
      return;
    }

    const element = document.getElementById(`requirement-${firstInvalid}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (element instanceof HTMLElement) {
      element.focus();
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const nextFieldErrors: Partial<Record<"category" | "taskType" | "urgency" | "deadline" | "budget" | "description", string>> = {};

    if (!form.category) {
      nextFieldErrors.category = "This field is required.";
    }
    if (!form.taskType) {
      nextFieldErrors.taskType = "This field is required.";
    }
    if (!form.urgency) {
      nextFieldErrors.urgency = "This field is required.";
    }
    if (!form.deadline) {
      nextFieldErrors.deadline = "This field is required.";
    }
    if (!form.description.trim()) {
      nextFieldErrors.description = "This field is required.";
    }

    const sanitizedBudget = form.budget.replace(/[^\d]/g, "");
    const payload = {
      ...form,
      budget: sanitizedBudget,
      description: form.description.trim(),
    };
    const parsed = requirementSchema.safeParse(payload);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      focusFirstInvalidField(nextFieldErrors);
      return;
    }

    if (!parsed.success) {
      const validationErrors: typeof nextFieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (
          (field === "category" ||
            field === "taskType" ||
            field === "urgency" ||
            field === "deadline" ||
            field === "budget" ||
            field === "description") &&
          !validationErrors[field]
        ) {
          validationErrors[field] = issue.message;
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        focusFirstInvalidField(validationErrors);
      } else {
        setError(parsed.error.issues[0]?.message ?? "Please complete the form.");
      }

      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      const response = await fetch("/api/leads/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Could not save your request draft.");
        return;
      }

      router.push(`/helpers/select?draftId=${json.draftId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="retro-card bg-white p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          label="Course / Field"
          id="requirement-category"
          value={form.category}
          options={categoryOptions}
          placeholder="Select course / field"
          error={fieldErrors.category}
          onChange={(value) => {
            setForm((current) => ({
              ...current,
              category: value,
              taskType: "",
            }));
            setFieldErrors((current) => ({
              ...current,
              category: undefined,
              taskType: undefined,
            }));
            setError("");
          }}
        />
        <SelectField
          label="Task Type"
          id="requirement-taskType"
          value={form.taskType}
          options={taskTypeOptions}
          placeholder={form.category ? "Select task type" : "Select course / field first"}
          disabled={!form.category}
          error={fieldErrors.taskType}
          onChange={(value) => updateField("taskType", value)}
        />
        <SelectField
          label="Urgency"
          id="requirement-urgency"
          value={form.urgency}
          options={urgencyOptions}
          placeholder="Select urgency"
          error={fieldErrors.urgency}
          onChange={(value) => updateField("urgency", value)}
        />
        <InputShell label="Deadline" error={fieldErrors.deadline}>
          <input
            id="requirement-deadline"
            type="date"
            value={form.deadline}
            onChange={(event) => updateField("deadline", event.target.value)}
            className={cn(
              "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
              fieldErrors.deadline ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
            )}
          />
        </InputShell>
        <InputShell label="Budget" hint="Optional. Example: 150" error={fieldErrors.budget}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-muted">RM</span>
            <input
              id="requirement-budget"
              value={form.budget}
              type="number"
              min="0"
              step="1"
              onChange={(event) => updateField("budget", event.target.value.replace(/[^\d]/g, ""))}
              className={cn(
                "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
                fieldErrors.budget ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
              )}
              placeholder="e.g. 150"
            />
          </div>
        </InputShell>
        <div className="rounded-[20px] border-[3px] border-line bg-yellow p-4">
          <div className="display-font text-lg font-black">Lead score reminder</div>
          <p className="mt-2 text-sm">
            Urgency, budget, description quality, and helper selection shape the score your admin team sees.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <InputShell label="Description" error={fieldErrors.description}>
          <textarea
            id="requirement-description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={5}
            className={cn(
              "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
              fieldErrors.description ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
            )}
            placeholder="Tell us about your assignment..."
          />
        </InputShell>
      </div>

      {error ? <p className="mt-4 text-sm font-bold text-red">{error}</p> : null}

      <button
        className={cn("mt-6", buttonStyles({ tone: "purple", size: "lg" }))}
        type="submit"
        disabled={pending}
      >
        {pending ? "Saving Brief..." : "Find My Helper →"}
      </button>
    </form>
  );
}

export function HelperSelectionClient({
  helpers,
  request,
}: {
  helpers: Array<{
    id: string;
    name: string;
    category: string;
    displayOrder: number;
    specialties: HelperSpecialty[];
    shortBio: string;
    portfolioItems: HelperPortfolioItem[];
  }>;
  request: {
    draftId: string;
    category: string;
    taskType: string;
    urgency: string;
    deadline: string;
    budget?: number;
    description: string;
    baseScore: number;
  };
}) {
  const [categoryFilter, setCategoryFilter] = useState(request.category);
  const [taskFilter, setTaskFilter] = useState(request.taskType);
  const [loadingId, setLoadingId] = useState("");
  const [error, setError] = useState("");
  const taskTypeOptions = getTaskTypeOptionsForCategory(request.category);

  const visibleHelpers = useMemo(() => {
    const isUsingDraftDefaults =
      categoryFilter === request.category && taskFilter === request.taskType;

    const rankedHelpers = helpers
      .map((helper, index) => ({
        helper,
        index,
        priority: getHelperMatchPriority({
          helperCategory: helper.category,
          requestCategory: request.category,
          specialties: helper.specialties,
          requestTaskType: request.taskType,
        }),
      }))
      .sort((left, right) => {
        if (left.priority !== right.priority) {
          return left.priority - right.priority;
        }

        if (left.helper.displayOrder !== right.helper.displayOrder) {
          return left.helper.displayOrder - right.helper.displayOrder;
        }

        return left.index - right.index;
      })
      .map((entry) => entry.helper);

    if (isUsingDraftDefaults) {
      return rankedHelpers;
    }

    return rankedHelpers.filter((helper) => {
      const categoryPass =
        categoryFilter === "ALL" || helper.category === categoryFilter;
      const taskPass =
        taskFilter === "ALL" ||
        specialtyMatchesTaskType(helper.specialties, taskFilter);

      return categoryPass && taskPass;
    });
  }, [categoryFilter, helpers, request.category, request.taskType, taskFilter]);

  async function handleMatch(helperId: string) {
    if (loadingId) {
      return;
    }

    setLoadingId(helperId);
    setError("");

    const payload = {
      draftId: request.draftId,
      selectedHelperId: helperId,
    };

    const validatedPayload = leadMatchPayloadSchema.safeParse(payload);

    if (!validatedPayload.success) {
      setLoadingId("");
      setError(
        validatedPayload.error.issues[0]?.message ??
          "Your request details are incomplete. Please return to the requirement form.",
      );
      return;
    }

    console.log("lead payload", payload);

    const response = await fetch("/api/leads/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    setLoadingId("");

    if (!response.ok) {
      setError(json.error ?? "Could not create the lead.");
      return;
    }

    window.location.assign(json.whatsappUrl);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="retro-card h-fit space-y-5 bg-white p-5">
        <div>
          <div className="display-font text-2xl font-black">Brief Summary</div>
          <p className="mt-2 text-sm text-muted">
            Your current score before helper selection is{" "}
            <span className="font-black text-purple">{request.baseScore}</span> ({getLeadTemperatureLabel(request.baseScore)}).
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <div><span className="font-black">Category:</span> {getCategoryLabel(request.category)}</div>
          <div><span className="font-black">Task:</span> {getTaskTypeLabel(request.taskType)}</div>
          <div><span className="font-black">Urgency:</span> {request.urgency}</div>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setCategoryFilter("ALL")}
            className={filterPill(categoryFilter === "ALL")}
          >
            All
          </button>
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategoryFilter(option.value)}
              className={filterPill(categoryFilter === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setTaskFilter("ALL")} className={filterPill(taskFilter === "ALL")}>
            All Tasks
          </button>
          {taskTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTaskFilter(option.value)}
              className={filterPill(taskFilter === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-5">
        {error ? (
          <div className="rounded-[18px] border-[3px] border-line bg-red px-4 py-3 text-sm font-bold text-white">
            {error}
          </div>
        ) : null}
        {visibleHelpers.length === 0 ? (
          <EmptyState
            title="No helpers match these filters"
            description="Try clearing the current category or task filter to see the full shortlist again."
          />
        ) : null}
        {visibleHelpers.map((helper) => {
          const recommended = helperMatchesRequest({
            helperCategory: helper.category,
            requestCategory: request.category,
            specialties: helper.specialties,
            requestTaskType: request.taskType,
          });

          const matchingLabels = helper.specialties
            .filter((specialty) => specialtyMatchesTaskType([specialty], request.taskType))
            .map((specialty) => specialty.label);

          return (
            <div key={helper.id} className="retro-card bg-white p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[18px] border-[3px] border-line bg-yellow display-font text-xl font-black">
                      {helper.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="display-font text-2xl font-black">{helper.name}</h3>
                      <p className="text-sm font-semibold text-muted">
                        {getCategoryLabel(helper.category)}
                      </p>
                    </div>
                    {recommended ? <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">Recommended</span> : null}
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-muted">{helper.shortBio}</p>
                  <div className="flex flex-wrap gap-2">
                    {helper.specialties.map((specialty) => (
                      <span key={specialty.code} className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase">
                        {specialty.label}
                      </span>
                    ))}
                    {recommended ? (
                      <span className="text-xs font-bold text-green">
                        Match rule: category matches and specialty covers {matchingLabels.join(", ")}.
                      </span>
                    ) : null}
                  </div>
                  {helper.portfolioItems.length ? (
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                        Portfolio Preview
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-sm">
                        {helper.portfolioItems.map((item) => (
                          <a
                            key={item.id}
                            href={item.externalLink || item.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="overflow-hidden rounded-[18px] border-[3px] border-line bg-cream"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-24 w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleMatch(helper.id)}
                  disabled={Boolean(loadingId)}
                  className={buttonStyles({ tone: recommended ? "green" : "purple", size: "md" })}
                >
                  {loadingId === helper.id ? "Saving..." : "Get Matched →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LeadManagementForm({
  lead,
  helpers,
}: {
  lead: {
    id: string;
    status: LeadStatus;
    assignedHelperId: string | null;
    dealClosed: boolean;
    dealValue: number | null;
    notes: string;
  };
  helpers: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    status: lead.status,
    assignedHelperId: lead.assignedHelperId ?? "",
    dealClosed: lead.dealClosed,
    dealValue: lead.dealValue ? String(lead.dealValue) : "",
    notes: lead.notes,
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setError("");

    startTransition(async () => {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dealValue: form.dealValue ? Number(form.dealValue) : null,
          assignedHelperId: form.assignedHelperId || null,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Could not update the lead.");
        return;
      }

      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="retro-card space-y-5 bg-white p-6">
      <SelectField
        label="Status"
        value={form.status}
        options={statusOptions}
        onChange={(value) => setForm((current) => ({ ...current, status: value as LeadStatus }))}
      />
      <SelectField
        label="Assign Helper"
        value={form.assignedHelperId}
        options={[{ value: "", label: "Unassigned" }, ...helpers.map((helper) => ({ value: helper.id, label: helper.name }))]}
        onChange={(value) => setForm((current) => ({ ...current, assignedHelperId: value }))}
      />
      <InputShell label="Deal Value (RM)">
        <input
          value={form.dealValue}
          onChange={(event) => setForm((current) => ({ ...current, dealValue: event.target.value }))}
          className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
          placeholder="250"
        />
      </InputShell>
      <label className="flex items-center gap-3 rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 font-semibold">
        <input
          type="checkbox"
          checked={form.dealClosed}
          onChange={(event) =>
            setForm((current) => ({ ...current, dealClosed: event.target.checked }))
          }
        />
        Deal Closed
      </label>
      <InputShell label="Internal Notes">
        <textarea
          rows={5}
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
        />
      </InputShell>
      {error ? <p className="text-sm font-bold text-red">{error}</p> : null}
      {saved ? <p className="text-sm font-bold text-green">Lead updated.</p> : null}
      <button type="submit" disabled={pending} className={buttonStyles({ tone: "purple", size: "md" })}>
        {pending ? "Saving..." : "Save Lead"}
      </button>
    </form>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  error,
  onChange,
}: {
  id?: string;
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <InputShell label={label} error={error}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={cn(
          "w-full rounded-[18px] bg-cream px-4 py-3 outline-none",
          disabled && "cursor-not-allowed opacity-60",
          error ? "border-[1.5px] border-[#E24B4A]" : "border-[3px] border-line",
        )}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </InputShell>
  );
}

function filterPill(active: boolean) {
  return cn(
    "retro-pill px-3 py-1 text-xs font-black uppercase tracking-[0.12em]",
    active ? "bg-purple text-white" : "bg-cream text-ink",
  );
}
