import { LeadStatus } from "@prisma/client";

type HelperLeadSummaryInput = {
  status: LeadStatus;
  dealClosed: boolean;
  dealValue: number | null;
};

type HelperProfileCompletionInput = {
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
};

export function getHelperAssignedLeadSummary(leads: HelperLeadSummaryInput[]) {
  const completedJobs = leads.filter((lead) => lead.status === LeadStatus.COMPLETED);
  const totalDealValue = completedJobs.reduce((total, lead) => {
    if (!lead.dealClosed || !lead.dealValue) {
      return total;
    }

    return total + lead.dealValue;
  }, 0);

  return {
    totalAssignedLeads: leads.length,
    completedJobsCount: completedJobs.length,
    totalDealValue,
  };
}

export function getHelperProfileCompletion(input: HelperProfileCompletionInput) {
  const checks = [
    {
      key: "name",
      label: "Basic name",
      complete: Boolean(input.name.trim()),
    },
    {
      key: "bio",
      label: "Short bio",
      complete: input.shortBio.trim().length >= 12,
    },
    {
      key: "email",
      label: "Linked email",
      complete: Boolean(input.email?.trim()),
    },
    {
      key: "whatsapp",
      label: "WhatsApp number",
      complete: Boolean(input.whatsappNumber?.trim()),
    },
    {
      key: "response",
      label: "Response speed",
      complete: Boolean(input.responseTime?.trim()),
    },
    {
      key: "delivery",
      label: "Delivery time",
      complete: Boolean(input.deliveryTime?.trim()),
    },
    {
      key: "portfolioNote",
      label: "Portfolio note",
      complete: Boolean(input.portfolioNote?.trim()),
    },
    {
      key: "specialties",
      label: "Specialties",
      complete: Array.isArray(input.specialties) && input.specialties.length > 0,
    },
    {
      key: "portfolioUpload",
      label: "Portfolio uploaded",
      complete: (input.portfolioItemsCount ?? 0) > 0,
    },
    {
      key: "verificationSubmitted",
      label: "Verification submitted",
      complete:
        input.verificationStatus === "PENDING" ||
        input.verificationStatus === "VERIFIED" ||
        input.verificationStatus === "REJECTED",
    },
    {
      key: "verificationApproved",
      label: "Verification approved",
      complete: input.verificationStatus === "VERIFIED",
    },
    {
      key: "teamSize",
      label: "Team size",
      complete: input.type === "TEAM" ? Boolean(input.teamSize && input.teamSize > 0) : true,
    },
  ];

  const total = checks.length;
  const completed = checks.filter((check) => check.complete).length;
  const percent = Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percent,
    label: percent === 100 ? "Complete" : `${percent}% complete`,
    checks,
  };
}
