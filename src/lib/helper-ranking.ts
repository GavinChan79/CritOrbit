import { getHelperProfileCompletion } from "@/lib/helper-dashboard";
import { getHelperResponseSpeed, isFastResponseText } from "@/lib/helpers";

export type HelperConversionTier = "TOP_PICK" | "POPULAR" | "STANDARD";

export type HelperRankingInput = {
  id: string;
  type: string;
  isVerified?: boolean;
  trustLevel?: string | null;
  responseTime?: string | null;
  projectsCompleted?: number | null;
  studentsHelpedCount?: number | null;
  portfolioItemsCount?: number;
  completionScore?: number;
  categoryMatch?: boolean;
  taskTypeMatch?: boolean;
  profileViewCount?: number;
  getHelpClickCount?: number;
  whatsappRedirectCount?: number;
  lastBookedAt?: Date | string | null;
};

export type RankedHelper<T> = T & {
  conversionScore: number;
  conversionTier: HelperConversionTier;
};

function getTrustPriority(input: HelperRankingInput) {
  if (input.trustLevel === "TRUSTED_HELPER") {
    return 0;
  }

  if (input.trustLevel === "VERIFIED_HELPER" || input.isVerified) {
    return 1;
  }

  return 2;
}

function getMatchPriority(input: HelperRankingInput) {
  if (input.categoryMatch && input.taskTypeMatch) {
    return 0;
  }

  if (input.categoryMatch) {
    return 1;
  }

  if (input.taskTypeMatch) {
    return 2;
  }

  return 3;
}

export function getHelperPerformanceMultiplier(input: HelperRankingInput) {
  const views = input.profileViewCount ?? 0;
  const clicks = input.getHelpClickCount ?? 0;
  const whatsapp = input.whatsappRedirectCount ?? 0;

  if (views < 20) {
    return 1;
  }

  const ctr = clicks / views;
  const waRate = whatsapp / views;
  let multiplier = 1;

  if (waRate > 0.25) {
    multiplier += 0.15;
  } else if (waRate > 0.15) {
    multiplier += 0.08;
  }

  if (views > 50 && ctr < 0.05) {
    multiplier -= 0.1;
  }

  return Math.min(1.25, Math.max(0.85, multiplier));
}

export function getHelperBaseConversionScore(input: HelperRankingInput) {
  let score = 0;

  if (input.trustLevel === "TRUSTED_HELPER") {
    score += 90;
  } else if (input.trustLevel === "VERIFIED_HELPER" || input.isVerified) {
    score += 50;
  }

  if (input.categoryMatch) {
    score += 25;
  }

  if (input.taskTypeMatch) {
    score += 20;
  }

  const portfolioCount = input.portfolioItemsCount ?? 0;
  if (portfolioCount > 10) {
    score += 30;
  } else if (portfolioCount >= 4) {
    score += 20;
  } else if (portfolioCount >= 1) {
    score += 10;
  }

  const completedJobs = input.studentsHelpedCount ?? input.projectsCompleted ?? 0;
  if (completedJobs > 20) {
    score += 30;
  } else if (completedJobs >= 6) {
    score += 20;
  } else if (completedJobs >= 1) {
    score += 10;
  }

  const normalizedCompletionScore = Math.max(0, Math.min(100, input.completionScore ?? 0));
  score += Math.round((normalizedCompletionScore / 100) * 30);

  const responseSpeed = getHelperResponseSpeed({
    type: input.type,
    isVerified: input.isVerified,
    trustLevel: input.trustLevel,
    responseTime: input.responseTime,
  });

  if (isFastResponseText(responseSpeed)) {
    score += 15;
  }

  if (input.type === "TEAM") {
    score += 10;
  }

  if (input.lastBookedAt) {
    const bookedAt = new Date(input.lastBookedAt);

    if (!Number.isNaN(bookedAt.getTime())) {
      const elapsedMs = Date.now() - bookedAt.getTime();
      const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

      if (elapsedDays <= 1) {
        score += 15;
      } else if (elapsedDays <= 7) {
        score += 10;
      } else if (elapsedDays <= 30) {
        score += 5;
      }
    }
  }

  return score;
}

export function getHelperConversionScore(input: HelperRankingInput) {
  const baseScore = getHelperBaseConversionScore(input);
  const multiplier = getHelperPerformanceMultiplier(input);

  return Math.round(baseScore * multiplier);
}

export function getHelperConversionTier(index: number, total: number): HelperConversionTier {
  if (total <= 0) {
    return "STANDARD";
  }

  const topPickCount = Math.max(1, Math.ceil(total * 0.1));
  const popularCount = Math.max(1, Math.ceil(total * 0.2));

  if (index < topPickCount) {
    return "TOP_PICK";
  }

  if (index < topPickCount + popularCount) {
    return "POPULAR";
  }

  return "STANDARD";
}

export function rankHelpersByConversion<T extends HelperRankingInput>(
  helpers: T[],
): Array<RankedHelper<T>> {
  const scored = helpers
    .map((helper) => ({
      ...helper,
      conversionScore: getHelperConversionScore(helper),
      trustPriority: getTrustPriority(helper),
      matchPriority: getMatchPriority(helper),
    }))
    .sort((left, right) => {
      if (left.trustPriority !== right.trustPriority) {
        return left.trustPriority - right.trustPriority;
      }

      if (left.matchPriority !== right.matchPriority) {
        return left.matchPriority - right.matchPriority;
      }

      if (left.conversionScore !== right.conversionScore) {
        return right.conversionScore - left.conversionScore;
      }

      const leftProjects = left.studentsHelpedCount ?? left.projectsCompleted ?? 0;
      const rightProjects = right.studentsHelpedCount ?? right.projectsCompleted ?? 0;
      if (leftProjects !== rightProjects) {
        return rightProjects - leftProjects;
      }

      const leftRedirects = left.whatsappRedirectCount ?? 0;
      const rightRedirects = right.whatsappRedirectCount ?? 0;
      if (leftRedirects !== rightRedirects) {
        return rightRedirects - leftRedirects;
      }

      return left.id.localeCompare(right.id);
    });

  return scored.map((helper, index) => ({
    ...helper,
    conversionTier: getHelperConversionTier(index, scored.length),
  }));
}

export function getHelperCompletionScore(input: {
  name: string;
  shortBio: string;
  email?: string | null;
  whatsappNumber?: string | null;
  responseTime?: string | null;
  deliveryTime?: string | null;
  portfolioNote?: string | null;
  specialties: unknown;
  type: "INDIVIDUAL" | "TEAM";
  trustLevel?: string | null;
  teamSize?: number | null;
  portfolioItemsCount?: number;
  verificationStatus?: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
}) {
  return getHelperProfileCompletion(input).percent;
}

export function getHelperConversionTierLabel(tier: HelperConversionTier) {
  if (tier === "TOP_PICK") {
    return "Top Pick";
  }

  if (tier === "POPULAR") {
    return "Popular";
  }

  return "Standard";
}
