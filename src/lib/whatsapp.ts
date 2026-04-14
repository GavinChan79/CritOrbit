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
  const budgetLine = input.budget ? `RM${input.budget}` : "Flexible / not specified";

  return [
    "Hi, I need help with my assignment!",
    "",
    `Course: ${input.category}`,
    `Task: ${input.taskType}`,
    `Urgency: ${input.urgency}`,
    `Deadline: ${formatDate(input.deadline)}`,
    `Budget: ${budgetLine}`,
    `Preferred Helper: ${input.helperName}`,
    `Details: ${input.description?.trim() || "-"}`,
  ].join("\n");
}

export function buildWhatsappUrl(message: string) {
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
