"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import { buttonStyles, EmptyState, InputShell } from "@/components/ui-primitives";
import {
  getHelperCardSpecialties,
  getCategoryLabel,
  getHelperBookedTimeLabel,
  getHelperDeliveryTime,
  getHelperPastWorksLabel,
  getHelperPriceAnchor,
  getHelperPriceTierLabel,
  getHelperPriceTierReason,
  getHelperReplyLine,
  getHelperUrgencySignals,
  getHelperResponseSpeed,
  getHelperTrustedByLabel,
  getHelperTypeLabel,
  helperMatchesRequest,
  isFastResponseText,
  getTaskTypeLabel,
  specialtyMatchesTaskType,
  type HelperPortfolioItem,
  type HelperSpecialty,
} from "@/lib/helpers";
import {
  getHelperConversionTierLabel,
  rankHelpersByConversion,
  type HelperConversionTier,
} from "@/lib/helper-ranking";
import {
  APP_NAME,
  categoryOptions,
  getTaskTypeOptionsForCategory,
  statusOptions,
  urgencyOptions,
} from "@/lib/constants";
import { formatCurrencyFromSen } from "@/lib/format";
import { getLeadTemperatureLabel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import {
  leadMatchPayloadSchema,
  loginSchema,
  registerSchema,
  requirementSchema,
} from "@/lib/validators";

type AuthMode = "login" | "register";
type PaymentStatusValue =
  | "UNPAID"
  | "PAYMENT_LINK_SENT"
  | "PAID"
  | "REFUNDED"
  | "RELEASE_READY"
  | "RELEASED"
  | "PAYMENT_FAILED"
  | "PAYMENT_EXPIRED";

function getDeliveryPriority(deliveryTime: string) {
  const normalized = deliveryTime.toLowerCase();

  if (
    normalized.includes("1 hour") ||
    normalized.includes("same day") ||
    normalized.includes("24")
  ) {
    return 0;
  }

  if (normalized.includes("48") || normalized.includes("2 day")) {
    return 1;
  }

  return 2;
}

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
        {pending ? "Saving Brief..." : "Find My Helper ->"}
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
    type: string;
    teamSize: number | null;
    isVerified: boolean;
    projectsCompleted: number;
    impressionCount: number;
    responseTime: string | null;
    deliveryTime: string | null;
    repeatClients: number | null;
    priceTier: string;
    priceAnchor: string;
    clickCount: number;
    selectionCount: number;
    category: string;
    displayOrder: number;
    specialties: HelperSpecialty[];
    shortBio: string;
    portfolioItems: HelperPortfolioItem[];
    completionScore: number;
    portfolioItemsCount: number;
    conversionScore: number;
    conversionTier: HelperConversionTier;
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
  const [showAllHelpers, setShowAllHelpers] = useState(false);
  const trackedImpressionIdsRef = useRef<Set<string>>(new Set());
  const taskTypeOptions = getTaskTypeOptionsForCategory(request.category);

  const visibleHelpers = useMemo(() => {
    const filteredHelpers = helpers.filter((helper) => {
      const categoryPass =
        categoryFilter === "ALL" || helper.category === categoryFilter;
      const taskPass =
        taskFilter === "ALL" ||
        specialtyMatchesTaskType(helper.specialties, taskFilter);

      return categoryPass && taskPass;
    });

    return rankHelpersByConversion(filteredHelpers);
  }, [categoryFilter, helpers, taskFilter]);

  const recommendedHelpers = useMemo(
    () =>
      [...visibleHelpers]
        .filter((helper) =>
          helperMatchesRequest({
            helperCategory: helper.category,
            requestCategory: request.category,
            specialties: helper.specialties,
            requestTaskType: request.taskType,
          }),
        )
        .sort((left, right) => {
          if (request.urgency === "ASAP") {
            const leftDelivery = getDeliveryPriority(
              getHelperDeliveryTime({
                type: left.type,
                isVerified: left.isVerified,
                deliveryTime: left.deliveryTime,
              }),
            );
            const rightDelivery = getDeliveryPriority(
              getHelperDeliveryTime({
                type: right.type,
                isVerified: right.isVerified,
                deliveryTime: right.deliveryTime,
              }),
            );

            if (leftDelivery !== rightDelivery) {
              return leftDelivery - rightDelivery;
            }
          }

          if (left.conversionScore !== right.conversionScore) {
            return right.conversionScore - left.conversionScore;
          }

          return left.displayOrder - right.displayOrder;
        })
        .slice(0, 2),
    [request.category, request.taskType, request.urgency, visibleHelpers],
  );

  const remainingHelpers = useMemo(
    () => visibleHelpers.filter((helper) => !recommendedHelpers.some((entry) => entry.id === helper.id)),
    [recommendedHelpers, visibleHelpers],
  );
  const primaryRecommendationId = recommendedHelpers[0]?.id ?? null;
  const secondaryRecommendationId = recommendedHelpers[1]?.id ?? null;
  const initialVisibleHelpers = remainingHelpers.slice(0, 3);
  const collapsedHelpers = remainingHelpers.slice(3);
  const displayedHelpers = showAllHelpers ? remainingHelpers : initialVisibleHelpers;
  const visibleTrackingIds = useMemo(
    () => [...recommendedHelpers, ...displayedHelpers].map((helper) => helper.id),
    [displayedHelpers, recommendedHelpers],
  );

  useEffect(() => {
    const nextIds = visibleTrackingIds.filter(
      (helperId) => !trackedImpressionIdsRef.current.has(helperId),
    );

    if (nextIds.length === 0) {
      return;
    }

    nextIds.forEach((helperId) => trackedImpressionIdsRef.current.add(helperId));

    void fetch("/api/helpers/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "impression",
        helperIds: nextIds,
      }),
    }).catch(() => {
      nextIds.forEach((helperId) => trackedImpressionIdsRef.current.delete(helperId));
    });
  }, [visibleTrackingIds]);

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

  function trackHelperClick(helperId: string) {
    void fetch("/api/helpers/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "click",
        helperId,
      }),
    }).catch(() => undefined);
  }

  function renderHelperCard(
    helper: (typeof helpers)[number],
    options?: { bestMatch?: boolean; emphasized?: boolean },
  ) {
    const bestMatch = Boolean(options?.bestMatch);
    const isPrimaryRecommendation = helper.id === primaryRecommendationId;
    const isSecondaryRecommendation = helper.id === secondaryRecommendationId;
    const isTopHelper = isPrimaryRecommendation || isSecondaryRecommendation;
    const tierLabel = getHelperConversionTierLabel(helper.conversionTier);
    const recommended = helperMatchesRequest({
      helperCategory: helper.category,
      requestCategory: request.category,
      specialties: helper.specialties,
      requestTaskType: request.taskType,
    });
    const featuredSpecialties = getHelperCardSpecialties(helper.specialties);
    const responseSpeed = getHelperResponseSpeed({
      type: helper.type,
      isVerified: helper.isVerified,
      responseTime: helper.responseTime,
    });
    const deliveryTime = getHelperDeliveryTime({
      type: helper.type,
      isVerified: helper.isVerified,
      deliveryTime: helper.deliveryTime,
    });
    const priceAnchor = getHelperPriceAnchor({
      type: helper.type,
      projectsCompleted: helper.projectsCompleted,
      priceTier: helper.priceTier,
      priceAnchor: helper.priceAnchor,
    });
    const portfolioCountLabel = getHelperPastWorksLabel(helper.portfolioItems.length);
    const trustedByLabel = getHelperTrustedByLabel({
      type: helper.type,
      teamSize: helper.teamSize,
      isVerified: helper.isVerified,
      projectsCompleted: helper.projectsCompleted,
      selectionCount: helper.selectionCount,
      portfolioItems: helper.portfolioItems,
      specialties: helper.specialties,
    });
    const bookedTimeLabel = getHelperBookedTimeLabel({
      type: helper.type,
      selectionCount: helper.selectionCount,
      clickCount: helper.clickCount,
    });
    const fastResponse = isFastResponseText(responseSpeed);
    const urgencySignals = getHelperUrgencySignals({
      type: helper.type,
      teamSize: helper.teamSize,
      isVerified: helper.isVerified,
      projectsCompleted: helper.projectsCompleted,
    });
    const isPremium = helper.priceTier === "PREMIUM";
    const isBudget = helper.priceTier === "BUDGET";
    const popularityLabel =
      helper.selectionCount >= 5
        ? `Chosen by ${helper.selectionCount} student${helper.selectionCount === 1 ? "" : "s"}`
        : helper.clickCount >= 10
          ? "Popular choice"
          : null;
    const demandLabel =
      helper.selectionCount >= 5
        ? "High demand"
        : isTopHelper
          ? "Filling fast"
          : helper.clickCount >= 10
            ? "Limited slots today"
          : null;
    const recommendationCopy = isPrimaryRecommendation
      ? "Best match for your request"
      : isSecondaryRecommendation
        ? "Good alternative if you prefer a different style"
        : null;
    const trustTrigger = isPrimaryRecommendation
      ? "Frequently selected for similar tasks"
      : isSecondaryRecommendation
        ? "Students often choose this"
        : null;

    const matchingLabels = helper.specialties
      .filter((specialty) => specialtyMatchesTaskType([specialty], request.taskType))
      .map((specialty) => specialty.label);
    const profileImage = helper.portfolioItems[0]?.imageUrl;
    const topTierUrgency = helper.conversionTier === "TOP_PICK";

    return (
      <div
        key={helper.id}
        className={cn(
          "retro-card bg-white p-6",
          helper.type === "TEAM" && "border-blue bg-[#f4f8ff]",
          isPremium && "border-[4px] border-red bg-[#fff8e8] shadow-[10px_10px_0_var(--line)]",
          isBudget && "bg-[#faf6ef] opacity-95",
          options?.emphasized && "border-green bg-[#f3fff5] shadow-[8px_8px_0_var(--line)]",
          helper.conversionTier === "TOP_PICK" &&
            "border-[4px] border-green bg-[#f3fff5] shadow-[10px_10px_0_var(--line)]",
          helper.conversionTier === "POPULAR" && "border-purple bg-[#faf4ff]",
        )}
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="shrink-0">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${helper.name} profile preview`}
                    className="h-20 w-20 rounded-[22px] border-[3px] border-line object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-20 w-20 items-center justify-center rounded-[22px] border-[3px] border-line display-font text-2xl font-black",
                      helper.type === "TEAM" ? "bg-blue text-white" : "bg-yellow text-ink",
                    )}
                  >
                    {helper.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <Link
                      href={`/helpers/${helper.id}?draftId=${request.draftId}`}
                      onClick={() => trackHelperClick(helper.id)}
                      className={cn(
                        "display-font text-2xl font-black underline-offset-4 hover:underline md:text-3xl",
                        helper.type === "TEAM" && "text-[2rem]",
                        options?.emphasized && "text-[2.15rem]",
                      )}
                    >
                      {helper.name}
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      {featuredSpecialties.map((specialty) => (
                        <span
                          key={specialty.code}
                          className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase"
                        >
                          {specialty.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full rounded-[20px] border-[3px] border-line bg-yellow px-4 py-3 md:w-auto md:min-w-[180px]">
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-ink/70">
                      Price
                    </div>
                    <div className="mt-2 display-font text-2xl font-black text-ink">
                      {priceAnchor}
                    </div>
                    <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-ink/70">
                      {getHelperPriceTierLabel(helper.priceTier)}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-ink/70">
                      {getHelperPriceTierReason(helper.priceTier)}
                    </div>
                    <div className="mt-3 border-t-[3px] border-line/20 pt-3 text-sm font-black text-ink">
                      {deliveryTime} delivery
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "retro-pill px-3 py-1 text-xs font-black uppercase",
                      helper.type === "TEAM" ? "bg-blue text-white" : "bg-cream text-ink",
                    )}
                  >
                    {getHelperTypeLabel(helper.type)}
                  </span>
                  {helper.isVerified ? (
                    <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
                      Verified Helper
                    </span>
                  ) : null}
                  {fastResponse ? (
                    <span className="retro-pill bg-yellow px-3 py-1 text-xs font-black uppercase text-ink">
                      Fast Response ⚡
                    </span>
                  ) : null}
                  {helper.type === "TEAM" ? (
                    <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">
                      Team
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "retro-pill px-3 py-1 text-xs font-black uppercase",
                      helper.conversionTier === "TOP_PICK" && "bg-green text-white",
                      helper.conversionTier === "POPULAR" && "bg-purple text-white",
                      helper.conversionTier === "STANDARD" && "bg-white text-ink",
                    )}
                  >
                    {tierLabel}
                  </span>
                  {isPremium ? (
                    <span className="retro-pill bg-red px-3 py-1 text-xs font-black uppercase text-white">
                      Premium
                    </span>
                  ) : null}
                  {bestMatch ? (
                    <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
                      Best Match
                    </span>
                  ) : isSecondaryRecommendation ? (
                    <span className="retro-pill bg-yellow px-3 py-1 text-xs font-black uppercase text-ink">
                      Good alternative
                    </span>
                  ) : null}
                </div>

                {recommendationCopy ? (
                  <p className="text-sm font-bold text-green">{recommendationCopy}</p>
                ) : null}
                {isPrimaryRecommendation ? (
                  <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-muted">
                    <span>Most chosen for similar requests</span>
                    <span>Best results for this type of task</span>
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-black text-ink">
                    {trustedByLabel} {"\u2022"} {bookedTimeLabel}
                  </div>
                  <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-black text-ink">
                    {getHelperReplyLine(responseSpeed)}
                  </div>
                  <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-black text-ink">
                    {portfolioCountLabel}
                  </div>
                  <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-black text-ink">
                    {bookedTimeLabel}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.14em]">
                  <span className="retro-pill bg-white px-3 py-1 text-muted">
                    {getCategoryLabel(helper.category)}
                  </span>
                  {demandLabel ? (
                    <span className="retro-pill bg-pink px-3 py-1 text-ink">
                      {topTierUrgency
                        ? "\uD83D\uDD25 High demand today"
                        : demandLabel === "High demand"
                          ? "High demand today"
                          : demandLabel}
                    </span>
                  ) : null}
                  {topTierUrgency ? (
                    <span className="retro-pill bg-yellow px-3 py-1 text-ink">
                      {"\u26A0\uFE0F Limited slots available"}
                    </span>
                  ) : null}
                  {popularityLabel ? (
                    <span className="retro-pill bg-green px-3 py-1 text-white">
                      {popularityLabel}
                    </span>
                  ) : null}
                  {helper.teamSize ? (
                    <span className="retro-pill bg-purple px-3 py-1 text-white">
                      Team of {helper.teamSize}
                    </span>
                  ) : null}
                  {urgencySignals
                    .filter((signal) => signal !== "Popular choice")
                    .slice(0, 1)
                    .map((signal) => (
                      <span
                        key={`${helper.id}-${signal}`}
                        className="retro-pill bg-white px-3 py-1 text-muted"
                      >
                        {signal}
                      </span>
                    ))}
                </div>

                {recommended ? (
                  <span className="text-xs font-bold text-green">
                    Match rule: category matches and specialty covers {matchingLabels.join(", ")}.
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="w-full space-y-3 xl:w-[220px]">
            <button
              type="button"
              onClick={() => handleMatch(helper.id)}
              disabled={Boolean(loadingId)}
              className={cn(
                buttonStyles({
                  tone: bestMatch ? "green" : recommended ? "green" : "purple",
                  size: "md",
                }),
                "w-full justify-center",
              )}
            >
              {loadingId === helper.id ? "Saving..." : "Get Help with Your Assignment \u2192"}
            </button>
            <Link
              href={`/helpers/${helper.id}?draftId=${request.draftId}`}
              onClick={() => trackHelperClick(helper.id)}
              className={cn(buttonStyles({ tone: "yellow", size: "sm" }), "w-full justify-center")}
            >
              View Profile
            </Link>
            {trustTrigger ? (
              <p className="text-[11px] font-semibold text-muted">{trustTrigger}</p>
            ) : null}
            {helper.portfolioItems.length ? (
              <div className="grid grid-cols-3 gap-2">
                {helper.portfolioItems.slice(0, 3).map((item) => (
                  <a
                    key={item.id}
                    href={item.externalLink || item.imageUrl}
                    onClick={() => trackHelperClick(helper.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-[16px] border-[3px] border-line bg-cream"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-20 w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
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
        {recommendedHelpers.length ? (
          <div className="space-y-4">
            <div>
              <div className="display-font text-3xl font-black">Best match for your request</div>
              <p className="mt-2 text-sm text-muted">
                These are ranked first using category match, urgency, and studio priority.
              </p>
            </div>
            {recommendedHelpers.map((helper, index) =>
              renderHelperCard(helper, {
                bestMatch: index === 0,
                emphasized: true,
              }),
            )}
          </div>
        ) : null}
        {displayedHelpers.length ? (
          <div className="pt-2">
            <div className="mb-4 border-t-[3px] border-dashed border-line pt-4">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                Other options
              </div>
            </div>
          </div>
        ) : null}
        {displayedHelpers.map((helper) => renderHelperCard(helper))}
        {collapsedHelpers.length > 0 ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllHelpers((current) => !current)}
              className={buttonStyles({ tone: "yellow", size: "md" })}
            >
              {showAllHelpers
                ? "Show less"
                : `View more (${collapsedHelpers.length})`}
            </button>
          </div>
        ) : null}
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
    paymentStatus: PaymentStatusValue;
    paymentProvider: string | null;
    paymentAmount: number | null;
    paymentCurrency: string | null;
    paymentLinkUrl: string | null;
    paymentLinkRef: string | null;
    paymentRef: string | null;
    paidAt: string | null;
    releaseReadyAt: string | null;
    releasedAt: string | null;
    releaseRef: string | null;
    paymentRequestedAt: string | null;
    refundedAt: string | null;
  };
  helpers: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [paymentError, setPaymentError] = useState("");
  const [paymentSaved, setPaymentSaved] = useState("");
  const [paymentPending, startPaymentTransition] = useTransition();
  const [form, setForm] = useState({
    status: lead.status,
    assignedHelperId: lead.assignedHelperId ?? "",
    dealClosed: lead.dealClosed,
    dealValue: lead.dealValue ? String(lead.dealValue) : "",
    notes: lead.notes,
  });
  const [paymentLinkAmount, setPaymentLinkAmount] = useState(
    lead.paymentAmount ? String(lead.paymentAmount / 100) : "",
  );
  const [paymentLinkNote, setPaymentLinkNote] = useState("");
  const [manualPaymentRef, setManualPaymentRef] = useState(lead.paymentRef ?? "");
  const [releaseRef, setReleaseRef] = useState(lead.releaseRef ?? "");
  const [actionNote, setActionNote] = useState("");

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

  function runPaymentAction(
    action:
      | "CREATE_PAYMENT_LINK"
      | "MARK_AS_PAID"
      | "MARK_RELEASE_READY"
      | "MARK_AS_RELEASED"
      | "MARK_AS_REFUNDED",
  ) {
    setPaymentError("");
    setPaymentSaved("");

    if (action === "MARK_AS_PAID" && !manualPaymentRef.trim() && !actionNote.trim()) {
      setPaymentError("Add a payment reference or internal note before marking this lead as paid manually.");
      return;
    }

    startPaymentTransition(async () => {
      if (action === "CREATE_PAYMENT_LINK") {
        const response = await fetch(`/api/admin/leads/${lead.id}/payment-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: paymentLinkAmount,
            note: paymentLinkNote || undefined,
          }),
        });

        const json = await response.json();

        if (!response.ok) {
          setPaymentError(json.error ?? "Could not create the payment link.");
          return;
        }

        setPaymentSaved(
          json.reusedExistingLink ? "Existing active payment link returned." : "Payment link created.",
        );
        router.refresh();
        return;
      }

      const response = await fetch(`/api/admin/leads/${lead.id}/payment-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          paymentRef: manualPaymentRef || undefined,
          releaseRef: releaseRef || undefined,
          note: actionNote || undefined,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        setPaymentError(json.error ?? "Could not update the payment state.");
        return;
      }

      setPaymentSaved(getPaymentActionSuccessMessage(action));
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
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

      <div className="retro-card space-y-5 bg-white p-6">
        <div>
          <div className="display-font text-2xl font-black">Secure Payment</div>
          <p className="mt-2 text-sm leading-7 text-muted">
            Payment received by CritOrbit and release managed after completion.
          </p>
          <p className="mt-2 rounded-[18px] border-[3px] border-line bg-yellow px-4 py-3 text-sm font-semibold text-ink">
            For initial rollout, verify paid status in ToyyibPay dashboard if webhook is delayed.
          </p>
        </div>

        <div className="rounded-[20px] border-[3px] border-line bg-paper p-4">
          <div className="text-sm font-black uppercase tracking-[0.14em] text-muted">
            Payment Lifecycle
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "UNPAID",
              "PAYMENT_LINK_SENT",
              "PAID",
              "RELEASE_READY",
              "RELEASED",
              "REFUNDED",
              "PAYMENT_FAILED",
              "PAYMENT_EXPIRED",
            ].map((status) => (
              <span
                key={status}
                className={cn(
                  "retro-pill px-3 py-1 text-xs font-black uppercase",
                  lead.paymentStatus === status ? "bg-purple text-white" : "bg-white text-ink",
                )}
              >
                {getPaymentStatusLabel(status as PaymentStatusValue)}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <PaymentMetaRow label="Provider" value={lead.paymentProvider ?? "-"} />
          <PaymentMetaRow label="Amount" value={formatCurrencyFromSen(lead.paymentAmount)} />
          <PaymentMetaRow label="Payment Status" value={getPaymentStatusLabel(lead.paymentStatus)} />
          <PaymentMetaRow label="Payment Link" value={lead.paymentLinkUrl ?? "-"} href={lead.paymentLinkUrl ?? undefined} />
          <PaymentMetaRow label="Payment Link Ref" value={lead.paymentLinkRef ?? "-"} />
          <PaymentMetaRow label="Payment Ref" value={lead.paymentRef ?? "-"} />
          <PaymentMetaRow label="Requested At" value={formatDateTime(lead.paymentRequestedAt)} />
          <PaymentMetaRow label="Paid At" value={formatDateTime(lead.paidAt)} />
          <PaymentMetaRow label="Release Ready At" value={formatDateTime(lead.releaseReadyAt)} />
          <PaymentMetaRow label="Released At" value={formatDateTime(lead.releasedAt)} />
          <PaymentMetaRow label="Release Ref" value={lead.releaseRef ?? "-"} />
          <PaymentMetaRow label="Refunded At" value={formatDateTime(lead.refundedAt)} />
        </div>

        <div className="space-y-4 rounded-[20px] border-[3px] border-line bg-cream p-4">
          <div className="text-sm font-black uppercase tracking-[0.14em] text-muted">
            Create Payment Link
          </div>
          <InputShell label="Amount (RM)" hint="Whole-number RM only. Example: 250">
            <input
              value={paymentLinkAmount}
              onChange={(event) => setPaymentLinkAmount(event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-white px-4 py-3 outline-none"
              inputMode="numeric"
              placeholder="250"
            />
          </InputShell>
          <div className="rounded-[18px] border-[3px] border-line bg-white px-4 py-3 text-sm font-semibold text-ink">
            You will charge: {formatPaymentPreview(paymentLinkAmount)}
          </div>
          <InputShell label="Optional Note">
            <textarea
              rows={3}
              value={paymentLinkNote}
              onChange={(event) => setPaymentLinkNote(event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-white px-4 py-3 outline-none"
              placeholder="Secure Payment for approved request"
            />
          </InputShell>
          <button
            type="button"
            disabled={paymentPending}
            onClick={() => runPaymentAction("CREATE_PAYMENT_LINK")}
            className={buttonStyles({ tone: "purple", size: "md", fullWidth: true })}
          >
            {paymentPending ? "Creating link..." : "Create Payment Link"}
          </button>
        </div>

        <div className="space-y-4 rounded-[20px] border-[3px] border-line bg-paper p-4">
          <div className="text-sm font-black uppercase tracking-[0.14em] text-muted">
            Admin Payment Controls
          </div>
          <InputShell
            label="Payment Ref (manual fallback)"
            hint="Required for manual paid fallback unless you add an internal note."
          >
            <input
              value={manualPaymentRef}
              onChange={(event) => setManualPaymentRef(event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-white px-4 py-3 outline-none"
              placeholder="TP5793119399122400030321"
            />
          </InputShell>
          <InputShell label="Release Ref">
            <input
              value={releaseRef}
              onChange={(event) => setReleaseRef(event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-white px-4 py-3 outline-none"
              placeholder="ADMIN_RELEASE_001"
            />
          </InputShell>
          <InputShell label="Internal Action Note" hint="Use this for audit trail during soft launch.">
            <textarea
              rows={3}
              value={actionNote}
              onChange={(event) => setActionNote(event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-white px-4 py-3 outline-none"
              placeholder="Optional internal note"
            />
          </InputShell>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={paymentPending}
              onClick={() => runPaymentAction("MARK_AS_PAID")}
              className={buttonStyles({ tone: "yellow", size: "md" })}
            >
              Mark as Paid
            </button>
            <button
              type="button"
              disabled={paymentPending}
              onClick={() => runPaymentAction("MARK_RELEASE_READY")}
              className={buttonStyles({ tone: "pink", size: "md" })}
            >
              Mark Release Ready
            </button>
            <button
              type="button"
              disabled={paymentPending}
              onClick={() => runPaymentAction("MARK_AS_RELEASED")}
              className={buttonStyles({ tone: "green", size: "md" })}
            >
              Mark as Released
            </button>
            <button
              type="button"
              disabled={paymentPending}
              onClick={() => runPaymentAction("MARK_AS_REFUNDED")}
              className={buttonStyles({ tone: "ink", size: "md" })}
            >
              Mark as Refunded
            </button>
          </div>
        </div>

        {paymentError ? <p className="text-sm font-bold text-red">{paymentError}</p> : null}
        {paymentSaved ? <p className="text-sm font-bold text-green">{paymentSaved}</p> : null}
      </div>
    </div>
  );
}

function PaymentMetaRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">{label}</div>
      <div className="mt-2 break-all text-sm font-semibold text-ink">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPaymentStatusLabel(status: PaymentStatusValue) {
  const labels: Record<PaymentStatusValue, string> = {
    UNPAID: "Unpaid",
    PAYMENT_LINK_SENT: "Payment link sent",
    PAID: "Payment received by CritOrbit",
    REFUNDED: "Refunded",
    RELEASE_READY: "Release managed after completion",
    RELEASED: "Released",
    PAYMENT_FAILED: "Payment failed",
    PAYMENT_EXPIRED: "Payment expired",
  };

  return labels[status];
}

function getPaymentActionSuccessMessage(
  action:
    | "CREATE_PAYMENT_LINK"
    | "MARK_AS_PAID"
    | "MARK_RELEASE_READY"
    | "MARK_AS_RELEASED"
    | "MARK_AS_REFUNDED",
) {
  const labels = {
    CREATE_PAYMENT_LINK: "Payment link created.",
    MARK_AS_PAID: "Payment marked as paid.",
    MARK_RELEASE_READY: "Lead marked release ready.",
    MARK_AS_RELEASED: "Lead marked released.",
    MARK_AS_REFUNDED: "Payment marked refunded.",
  } as const;

  return labels[action];
}

function formatPaymentPreview(value: string) {
  if (!/^\d+$/.test(value.trim())) {
    return "Enter a whole-number RM amount.";
  }

  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return "Enter a whole-number RM amount.";
  }

  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function closeModal() {
    if (pending) {
      return;
    }

    setOpen(false);
    setError("");
  }

  function deleteLead() {
    setError("");

    startTransition(async () => {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? "Could not delete the lead.");
        return;
      }

      router.push("/admin/leads");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className={buttonStyles({ tone: "pink", size: "md" })}
      >
        Delete Lead
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 py-6">
          <div className="retro-card w-full max-w-lg bg-white p-6">
            <div className="display-font text-3xl font-black">Delete this lead?</div>
            <p className="mt-3 text-sm leading-7 text-muted">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
            {error ? <p className="mt-4 text-sm font-bold text-red">{error}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={deleteLead}
                disabled={pending}
                className={buttonStyles({ tone: "ink", size: "md" })}
              >
                {pending ? "Deleting..." : "Yes, Delete Lead"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                disabled={pending}
                className={buttonStyles({ tone: "yellow", size: "md" })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
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
