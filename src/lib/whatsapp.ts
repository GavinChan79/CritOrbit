import { ADMIN_WHATSAPP_NUMBER } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getLeadInviteResponseUrl } from "@/lib/lead-invite-response";

export function buildWhatsappMessage(input: {
  category: string;
  taskType: string;
  urgency: string;
  deadline: Date | string;
  budget?: number | null;
  preferredHelperName: string;
  preferredHelperTrustLevel?: string | null;
  preferredHelperStartingPrice?: string | null;
  description?: string | null;
  leadId?: string | null;
  draftId?: string | null;
}) {
  const budgetLine = input.budget ? `RM${input.budget}` : "Not specified";
  const preferredHelper = cleanLine(input.preferredHelperName, "Not specified");
  const preferredHelperTrustLevel = cleanLine(
    input.preferredHelperTrustLevel,
    "Not specified",
  );
  const preferredHelperStartingPrice = cleanLine(
    input.preferredHelperStartingPrice,
    "Not specified",
  );
  const details = cleanLine(input.description, "Not provided");

  return [
    "Hi, I need help with an assignment.",
    "",
    `Course: ${cleanLine(input.category, "Not specified")}`,
    `Task: ${cleanLine(input.taskType, "Not specified")}`,
    `Urgency: ${cleanLine(input.urgency, "Not specified")}`,
    `Deadline: ${formatDate(input.deadline)}`,
    `Budget: ${budgetLine}`,
    `Preferred Helper: ${preferredHelper}`,
    `Preferred Helper Trust Level: ${preferredHelperTrustLevel}`,
    `Helper Starting Price: ${preferredHelperStartingPrice}`,
    `Lead ID: ${cleanLine(input.leadId, "Not available")}`,
    `Draft ID: ${cleanLine(input.draftId, "Not available")}`,
    "",
    "Brief:",
    details,
  ].join("\n");
}

export function buildWhatsappUrl(message: string) {
  return buildWhatsappUrlForNumber(ADMIN_WHATSAPP_NUMBER, message);
}

export function buildWhatsappUrlForNumber(phoneNumber: string, message: string) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function buildHelperInviteWhatsappMessage(input: {
  category: string;
  taskType: string;
  deadline: Date | string;
  budget?: number | null;
  briefSummary?: string | null;
  acceptedToken: string;
  unavailableToken: string;
}) {
  const interestedUrl = getLeadInviteResponseUrl(input.acceptedToken, "accepted");
  const unavailableUrl = getLeadInviteResponseUrl(input.unavailableToken, "unavailable");
  const budgetLine = input.budget ? `RM${input.budget}` : "Flexible";
  const shortBrief = summarizeInviteBrief(input.briefSummary);

  return [
    "New CritOrbit lead invite",
    "",
    `Course: ${cleanLine(input.category, "Not specified")}`,
    `Task: ${cleanLine(input.taskType, "Not specified")}`,
    `Deadline: ${formatDate(input.deadline)}`,
    `Budget: ${budgetLine}`,
    `Brief: ${shortBrief}`,
    "",
    `Interested: ${interestedUrl}`,
    `Not Available: ${unavailableUrl}`,
  ].join("\n");
}

function cleanLine(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();
  if (!normalized || normalized.toLowerCase() === "undefined" || normalized.toLowerCase() === "null") {
    return fallback;
  }

  return normalized;
}

function summarizeInviteBrief(value: string | null | undefined) {
  const normalized = cleanLine(value, "No brief provided.")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= 140) {
    return normalized;
  }

  return `${normalized.slice(0, 137).trimEnd()}...`;
}
