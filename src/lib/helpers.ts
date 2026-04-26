import {
  categoryLabelMap,
  helperExperienceLevelLabelMap,
  helperPriceAnchorLabelMap,
  categoryTaskTypeMap,
  helperPriceTierLabelMap,
  helperStatusLabelMap,
  helperTrustLevelLabelMap,
  helperTypeLabelMap,
  taskTypeLabelMap,
} from "@/lib/constants";

export type HelperSpecialty = {
  code: string;
  label: string;
  taskTypes: string[];
};

export function slugifySpecialtyLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeHelperSpecialties(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((item) => {
    if (typeof item !== "object" || item === null) {
      return item;
    }

    const record = item as {
      code?: unknown;
      label?: unknown;
      taskTypes?: unknown;
    };
    const label = typeof record.label === "string" ? record.label.trim() : "";
    const code =
      typeof record.code === "string" && record.code.trim()
        ? record.code.trim()
        : slugifySpecialtyLabel(label);

    return {
      ...record,
      label,
      code,
    };
  });
}

export type HelperPortfolioItem = {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  externalLink?: string | null;
  displayOrder: number;
};

type HelperConversionProfileInput = {
  type: string;
  teamSize?: number | null;
  isVerified?: boolean;
  trustLevel?: string | null;
  projectsCompleted?: number | null;
  impressionCount?: number | null;
  clickCount?: number | null;
  selectionCount?: number | null;
  experienceLevel?: string | null;
  responseTime?: string | null;
  deliveryTime?: string | null;
  repeatClients?: number | null;
  priceTier?: string | null;
  priceAnchor?: string | null;
  portfolioItems?: Array<unknown>;
  specialties?: HelperSpecialty[];
};

export function getHelperTypeLabel(type: string) {
  return (
    helperTypeLabelMap[type as keyof typeof helperTypeLabelMap] ??
    type.replaceAll("_", " ")
  );
}

export function getHelperStatusLabel(status: string) {
  return (
    helperStatusLabelMap[status as keyof typeof helperStatusLabelMap] ??
    status.replaceAll("_", " ")
  );
}

export function getHelperExperienceLevelLabel(level: string) {
  return (
    helperExperienceLevelLabelMap[level as keyof typeof helperExperienceLevelLabelMap] ??
    level.replaceAll("_", " ")
  );
}

export function getHelperTrustLevel(input: {
  trustLevel?: string | null;
  isVerified?: boolean;
}) {
  if (
    input.trustLevel === "STANDARD_HELPER" ||
    input.trustLevel === "VERIFIED_HELPER" ||
    input.trustLevel === "TRUSTED_HELPER"
  ) {
    return input.trustLevel;
  }

  return input.isVerified ? "VERIFIED_HELPER" : "STANDARD_HELPER";
}

export function getHelperTrustLevelLabel(input: {
  trustLevel?: string | null;
  isVerified?: boolean;
}) {
  const trustLevel = getHelperTrustLevel(input);

  return helperTrustLevelLabelMap[trustLevel as keyof typeof helperTrustLevelLabelMap];
}

export function parseSpecialties(value: unknown): HelperSpecialty[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "code" in item &&
      "label" in item &&
      "taskTypes" in item &&
      typeof item.code === "string" &&
      typeof item.label === "string" &&
      Array.isArray(item.taskTypes)
    ) {
      return [
        {
          code: item.code,
          label: item.label,
          taskTypes: item.taskTypes.filter(
            (taskType: unknown): taskType is string => typeof taskType === "string",
          ),
        },
      ];
    }

    return [];
  });
}

export function parsePortfolioItems(value: unknown): HelperPortfolioItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "title" in item &&
      "imageUrl" in item &&
      "displayOrder" in item &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.imageUrl === "string" &&
      typeof item.displayOrder === "number"
    ) {
      return [
        {
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          description:
            "description" in item && typeof item.description === "string"
              ? item.description
              : null,
          externalLink:
            "externalLink" in item && typeof item.externalLink === "string"
              ? item.externalLink
              : null,
          displayOrder: item.displayOrder,
        },
      ];
    }

    return [];
  });
}

export function specialtyMatchesTaskType(
  specialties: HelperSpecialty[],
  taskType: string,
) {
  return specialties.some((specialty) => specialty.taskTypes.includes(taskType));
}

export function categoryMatches(helperCategory: string, requestCategory: string) {
  return helperCategory === requestCategory;
}

export function getCategoryLabel(category: string) {
  return (
    categoryLabelMap[category as keyof typeof categoryLabelMap] ??
    category.replaceAll("_", " ")
  );
}

export function getTaskTypeLabel(taskType: string) {
  return (
    taskTypeLabelMap[taskType as keyof typeof taskTypeLabelMap] ??
    taskType.replaceAll("_", " ")
  );
}

export function isTaskTypeAllowedForCategory(category: string, taskType: string) {
  const allowedTaskTypes =
    categoryTaskTypeMap[category as keyof typeof categoryTaskTypeMap];

  return Boolean(allowedTaskTypes?.includes(taskType as never));
}

export function helperMatchesRequest(input: {
  helperCategory: string;
  requestCategory: string;
  specialties: HelperSpecialty[];
  requestTaskType: string;
}) {
  return (
    categoryMatches(input.helperCategory, input.requestCategory) &&
    specialtyMatchesTaskType(input.specialties, input.requestTaskType)
  );
}

export function getHelperMatchPriority(input: {
  helperCategory: string;
  requestCategory: string;
  specialties: HelperSpecialty[];
  requestTaskType: string;
}) {
  const categoryMatch = categoryMatches(
    input.helperCategory,
    input.requestCategory,
  );
  const taskTypeMatch = specialtyMatchesTaskType(
    input.specialties,
    input.requestTaskType,
  );

  if (categoryMatch && taskTypeMatch) {
    return 0;
  }

  if (categoryMatch) {
    return 1;
  }

  if (taskTypeMatch) {
    return 2;
  }

  return 3;
}

export function getHelperProjectsCompleted(
  input: HelperConversionProfileInput,
) {
  if ((input.projectsCompleted ?? 0) > 0) {
    return input.projectsCompleted ?? 0;
  }

  const specialtyCount = input.specialties?.length ?? 0;
  const portfolioCount = input.portfolioItems?.length ?? 0;

  if (input.type === "TEAM") {
    return Math.max(100, input.teamSize ? input.teamSize * 40 : 100);
  }

  if (specialtyCount || portfolioCount) {
    return Math.max(24, specialtyCount * 18 + portfolioCount * 12);
  }

  return 0;
}

export function getHelperResponseSpeed(input: HelperConversionProfileInput) {
  if (input.responseTime?.trim()) {
    return input.responseTime.trim();
  }

  if (input.type === "TEAM") {
    return "Responds within 1 hour";
  }

  return input.isVerified ? "Responds within 1 hour" : "Fast turnaround";
}

export function getHelperDeliveryTime(input: HelperConversionProfileInput) {
  if (input.deliveryTime?.trim()) {
    return input.deliveryTime.trim();
  }

  if (input.type === "TEAM") {
    return "24-48h";
  }

  return input.isVerified ? "24-48h" : "Fast turnaround";
}

export function getHelperPriceAnchor(input: HelperConversionProfileInput) {
  if (input.priceAnchor) {
    const priceAnchorLabel =
      helperPriceAnchorLabelMap[input.priceAnchor as keyof typeof helperPriceAnchorLabelMap];

    if (priceAnchorLabel) {
      if (input.priceAnchor === "BELOW_RM100") {
        return priceAnchorLabel;
      }

      return `From ${priceAnchorLabel}`;
    }
  }

  const priceTier =
    input.priceTier ?? getRecommendedPriceTier(input);

  if (priceTier === "PREMIUM") {
    return "From RM120";
  }

  if (priceTier === "STANDARD") {
    return "From RM100";
  }

  return "From RM80";
}

export function getRecommendedPriceTier(input: HelperConversionProfileInput) {
  if (getHelperTrustLevel(input) === "TRUSTED_HELPER") {
    return "PREMIUM";
  }

  if (input.type === "TEAM") {
    return "PREMIUM";
  }

  const projectsCompleted = getHelperProjectsCompleted(input);
  if (projectsCompleted >= 120 || input.isVerified) {
    return "PREMIUM";
  }

  if (projectsCompleted >= 40) {
    return "STANDARD";
  }

  return "BUDGET";
}

export function getHelperPriceTierLabel(priceTier: string) {
  return (
    helperPriceTierLabelMap[priceTier as keyof typeof helperPriceTierLabelMap] ??
    "Balanced choice"
  );
}

export function getHelperPriceTierReason(priceTier: string) {
  if (priceTier === "PREMIUM") {
    return "Best for urgent deadlines";
  }

  if (priceTier === "STANDARD") {
    return "Most balanced choice";
  }

  return "Good for simple tasks";
}

function getPriceTierRank(priceTier: string | null | undefined) {
  if (priceTier === "PREMIUM") {
    return 0;
  }

  if (priceTier === "STANDARD") {
    return 1;
  }

  return 2;
}

function getTrustLevelRank(input: HelperConversionProfileInput) {
  const trustLevel = getHelperTrustLevel(input);

  if (trustLevel === "TRUSTED_HELPER") {
    return 0;
  }

  if (trustLevel === "VERIFIED_HELPER") {
    return 1;
  }

  return 2;
}

export function getHelperUrgencySignals(input: HelperConversionProfileInput) {
  const signals = [getHelperLastActiveLabel(input), getHelperBookedLabel(input)];

  if (input.type === "TEAM") {
    signals.push("Popular choice");
  } else if (getHelperProjectsCompleted(input) >= 40) {
    signals.push("Chosen by students");
  } else {
    signals.push("Limited slots");
  }

  return signals;
}

export function getHelperLastActiveLabel(input: HelperConversionProfileInput) {
  return input.type === "TEAM" ? "Recently active" : "Last active today";
}

export function getHelperBookedLabel(input: HelperConversionProfileInput) {
  return input.type === "TEAM" ? "Booked recently" : "Picked recently";
}

export function isFastResponseText(responseSpeed: string) {
  const normalized = responseSpeed.toLowerCase();

  return (
    normalized.includes("1 hour") ||
    normalized.includes("under 1 hour") ||
    normalized.includes("within an hour")
  );
}

export function getHelperTrustedByLabel(input: HelperConversionProfileInput) {
  const trustedCount =
    (input.selectionCount ?? 0) >= 5
      ? input.selectionCount ?? 0
      : getHelperProjectsCompleted(input);

  if (trustedCount > 0) {
    return `Trusted by ${trustedCount} student${trustedCount === 1 ? "" : "s"}`;
  }

  return "Trusted by students";
}

export function getHelperPastWorksLabel(portfolioCount: number) {
  if (portfolioCount > 0) {
    return `${portfolioCount} past work${portfolioCount === 1 ? "" : "s"} available`;
  }

  return "Past works available on request";
}

export function getHelperBookedTimeLabel(input: HelperConversionProfileInput) {
  const selectionCount = input.selectionCount ?? 0;
  const clickCount = input.clickCount ?? 0;

  if (selectionCount >= 15 || clickCount >= 30) {
    return "Last booked 1 hour ago";
  }

  if (selectionCount >= 8 || clickCount >= 15) {
    return "Last booked 3 hours ago";
  }

  return input.type === "TEAM" ? "Last booked 4 hours ago" : "Last booked 6 hours ago";
}

export function getHelperReplyLine(responseSpeed: string) {
  const normalized = responseSpeed.trim();

  if (/responds within\s+/i.test(normalized)) {
    return `Usually replies within ${normalized.replace(/^responds within\s+/i, "")}`;
  }

  if (/within\s+/i.test(normalized)) {
    return `Usually replies ${normalized}`;
  }

  if (/fast turnaround/i.test(normalized)) {
    return "Usually replies fast";
  }

  return normalized;
}

export function getHelperCardSpecialties(
  specialties: HelperSpecialty[],
  limit = 3,
) {
  return specialties.slice(0, limit);
}

export function getHelperDetailPitch(input: {
  category: string;
  type: string;
  projectsCompleted: number;
}) {
  const category = getCategoryLabel(input.category);

  if (input.type === "TEAM") {
    return [
      `Specialized in ${category}.`,
      `Handled ${input.projectsCompleted}+ student projects.`,
      "Known for fast delivery and polished presentation quality.",
    ];
  }

  return [
    `Focused on ${category}.`,
    `Handled ${input.projectsCompleted}+ student requests.`,
    "Known for clear communication and dependable turnaround.",
  ];
}

export function compareHelpersForConversion(
  left: HelperConversionProfileInput & { displayOrder?: number; name?: string },
  right: HelperConversionProfileInput & { displayOrder?: number; name?: string },
) {
  const leftPriceTier = left.priceTier ?? getRecommendedPriceTier(left);
  const rightPriceTier = right.priceTier ?? getRecommendedPriceTier(right);
  const leftTrustRank = getTrustLevelRank(left);
  const rightTrustRank = getTrustLevelRank(right);

  if (left.type !== right.type) {
    return left.type === "TEAM" ? -1 : 1;
  }

  if (leftTrustRank !== rightTrustRank) {
    return leftTrustRank - rightTrustRank;
  }

  const leftTierRank = getPriceTierRank(leftPriceTier);
  const rightTierRank = getPriceTierRank(rightPriceTier);
  if (leftTierRank !== rightTierRank) {
    return leftTierRank - rightTierRank;
  }

  const leftProjects = getHelperProjectsCompleted(left);
  const rightProjects = getHelperProjectsCompleted(right);
  if (leftProjects !== rightProjects) {
    return rightProjects - leftProjects;
  }

  const leftSelections = left.selectionCount ?? 0;
  const rightSelections = right.selectionCount ?? 0;
  if (leftSelections !== rightSelections) {
    return rightSelections - leftSelections;
  }

  if (Boolean(left.isVerified) !== Boolean(right.isVerified)) {
    return left.isVerified ? -1 : 1;
  }

  if ((left.displayOrder ?? 0) !== (right.displayOrder ?? 0)) {
    return (left.displayOrder ?? 0) - (right.displayOrder ?? 0);
  }

  return (left.name ?? "").localeCompare(right.name ?? "");
}

function getUrgencyRank(urgency: string) {
  if (urgency === "ASAP") {
    return 0;
  }

  if (urgency === "NORMAL") {
    return 1;
  }

  return 2;
}

function getDeliveryRank(deliveryTime: string) {
  const normalized = deliveryTime.toLowerCase();

  if (normalized.includes("1 hour") || normalized.includes("same day") || normalized.includes("24")) {
    return 0;
  }

  if (normalized.includes("48") || normalized.includes("2 day")) {
    return 1;
  }

  return 2;
}

export function getRecommendedHelpers<T extends HelperConversionProfileInput & {
  category: string;
  specialties: HelperSpecialty[];
}>(
  helpers: T[],
  request: {
    category: string;
    taskType: string;
    urgency: string;
  },
  limit = 2,
) {
  return [...helpers]
    .filter((helper) =>
      helperMatchesRequest({
        helperCategory: helper.category,
        requestCategory: request.category,
        specialties: helper.specialties,
        requestTaskType: request.taskType,
      }),
    )
    .sort((left, right) => {
      const leftPriceTier = left.priceTier ?? getRecommendedPriceTier(left);
      const rightPriceTier = right.priceTier ?? getRecommendedPriceTier(right);
      const leftTierRank = getPriceTierRank(leftPriceTier);
      const rightTierRank = getPriceTierRank(rightPriceTier);
      if (leftTierRank !== rightTierRank) {
        return leftTierRank - rightTierRank;
      }

      const leftTypeBonus = left.type === "TEAM" ? 0 : 1;
      const rightTypeBonus = right.type === "TEAM" ? 0 : 1;
      if (leftTypeBonus !== rightTypeBonus) {
        return leftTypeBonus - rightTypeBonus;
      }

      const urgencyRank = getUrgencyRank(request.urgency);
      const leftDelivery = getDeliveryRank(getHelperDeliveryTime(left));
      const rightDelivery = getDeliveryRank(getHelperDeliveryTime(right));
      if (urgencyRank < 2 && leftDelivery !== rightDelivery) {
        return leftDelivery - rightDelivery;
      }

      const conversionSort = compareHelpersForConversion(left, right);
      if (conversionSort !== 0) {
        return conversionSort;
      }

      return 0;
    })
    .slice(0, limit);
}

export function getApplicationExperienceRank(experience: string) {
  const numericValues = Array.from(
    experience.matchAll(/\d+(?:\.\d+)?/g),
    (match) => Number(match[0]),
  ).filter((value) => Number.isFinite(value));

  if (numericValues.length > 0) {
    return Math.max(...numericValues);
  }

  return Math.min(experience.trim().length / 12, 10);
}
