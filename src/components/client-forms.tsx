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
  type HelperSpecialty,
} from "@/lib/helpers";
import {
  categoryOptions,
  getDefaultTaskTypeForCategory,
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
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const schema = mode === "register" ? registerSchema : loginSchema;
    const parsed = schema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your form.");
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
          {mode === "login" ? "Welcome Back" : "Join CritStudio"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "login"
            ? "Log in to track your requests and pick the right helper."
            : "Create your student account and keep your requests organized."}
        </p>
      </div>

      {mode === "register" ? (
        <InputShell label="Name">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
            placeholder="Aina Rahman"
          />
        </InputShell>
      ) : null}

      <InputShell label="Email">
        <input
          value={form.email}
          type="email"
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
          placeholder="you@student.edu.my"
        />
      </InputShell>

      <InputShell label="Password">
        <input
          value={form.password}
          type="password"
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
          placeholder="At least 8 characters"
        />
      </InputShell>

      {error ? <p className="text-sm font-bold text-red">{error}</p> : null}

      <button type="submit" disabled={pending} className={buttonStyles({ tone: "purple", size: "lg", fullWidth: true })}>
        {pending ? "Working..." : mode === "login" ? "Log In" : "Create Account"}
      </button>

      <p className="text-sm text-muted">
        Demo accounts: admin@critstudio.my and aina@student.critstudio.my with password
        {" "}
        critstudio123.
      </p>
    </form>
  );
}

export function RequirementForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<{
    category: string;
    taskType: string;
    urgency: string;
    deadline: string;
    budget: string;
    description: string;
  }>({
    category: "INTERIOR_DESIGN",
    taskType: getDefaultTaskTypeForCategory("INTERIOR_DESIGN"),
    urgency: "NORMAL",
    deadline: "",
    budget: "",
    description: "",
  });

  const taskTypeOptions = getTaskTypeOptionsForCategory(form.category);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsed = requirementSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete the form.");
      return;
    }

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
          value={form.category}
          options={categoryOptions}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              category: value,
              taskType: getDefaultTaskTypeForCategory(value),
            }))
          }
        />
        <SelectField
          label="Task Type"
          value={form.taskType}
          options={taskTypeOptions}
          onChange={(value) => setForm((current) => ({ ...current, taskType: value }))}
        />
        <SelectField
          label="Urgency"
          value={form.urgency}
          options={urgencyOptions}
          onChange={(value) => setForm((current) => ({ ...current, urgency: value }))}
        />
        <InputShell label="Deadline">
          <input
            type="date"
            value={form.deadline}
            onChange={(event) =>
              setForm((current) => ({ ...current, deadline: event.target.value }))
            }
            className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
          />
        </InputShell>
        <InputShell label="Budget" hint="Optional. Example: RM150">
          <input
            value={form.budget}
            onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
            className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
            placeholder="RM150"
          />
        </InputShell>
        <div className="rounded-[20px] border-[3px] border-line bg-yellow p-4">
          <div className="display-font text-lg font-black">Lead score reminder</div>
          <p className="mt-2 text-sm">
            Urgency, budget, description quality, and helper selection shape the score your admin team sees.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <InputShell label="Description">
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            rows={5}
            className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
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
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <InputShell label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 outline-none"
      >
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
