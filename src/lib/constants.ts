export const APP_NAME = "CritOrbit";
export const APP_TAGLINE = "Find the right help. Get it done.";
export const APP_POWERED_BY = "Powered by CritOrbit";
export const ADMIN_WHATSAPP_NUMBER =
  process.env.ADMIN_WHATSAPP_NUMBER ?? "601161241368";

export const helperTypeValues = ["INDIVIDUAL", "TEAM"] as const;
export const helperStatusValues = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACTIVE",
  "FROZEN",
  "ARCHIVED",
] as const;
export const helperPriceTierValues = ["BUDGET", "STANDARD", "PREMIUM"] as const;
export const helperExperienceLevelValues = [
  "NO_EXPERIENCE",
  "LESS_THAN_1_YEAR",
  "ONE_TO_TWO_YEARS",
  "THREE_TO_FIVE_YEARS",
  "FIVE_PLUS_YEARS",
  "EXPERT_ADVANCED",
] as const;
export const helperPriceAnchorValues = [
  "BELOW_RM100",
  "RM100",
  "RM200",
  "RM300",
  "RM400",
  "RM500",
  "RM600",
  "RM700",
  "RM800",
  "RM900",
  "RM1000_PLUS",
] as const;
export const helperTrustLevelValues = [
  "STANDARD_HELPER",
  "VERIFIED_HELPER",
  "TRUSTED_HELPER",
] as const;

export const helperTypeLabelMap: Record<(typeof helperTypeValues)[number], string> = {
  INDIVIDUAL: "Individual",
  TEAM: "Studio",
};

export const helperStatusLabelMap: Record<(typeof helperStatusValues)[number], string> = {
  PENDING: "Under review (3-7 days)",
  APPROVED: "You're approved. Preparing your profile.",
  REJECTED: "Rejected",
  ACTIVE: "Live on platform",
  FROZEN: "Frozen",
  ARCHIVED: "Archived",
};

export const helperPriceTierLabelMap: Record<
  (typeof helperPriceTierValues)[number],
  string
> = {
  BUDGET: "Affordable option",
  STANDARD: "Balanced choice",
  PREMIUM: "Top quality • Fast delivery",
};

export const helperExperienceLevelLabelMap: Record<
  (typeof helperExperienceLevelValues)[number],
  string
> = {
  NO_EXPERIENCE: "No experience",
  LESS_THAN_1_YEAR: "Less than 1 year",
  ONE_TO_TWO_YEARS: "1-2 years",
  THREE_TO_FIVE_YEARS: "3-5 years",
  FIVE_PLUS_YEARS: "5+ years",
  EXPERT_ADVANCED: "Expert / Advanced",
};

export const helperPriceAnchorLabelMap: Record<
  (typeof helperPriceAnchorValues)[number],
  string
> = {
  BELOW_RM100: "Below RM100",
  RM100: "RM100",
  RM200: "RM200",
  RM300: "RM300",
  RM400: "RM400",
  RM500: "RM500",
  RM600: "RM600",
  RM700: "RM700",
  RM800: "RM800",
  RM900: "RM900",
  RM1000_PLUS: "RM1000+",
};
export const helperTrustLevelLabelMap: Record<
  (typeof helperTrustLevelValues)[number],
  string
> = {
  STANDARD_HELPER: "Standard Helper",
  VERIFIED_HELPER: "Verified Helper",
  TRUSTED_HELPER: "Trusted Helper",
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

export const helperExperienceLevelOptions = helperExperienceLevelValues.map((value) => ({
  value,
  label: helperExperienceLevelLabelMap[value],
})) as ReadonlyArray<{ value: (typeof helperExperienceLevelValues)[number]; label: string }>;

export const helperPriceAnchorOptions = helperPriceAnchorValues.map((value) => ({
  value,
  label: helperPriceAnchorLabelMap[value],
})) as ReadonlyArray<{ value: (typeof helperPriceAnchorValues)[number]; label: string }>;
export const helperTrustLevelOptions = helperTrustLevelValues.map((value) => ({
  value,
  label: helperTrustLevelLabelMap[value],
})) as ReadonlyArray<{ value: (typeof helperTrustLevelValues)[number]; label: string }>;

export const helperResponseTimeOptions = [
  "Within 15 minutes",
  "Within 30 minutes",
  "Within 1 hour",
  "Within 3 hours",
  "Same day",
  "Within 24 hours",
] as const;

export const helperDeliveryTimeOptions = [
  "Same day",
  "24 hours",
  "1-2 days",
  "2-3 days",
  "3-5 days",
  "1 week+",
] as const;

export const maxHelperSpecialties = 8;

export function normalizeHelperResponseTime(value?: string | null) {
  return helperResponseTimeOptions.includes(
    value as (typeof helperResponseTimeOptions)[number],
  )
    ? (value as (typeof helperResponseTimeOptions)[number])
    : "Same day";
}

export function normalizeHelperDeliveryTime(value?: string | null) {
  return helperDeliveryTimeOptions.includes(
    value as (typeof helperDeliveryTimeOptions)[number],
  )
    ? (value as (typeof helperDeliveryTimeOptions)[number])
    : "2-3 days";
}

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

export const helperSpecialtyPresetOptions = [
  {
    value: "case-study-strategy",
    label: "Case Study Strategy",
    categories: ["BUSINESS", "MARKETING", "CORPORATE_GOVERNANCE", "ECONOMICS"],
    defaultTaskTypes: ["CASE_STUDY", "REPORT"],
  },
  {
    value: "business-strategy",
    label: "Business Strategy",
    categories: ["BUSINESS", "MARKETING", "CORPORATE_GOVERNANCE"],
    defaultTaskTypes: ["CASE_STUDY", "REPORT"],
  },
  {
    value: "market-analysis",
    label: "Market Analysis",
    categories: ["BUSINESS", "MARKETING", "ECONOMICS"],
    defaultTaskTypes: ["RESEARCH_ANALYSIS", "REPORT"],
  },
  {
    value: "swot-pestle-analysis",
    label: "SWOT / PESTLE Analysis",
    categories: ["BUSINESS", "MARKETING", "CORPORATE_GOVERNANCE"],
    defaultTaskTypes: ["CASE_STUDY", "REPORT"],
  },
  {
    value: "report-writing",
    label: "Report Writing",
    categories: ["BUSINESS", "MARKETING", "CORPORATE_GOVERNANCE", "ETHICS", "ECONOMICS"],
    defaultTaskTypes: ["REPORT", "RESEARCH_ANALYSIS"],
  },
  {
    value: "academic-writing",
    label: "Academic Writing",
    categories: ["BUSINESS", "MARKETING", "CORPORATE_GOVERNANCE", "ETHICS", "ECONOMICS"],
    defaultTaskTypes: ["ESSAY", "REPORT"],
  },
  {
    value: "essay-structuring",
    label: "Essay Structuring",
    categories: ["BUSINESS", "ETHICS", "CORPORATE_GOVERNANCE"],
    defaultTaskTypes: ["ESSAY", "REPORT"],
  },
  {
    value: "literature-review",
    label: "Literature Review",
    categories: ["BUSINESS", "MARKETING", "ETHICS", "ECONOMICS", "CORPORATE_GOVERNANCE"],
    defaultTaskTypes: ["RESEARCH_ANALYSIS", "REPORT"],
  },
  {
    value: "fyp-research",
    label: "FYP Research",
    categories: ["BUSINESS", "MARKETING", "ETHICS", "ECONOMICS", "CORPORATE_GOVERNANCE", "FINANCE", "INVESTMENT"],
    defaultTaskTypes: ["RESEARCH_ANALYSIS", "REPORT"],
  },
  {
    value: "thesis-writing",
    label: "Thesis Writing",
    categories: ["BUSINESS", "MARKETING", "ETHICS", "ECONOMICS", "CORPORATE_GOVERNANCE", "FINANCE", "INVESTMENT"],
    defaultTaskTypes: ["RESEARCH_ANALYSIS", "REPORT"],
  },
  {
    value: "proofreading-editing",
    label: "Proofreading & Editing",
    categories: categoryValues,
    defaultTaskTypes: ["REPORT", "ESSAY"],
  },
  {
    value: "referencing-apa-harvard",
    label: "Referencing (APA / Harvard)",
    categories: categoryValues,
    defaultTaskTypes: ["REPORT", "ESSAY"],
  },
  {
    value: "financial-analysis",
    label: "Financial Analysis",
    categories: ["FINANCE", "INVESTMENT", "ECONOMICS"],
    defaultTaskTypes: ["FINANCIAL_ANALYSIS", "REPORT"],
  },
  {
    value: "financial-modeling",
    label: "Financial Modeling",
    categories: ["FINANCE", "INVESTMENT"],
    defaultTaskTypes: ["CALCULATION_MODEL", "FINANCIAL_ANALYSIS"],
  },
  {
    value: "dcf-valuation",
    label: "DCF Valuation",
    categories: ["FINANCE", "INVESTMENT"],
    defaultTaskTypes: ["FINANCIAL_ANALYSIS", "CALCULATION_MODEL"],
  },
  {
    value: "ratio-analysis",
    label: "Ratio Analysis",
    categories: ["FINANCE", "INVESTMENT"],
    defaultTaskTypes: ["FINANCIAL_ANALYSIS", "REPORT"],
  },
  {
    value: "investment-analysis",
    label: "Investment Analysis",
    categories: ["INVESTMENT", "FINANCE", "ECONOMICS"],
    defaultTaskTypes: ["FINANCIAL_ANALYSIS", "REPORT"],
  },
  {
    value: "corporate-finance",
    label: "Corporate Finance",
    categories: ["FINANCE", "INVESTMENT", "CORPORATE_GOVERNANCE"],
    defaultTaskTypes: ["CASE_STUDY", "FINANCIAL_ANALYSIS"],
  },
  {
    value: "accounting-fundamentals",
    label: "Accounting Fundamentals",
    categories: ["FINANCE"],
    defaultTaskTypes: ["REPORT", "CASE_STUDY"],
  },
  {
    value: "financial-statements",
    label: "Financial Statements",
    categories: ["FINANCE", "INVESTMENT"],
    defaultTaskTypes: ["FINANCIAL_ANALYSIS", "REPORT"],
  },
  {
    value: "cost-accounting",
    label: "Cost Accounting",
    categories: ["FINANCE"],
    defaultTaskTypes: ["CALCULATION_MODEL", "REPORT"],
  },
  {
    value: "management-accounting",
    label: "Management Accounting",
    categories: ["FINANCE", "BUSINESS"],
    defaultTaskTypes: ["CALCULATION_MODEL", "REPORT"],
  },
  {
    value: "audit-assurance",
    label: "Audit & Assurance",
    categories: ["FINANCE", "CORPORATE_GOVERNANCE"],
    defaultTaskTypes: ["REPORT", "CASE_STUDY"],
  },
  {
    value: "taxation-basics",
    label: "Taxation Basics",
    categories: ["FINANCE"],
    defaultTaskTypes: ["REPORT", "CASE_STUDY"],
  },
  {
    value: "excel-financial-models",
    label: "Excel Financial Models",
    categories: ["FINANCE", "INVESTMENT", "BUSINESS"],
    defaultTaskTypes: ["CALCULATION_MODEL", "FINANCIAL_ANALYSIS"],
  },
  {
    value: "data-analysis",
    label: "Data Analysis",
    categories: ["FINANCE", "INVESTMENT", "ECONOMICS", "BUSINESS", "MARKETING"],
    defaultTaskTypes: ["RESEARCH_ANALYSIS", "REPORT"],
  },
  {
    value: "statistical-analysis",
    label: "Statistical Analysis",
    categories: ["ECONOMICS", "FINANCE", "INVESTMENT", "BUSINESS", "MARKETING"],
    defaultTaskTypes: ["RESEARCH_ANALYSIS", "CALCULATION_MODEL"],
  },
  {
    value: "spss-r-python-analysis",
    label: "SPSS / R / Python Analysis",
    categories: ["ECONOMICS", "FINANCE", "INVESTMENT", "BUSINESS", "MARKETING"],
    defaultTaskTypes: ["RESEARCH_ANALYSIS", "CALCULATION_MODEL"],
  },
  {
    value: "regression-analysis",
    label: "Regression Analysis",
    categories: ["ECONOMICS", "FINANCE", "INVESTMENT"],
    defaultTaskTypes: ["CALCULATION_MODEL", "RESEARCH_ANALYSIS"],
  },
  {
    value: "forecasting-models",
    label: "Forecasting Models",
    categories: ["ECONOMICS", "FINANCE", "INVESTMENT", "BUSINESS"],
    defaultTaskTypes: ["CALCULATION_MODEL", "FINANCIAL_ANALYSIS"],
  },
  {
    value: "excel-advanced",
    label: "Excel Advanced",
    categories: ["FINANCE", "INVESTMENT", "ECONOMICS", "BUSINESS", "MARKETING"],
    defaultTaskTypes: ["CALCULATION_MODEL", "REPORT"],
  },
  {
    value: "quantitative-methods",
    label: "Quantitative Methods",
    categories: ["ECONOMICS", "FINANCE", "INVESTMENT", "BUSINESS"],
    defaultTaskTypes: ["CALCULATION_MODEL", "RESEARCH_ANALYSIS"],
  },
  {
    value: "operations-research",
    label: "Operations Research",
    categories: ["BUSINESS", "ECONOMICS", "FINANCE"],
    defaultTaskTypes: ["CALCULATION_MODEL", "REPORT"],
  },
  {
    value: "presentation-slides-design",
    label: "Presentation Slides Design",
    categories: categoryValues,
    defaultTaskTypes: ["PRESENTATION_SLIDES", "PRESENTATION_BOARD"],
  },
  {
    value: "slides-storytelling",
    label: "Slides Storytelling",
    categories: categoryValues,
    defaultTaskTypes: ["PRESENTATION_SLIDES", "REPORT"],
  },
  {
    value: "pitch-deck-structuring",
    label: "Pitch Deck Structuring",
    categories: ["BUSINESS", "MARKETING", "FINANCE", "INVESTMENT"],
    defaultTaskTypes: ["PRESENTATION_SLIDES", "REPORT"],
  },
  {
    value: "visual-layout-design",
    label: "Visual Layout Design",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE", "BUSINESS", "MARKETING"],
    defaultTaskTypes: ["PRESENTATION_BOARD", "PRESENTATION_SLIDES"],
  },
  {
    value: "infographic-design",
    label: "Infographic Design",
    categories: ["BUSINESS", "MARKETING", "FINANCE", "ECONOMICS"],
    defaultTaskTypes: ["PRESENTATION_SLIDES", "REPORT"],
  },
  {
    value: "powerpoint-animation",
    label: "PowerPoint Animation",
    categories: categoryValues,
    defaultTaskTypes: ["PRESENTATION_SLIDES", "PRESENTATION_BOARD"],
  },
  {
    value: "2d-drawing-autocad",
    label: "2D Drawing (AutoCAD)",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["LAYOUT", "PRESENTATION_BOARD"],
  },
  {
    value: "3d-modeling",
    label: "3D Modeling",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["RENDERING", "LAYOUT"],
  },
  {
    value: "3d-modeling-sketchup-revit",
    label: "3D Modeling (SketchUp / Revit)",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["RENDERING", "LAYOUT"],
  },
  {
    value: "3d-rendering",
    label: "3D Rendering",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["RENDERING", "PRESENTATION_BOARD"],
  },
  {
    value: "3d-rendering-vray-lumion",
    label: "3D Rendering (V-Ray / Lumion)",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["RENDERING", "PRESENTATION_BOARD"],
  },
  {
    value: "detail-drawings",
    label: "Detail Drawings",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["LAYOUT", "PRESENTATION_BOARD"],
  },
  {
    value: "technical-drawings",
    label: "Technical Drawings",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["LAYOUT", "PRESENTATION_BOARD"],
  },
  {
    value: "space-planning",
    label: "Space Planning",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["LAYOUT", "PRESENTATION_BOARD"],
  },
  {
    value: "layout-planning",
    label: "Layout Planning",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["LAYOUT", "PRESENTATION_BOARD"],
  },
  {
    value: "concept-development",
    label: "Concept Development",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["PRESENTATION_BOARD", "REPORT"],
  },
  {
    value: "moodboard-design",
    label: "Moodboard Design",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["PRESENTATION_BOARD", "PORTFOLIO"],
  },
  {
    value: "presentation-boards",
    label: "Presentation Boards",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["PRESENTATION_BOARD", "PORTFOLIO"],
  },
  {
    value: "portfolio-layout",
    label: "Portfolio Layout",
    categories: ["INTERIOR_DESIGN", "ARCHITECTURE"],
    defaultTaskTypes: ["PORTFOLIO", "PRESENTATION_BOARD"],
  },
  {
    value: "custom-requests",
    label: "Custom Requests",
    categories: categoryValues,
    defaultTaskTypes: ["OTHERS", "REPORT"],
  },
  {
    value: "urgent-tasks-handling",
    label: "Urgent Tasks Handling",
    categories: categoryValues,
    defaultTaskTypes: ["OTHERS", "REPORT"],
  },
  {
    value: "research-support",
    label: "Research Support",
    categories: ["BUSINESS", "MARKETING", "ETHICS", "ECONOMICS", "CORPORATE_GOVERNANCE", "FINANCE", "INVESTMENT"],
    defaultTaskTypes: ["RESEARCH_ANALYSIS", "REPORT"],
  },
  {
    value: "formatting-cleanup",
    label: "Formatting & Cleanup",
    categories: categoryValues,
    defaultTaskTypes: ["REPORT", "PRESENTATION_SLIDES"],
  },
  {
    value: "custom-specialty",
    label: "Custom Specialty",
    categories: categoryValues,
    defaultTaskTypes: ["OTHERS"],
  },
] as const;

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
  { value: "CANCELLED", label: "Cancelled" },
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
