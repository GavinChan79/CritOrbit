export const APP_NAME = "CritOrbit";
export const APP_TAGLINE = "Find the right help. Get it done.";
export const APP_POWERED_BY = "Powered by CritOrbit";
export const ADMIN_WHATSAPP_NUMBER =
  process.env.ADMIN_WHATSAPP_NUMBER ?? "601161241368";

export const helperTypeValues = ["INDIVIDUAL", "TEAM"] as const;
export const helperStatusValues = ["PENDING", "APPROVED", "REJECTED", "ACTIVE"] as const;
export const helperPriceTierValues = ["BUDGET", "STANDARD", "PREMIUM"] as const;

export const helperTypeLabelMap: Record<(typeof helperTypeValues)[number], string> = {
  INDIVIDUAL: "Individual",
  TEAM: "Studio",
};

export const helperStatusLabelMap: Record<(typeof helperStatusValues)[number], string> = {
  PENDING: "Under review (3-7 days)",
  APPROVED: "You're approved. Preparing your profile.",
  REJECTED: "Rejected",
  ACTIVE: "Live on platform",
};

export const helperPriceTierLabelMap: Record<
  (typeof helperPriceTierValues)[number],
  string
> = {
  BUDGET: "Affordable option",
  STANDARD: "Balanced choice",
  PREMIUM: "Top quality • Fast delivery",
};

export const helperTypeOptions = helperTypeValues.map((value) => ({
  value,
  label: helperTypeLabelMap[value],
})) as ReadonlyArray<{ value: (typeof helperTypeValues)[number]; label: string }>;

export const helperStatusOptions = helperStatusValues.map((value) => ({
  value,
  label: helperStatusLabelMap[value],
})) as ReadonlyArray<{ value: (typeof helperStatusValues)[number]; label: string }>;

export const helperPriceTierOptions = helperPriceTierValues.map((value) => ({
  value,
  label: helperPriceTierLabelMap[value],
})) as ReadonlyArray<{ value: (typeof helperPriceTierValues)[number]; label: string }>;

export const categoryValues = [
  "INTERIOR_DESIGN",
  "ARCHITECTURE",
  "FINANCE",
  "BUSINESS",
  "ECONOMICS",
  "INVESTMENT",
  "CORPORATE_GOVERNANCE",
  "ETHICS",
  "MARKETING",
] as const;

export const categoryLabelMap: Record<(typeof categoryValues)[number], string> = {
  INTERIOR_DESIGN: "Interior Design",
  ARCHITECTURE: "Architecture",
  FINANCE: "Finance",
  BUSINESS: "Business",
  ECONOMICS: "Economics",
  INVESTMENT: "Investment",
  CORPORATE_GOVERNANCE: "Corporate Governance",
  ETHICS: "Ethics",
  MARKETING: "Marketing",
};

export const categoryOptions = categoryValues.map((value) => ({
  value,
  label: categoryLabelMap[value],
})) as ReadonlyArray<{ value: (typeof categoryValues)[number]; label: string }>;

export const taskTypeValues = [
  "RENDERING",
  "LAYOUT",
  "PORTFOLIO",
  "PRESENTATION_BOARD",
  "REPORT",
  "CASE_STUDY",
  "FINANCIAL_ANALYSIS",
  "CALCULATION_MODEL",
  "PRESENTATION_SLIDES",
  "ESSAY",
  "RESEARCH_ANALYSIS",
  "OTHERS",
] as const;

export const taskTypeLabelMap: Record<(typeof taskTypeValues)[number], string> = {
  RENDERING: "Rendering",
  LAYOUT: "Layout",
  PORTFOLIO: "Portfolio",
  PRESENTATION_BOARD: "Presentation Board",
  REPORT: "Report",
  CASE_STUDY: "Case Study",
  FINANCIAL_ANALYSIS: "Financial Analysis",
  CALCULATION_MODEL: "Calculation / Model",
  PRESENTATION_SLIDES: "Presentation Slides",
  ESSAY: "Essay",
  RESEARCH_ANALYSIS: "Research / Analysis",
  OTHERS: "Others",
};

export const categoryTaskTypeMap: Record<
  (typeof categoryValues)[number],
  readonly (typeof taskTypeValues)[number][]
> = {
  INTERIOR_DESIGN: [
    "RENDERING",
    "LAYOUT",
    "PORTFOLIO",
    "PRESENTATION_BOARD",
    "OTHERS",
  ],
  ARCHITECTURE: [
    "RENDERING",
    "LAYOUT",
    "PORTFOLIO",
    "PRESENTATION_BOARD",
    "OTHERS",
  ],
  FINANCE: [
    "REPORT",
    "CASE_STUDY",
    "FINANCIAL_ANALYSIS",
    "CALCULATION_MODEL",
    "PRESENTATION_SLIDES",
    "OTHERS",
  ],
  INVESTMENT: [
    "REPORT",
    "CASE_STUDY",
    "FINANCIAL_ANALYSIS",
    "CALCULATION_MODEL",
    "PRESENTATION_SLIDES",
    "OTHERS",
  ],
  ECONOMICS: [
    "REPORT",
    "CASE_STUDY",
    "FINANCIAL_ANALYSIS",
    "CALCULATION_MODEL",
    "PRESENTATION_SLIDES",
    "OTHERS",
  ],
  BUSINESS: [
    "REPORT",
    "CASE_STUDY",
    "ESSAY",
    "PRESENTATION_SLIDES",
    "RESEARCH_ANALYSIS",
    "OTHERS",
  ],
  MARKETING: [
    "REPORT",
    "CASE_STUDY",
    "ESSAY",
    "PRESENTATION_SLIDES",
    "RESEARCH_ANALYSIS",
    "OTHERS",
  ],
  CORPORATE_GOVERNANCE: [
    "REPORT",
    "CASE_STUDY",
    "ESSAY",
    "PRESENTATION_SLIDES",
    "RESEARCH_ANALYSIS",
    "OTHERS",
  ],
  ETHICS: [
    "REPORT",
    "CASE_STUDY",
    "ESSAY",
    "PRESENTATION_SLIDES",
    "RESEARCH_ANALYSIS",
    "OTHERS",
  ],
};

export const taskTypeOptions = taskTypeValues.map((value) => ({
  value,
  label: taskTypeLabelMap[value],
})) as ReadonlyArray<{ value: (typeof taskTypeValues)[number]; label: string }>;

export function getTaskTypeOptionsForCategory(category: string) {
  const taskTypes =
    categoryTaskTypeMap[category as keyof typeof categoryTaskTypeMap] ??
    categoryTaskTypeMap.INTERIOR_DESIGN;

  return taskTypes.map((value) => ({
    value,
    label: taskTypeLabelMap[value],
  }));
}

export function getDefaultTaskTypeForCategory(category: string) {
  return getTaskTypeOptionsForCategory(category)[0]?.value ?? "OTHERS";
}

export const urgencyOptions = [
  { value: "RELAXED", label: "Relaxed (7+ days)" },
  { value: "NORMAL", label: "Normal (3-7 days)" },
  { value: "ASAP", label: "ASAP (under 3 days)" },
] as const;

export const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "COMPLETED", label: "Completed" },
] as const;

export const helperAgreementItems = [
  "I confirm that all submitted work is original and not plagiarized",
  "I agree not to scam, ghost, or abandon assigned tasks",
  "I understand CritOrbit is a platform and not liable for disputes",
  "I agree to follow deadlines and communication standards",
  "I accept CritOrbit's service terms and policies",
] as const;

export const adminSidebarLinks = [
  { href: "/admin", label: "Leads", match: "/admin" },
  { href: "/admin/applications", label: "Applications", match: "/admin/applications" },
  { href: "/admin/helper-stats", label: "Helper Stats", match: "/admin/helper-stats" },
  { href: "/admin/helpers", label: "Helpers", match: "/admin/helpers" },
  { href: "/admin/settings", label: "Settings", match: "/admin/settings" },
];

export const helperSidebarLinks = [
  { href: "/helper", label: "Overview" },
  { href: "/helper/profile", label: "Profile" },
  { href: "/helper/portfolio", label: "Portfolio" },
  { href: "/helper/verification", label: "Verification" },
  { href: "/helper/leads", label: "Assigned Leads" },
  { href: "/helper/earnings", label: "Earnings" },
];
