import { getHelperProfileCompletion } from "@/lib/helper-dashboard";
import { getHelperResponseSpeed, isFastResponseText } from "@/lib/helpers";

export type HelperConversionTier = "TOP_PICK" | "POPULAR" | "STANDARD";

export type HelperRankingInput = {
  id: string;
  type: string;
  isVerified?: boolean;
  responseTime?: string | null;
  projectsCompleted?: number | null;
  portfolioItemsCount?: number;
  completionScore?: number;
};

export type RankedHelper<T> = T & {
  conversionScore: number;
  conversionTier: HelperConversionTier;
};

export function getHelperConversionScore(input: HelperRankingInput) {
  let score = 0;

  if (input.isVerified) {
    score += 50;
  }

  const portfolioCount = input.portfolioItemsCount ?? 0;
  if (portfolioCount > 10) {
    score += 30;
  } else if (portfolioCount >= 4) {
    score += 20;
  } else if (portfolioCount >= 1) {
    score += 10;
  }

  const completedJobs = input.projectsCompleted ?? 0;
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
    responseTime: input.responseTime,
  });

  if (isFastResponseText(responseSpeed)) {
    score += 15;
  }

  if (input.type === "TEAM") {
    score += 10;
  }

  return score;
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
    }))
    .sort((left, right) => {
      if (left.conversionScore !== right.conversionScore) {
        return right.conversionScore - left.conversionScore;
      }

      const leftProjects = left.projectsCompleted ?? 0;
      const rightProjects = right.projectsCompleted ?? 0;
      if (leftProjects !== rightProjects) {
        return rightProjects - leftProjects;
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
