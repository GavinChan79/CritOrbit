import { Lead, LeadStatus } from "@prisma/client";

type FunnelLead = Pick<
  Lead,
  "status" | "selectedHelperId" | "assignedHelperId" | "dealClosed" | "dealValue"
>;

type UserSummaryLead = Pick<Lead, "status">;

export function calculateLeadFunnel(leads: FunnelLead[]) {
  const totalLeads = leads.length;
  const userSelectedCount = leads.filter((lead) => Boolean(lead.selectedHelperId)).length;
  const adminAssignedCount = leads.filter((lead) => Boolean(lead.assignedHelperId)).length;
  const contactedCount = leads.filter((lead) =>
    ["CONTACTED", "ASSIGNED", "COMPLETED"].includes(lead.status),
  ).length;
  const closedDealsCount = leads.filter((lead) => lead.dealClosed).length;
  const revenue = leads.reduce(
    (sum, lead) => sum + (lead.dealClosed ? lead.dealValue ?? 0 : 0),
    0,
  );

  return {
    totalLeads,
    userSelectedCount,
    adminAssignedCount,
    contactedCount,
    closedDealsCount,
    revenue,
    conversionRate: totalLeads ? Math.round((closedDealsCount / totalLeads) * 100) : 0,
  };
}

export function getUserRequestSummary(leads: UserSummaryLead[]) {
  return {
    activeCount: leads.filter((lead) => lead.status !== "COMPLETED").length,
    completedCount: leads.filter((lead) => lead.status === "COMPLETED").length,
    waitingForAdminCount: leads.filter((lead) => lead.status === "NEW").length,
  };
}

export function getStatusTone(status: LeadStatus) {
  switch (status) {
    case "COMPLETED":
      return "green";
    case "ASSIGNED":
      return "purple";
    case "CONTACTED":
      return "blue";
    case "NEW":
    default:
      return "yellow";
  }
}
