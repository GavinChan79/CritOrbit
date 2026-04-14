import {
  LeadTemperature,
  LeadUrgency,
} from "@prisma/client";

export function scoreUrgency(urgency: LeadUrgency) {
  switch (urgency) {
    case "ASAP":
      return 3;
    case "NORMAL":
      return 2;
    case "RELAXED":
    default:
      return 1;
  }
}

export function scoreBudget(budget?: number | null) {
  if (!budget || budget < 100) {
    return 1;
  }

  if (budget >= 200) {
    return 3;
  }

  return 2;
}

export function calculateLeadScore(input: {
  urgency: LeadUrgency;
  budget?: number | null;
  description?: string | null;
  helperSelected?: boolean;
}) {
  const descriptionScore = input.description?.trim() ? 1 : 0;
  const helperScore = input.helperSelected ? 1 : 0;

  return (
    scoreUrgency(input.urgency) +
    scoreBudget(input.budget) +
    descriptionScore +
    helperScore
  );
}

export function getLeadTemperature(score: number): LeadTemperature {
  if (score >= 7) {
    return "HOT";
  }

  if (score >= 4) {
    return "WARM";
  }

  return "COLD";
}

export function getLeadTemperatureLabel(score: number) {
  if (score >= 7) {
    return "Hot";
  }

  if (score >= 4) {
    return "Warm";
  }

  return "Cold";
}

export function getDerivedLeadMetrics(score: number) {
  return {
    leadScore: score,
    leadTemperature: getLeadTemperature(score),
  };
}
