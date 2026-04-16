import { ADMIN_WHATSAPP_NUMBER } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export function buildWhatsappMessage(input: {
  category: string;
  taskType: string;
  urgency: string;
  deadline: Date | string;
  budget?: number | null;
  helperName: string;
  description?: string | null;
}) {
  const budgetLine = input.budget ? `RM${input.budget}` : "Not specified";
  const preferredHelper = cleanLine(input.helperName, "Not specified");
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
    "",
    "Details:",
    details,
  ].join("\n");
}

export function buildWhatsappUrl(message: string) {
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function cleanLine(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();
  if (!normalized || normalized.toLowerCase() === "undefined" || normalized.toLowerCase() === "null") {
    return fallback;
  }

  return normalized;
}
