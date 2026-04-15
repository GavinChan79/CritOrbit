import bcrypt from "bcryptjs";
import {
  HelperCategory,
  LeadLifecycleStage,
  LeadStatus,
  LeadTaskType,
  LeadTemperature,
  LeadUrgency,
  PrismaClient,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.lead.deleteMany();
  await prisma.helper.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("critorbit123", 10);

  const [admin, studentA, studentB] = await Promise.all([
    prisma.user.create({
      data: {
        name: "CritOrbit Admin",
        email: "admin@critorbit.my",
        passwordHash,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: "Aina Rahman",
        email: "aina@student.critorbit.my",
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: "Faris Lim",
        email: "faris@student.critorbit.my",
        passwordHash,
      },
    }),
  ]);

  const helperSeeds = [
    {
      name: "Nur Iman",
      category: HelperCategory.INTERIOR_DESIGN,
      specialties: [
        { code: "rendering", label: "Rendering", taskTypes: ["RENDERING"] },
        { code: "portfolio", label: "Portfolio", taskTypes: ["PORTFOLIO"] },
        { code: "layout", label: "Layout", taskTypes: ["LAYOUT"] },
        { code: "presentation-board", label: "Presentation Board", taskTypes: ["PRESENTATION_BOARD"] },
      ],
      shortBio:
        "Interior design senior focused on presentation boards, polished renders, and deadline rescues.",
      displayOrder: 1,
    },
    {
      name: "Aqil Studio",
      category: HelperCategory.ARCHITECTURE,
      specialties: [
        { code: "rendering", label: "Rendering", taskTypes: ["RENDERING"] },
        { code: "layout", label: "Layout", taskTypes: ["LAYOUT"] },
        { code: "presentation-board", label: "Presentation Board", taskTypes: ["PRESENTATION_BOARD"] },
      ],
      shortBio:
        "Architecture helper known for fast turnaround on drawings, Rhino cleanups, and submission decks.",
      displayOrder: 2,
    },
    {
      name: "Mira Drafts",
      category: HelperCategory.INTERIOR_DESIGN,
      specialties: [
        { code: "portfolio", label: "Portfolio", taskTypes: ["PORTFOLIO"] },
        { code: "presentation-board", label: "Presentation Board", taskTypes: ["PRESENTATION_BOARD"] },
        { code: "others", label: "Others", taskTypes: ["OTHERS"] },
      ],
      shortBio:
        "Best for concept storytelling, portfolio sequencing, and visual cleanup before final critique.",
      displayOrder: 3,
    },
    {
      name: "Danial Axis",
      category: HelperCategory.ARCHITECTURE,
      specialties: [
        { code: "layout", label: "Layout", taskTypes: ["LAYOUT"] },
        { code: "others", label: "Others", taskTypes: ["OTHERS"] },
        { code: "portfolio", label: "Portfolio", taskTypes: ["PORTFOLIO"] },
        { code: "presentation-board", label: "Presentation Board", taskTypes: ["PRESENTATION_BOARD"] },
      ],
      shortBio:
        "Helps architecture students structure boards, plans, diagrams, and studio presentation narratives.",
      displayOrder: 4,
    },
    {
      name: "Hana Ledger",
      category: HelperCategory.FINANCE,
      specialties: [
        { code: "financial-models", label: "Financial Models", taskTypes: ["FINANCIAL_ANALYSIS", "CALCULATION_MODEL"] },
        { code: "budget-analysis", label: "Budget Analysis", taskTypes: ["REPORT", "OTHERS"] },
      ],
      shortBio:
        "Finance helper for ratio writeups, budgeting sheets, and assignment restructuring before submission.",
      displayOrder: 5,
    },
    {
      name: "Reza Capital",
      category: HelperCategory.FINANCE,
      specialties: [
        { code: "cash-flow", label: "Cash Flow Decks", taskTypes: ["PRESENTATION_SLIDES", "FINANCIAL_ANALYSIS"] },
        { code: "case-breakdown", label: "Case Breakdown", taskTypes: ["CASE_STUDY", "REPORT"] },
      ],
      shortBio:
        "Strong with finance case breakdowns, spreadsheet-backed slides, and concise explanation decks.",
      displayOrder: 6,
    },
    {
      name: "Sara Strategy",
      category: HelperCategory.BUSINESS,
      specialties: [
        { code: "case-study", label: "Case Study", taskTypes: ["CASE_STUDY", "REPORT"] },
        { code: "pitch-layout", label: "Pitch Layout", taskTypes: ["PRESENTATION_SLIDES", "RESEARCH_ANALYSIS"] },
      ],
      shortBio:
        "Business school helper who sharpens case answers, pitch decks, and team presentation structure.",
      displayOrder: 7,
    },
    {
      name: "Adam Ops",
      category: HelperCategory.BUSINESS,
      specialties: [
        { code: "operations-notes", label: "Operations Notes", taskTypes: ["REPORT", "OTHERS"] },
        { code: "slide-cleanup", label: "Slide Cleanup", taskTypes: ["PRESENTATION_SLIDES"] },
      ],
      shortBio:
        "Best for business ops assignments, management summaries, and polished slide organization.",
      displayOrder: 8,
    },
    {
      name: "Nadia Macro",
      category: HelperCategory.ECONOMICS,
      specialties: [
        { code: "market-analysis", label: "Market Analysis", taskTypes: ["REPORT", "FINANCIAL_ANALYSIS"] },
        { code: "chart-layout", label: "Chart Layout", taskTypes: ["PRESENTATION_SLIDES", "CALCULATION_MODEL"] },
      ],
      shortBio:
        "Economics helper for graph-heavy assignments, policy summaries, and macro/micro explanation boards.",
      displayOrder: 9,
    },
    {
      name: "Irfan Policy",
      category: HelperCategory.ECONOMICS,
      specialties: [
        { code: "policy-brief", label: "Policy Brief", taskTypes: ["REPORT", "CASE_STUDY"] },
        { code: "data-story", label: "Data Story", taskTypes: ["PRESENTATION_SLIDES", "CALCULATION_MODEL"] },
      ],
      shortBio:
        "Turns raw economics notes into cleaner policy briefs, diagrams, and narrative-based submissions.",
      displayOrder: 10,
    },
    {
      name: "Maya Equity",
      category: HelperCategory.INVESTMENT,
      specialties: [
        { code: "equity-report", label: "Equity Report", taskTypes: ["REPORT", "FINANCIAL_ANALYSIS"] },
        { code: "presentation-pack", label: "Presentation Pack", taskTypes: ["PRESENTATION_SLIDES", "CASE_STUDY"] },
      ],
      shortBio:
        "Supports investment reports, valuation storytelling, and deck formatting for class presentations.",
      displayOrder: 11,
    },
    {
      name: "Joel Portfolio",
      category: HelperCategory.INVESTMENT,
      specialties: [
        { code: "portfolio-review", label: "Portfolio Review", taskTypes: ["CASE_STUDY", "REPORT"] },
        { code: "thesis-slides", label: "Thesis Slides", taskTypes: ["PRESENTATION_SLIDES", "CALCULATION_MODEL"] },
      ],
      shortBio:
        "Great for investment theses, portfolio review summaries, and cleaner submission slide systems.",
      displayOrder: 12,
    },
    {
      name: "Alya Boardroom",
      category: HelperCategory.CORPORATE_GOVERNANCE,
      specialties: [
        { code: "governance-case", label: "Governance Case", taskTypes: ["CASE_STUDY", "REPORT"] },
        { code: "board-pack", label: "Board Pack", taskTypes: ["PRESENTATION_SLIDES", "RESEARCH_ANALYSIS"] },
      ],
      shortBio:
        "Helps students frame board structures, governance cases, and clear decision-making presentation packs.",
      displayOrder: 13,
    },
    {
      name: "Faiz Risk",
      category: HelperCategory.CORPORATE_GOVERNANCE,
      specialties: [
        { code: "risk-matrix", label: "Risk Matrix", taskTypes: ["RESEARCH_ANALYSIS", "OTHERS"] },
        { code: "committee-summary", label: "Committee Summary", taskTypes: ["REPORT", "PRESENTATION_SLIDES"] },
      ],
      shortBio:
        "Useful for governance frameworks, risk discussions, and clean board-style reporting visuals.",
      displayOrder: 14,
    },
    {
      name: "Lina Values",
      category: HelperCategory.ETHICS,
      specialties: [
        { code: "ethics-case", label: "Ethics Case", taskTypes: ["CASE_STUDY", "ESSAY"] },
        { code: "reflection-pack", label: "Reflection Pack", taskTypes: ["REPORT", "RESEARCH_ANALYSIS"] },
      ],
      shortBio:
        "Ethics helper for case comparisons, argument structure, and polished reflection-style submissions.",
      displayOrder: 15,
    },
    {
      name: "Omar Integrity",
      category: HelperCategory.ETHICS,
      specialties: [
        { code: "debate-brief", label: "Debate Brief", taskTypes: ["ESSAY", "OTHERS"] },
        { code: "presentation-notes", label: "Presentation Notes", taskTypes: ["PRESENTATION_SLIDES", "REPORT"] },
      ],
      shortBio:
        "Strong with ethics debate prep, structured argument notes, and supporting presentation material.",
      displayOrder: 16,
    },
    {
      name: "Tina Campaigns",
      category: HelperCategory.MARKETING,
      specialties: [
        { code: "campaign-deck", label: "Campaign Deck", taskTypes: ["PRESENTATION_SLIDES", "CASE_STUDY"] },
        { code: "brand-analysis", label: "Brand Analysis", taskTypes: ["RESEARCH_ANALYSIS", "REPORT"] },
      ],
      shortBio:
        "Marketing helper for campaign concepts, branding slides, and cleaner class presentation polish.",
      displayOrder: 17,
    },
    {
      name: "Hakim Funnel",
      category: HelperCategory.MARKETING,
      specialties: [
        { code: "content-plan", label: "Content Plan", taskTypes: ["RESEARCH_ANALYSIS", "OTHERS"] },
        { code: "pitch-boards", label: "Pitch Boards", taskTypes: ["PRESENTATION_SLIDES", "CASE_STUDY"] },
      ],
      shortBio:
        "Best for marketing funnels, social campaign structure, and quick-turn presentation board cleanup.",
      displayOrder: 18,
    },
  ] satisfies Parameters<typeof prisma.helper.create>[0]["data"][];

  const helpers = await Promise.all(
    helperSeeds.map((helper) =>
      prisma.helper.create({
        data: helper,
      }),
    ),
  );

  await prisma.lead.createMany({
    data: [
      {
        userId: studentA.id,
        category: HelperCategory.INTERIOR_DESIGN,
        taskType: LeadTaskType.RENDERING,
        urgency: LeadUrgency.ASAP,
        deadline: new Date("2026-04-17"),
        budget: 250,
        description: "Need 3 perspective renders and a quick moodboard cleanup.",
        selectedHelperId: helpers[0].id,
        assignedHelperId: helpers[0].id,
        leadScore: 8,
        leadTemperature: LeadTemperature.HOT,
        lifecycleStage: LeadLifecycleStage.ASSIGNED,
        whatsappClicked: true,
        status: LeadStatus.ASSIGNED,
        dealClosed: false,
        notes: "Student replied quickly on WhatsApp.",
        dealValue: 250,
      },
      {
        userId: studentB.id,
        category: HelperCategory.ARCHITECTURE,
        taskType: LeadTaskType.LAYOUT,
        urgency: LeadUrgency.NORMAL,
        deadline: new Date("2026-04-22"),
        budget: 180,
        description: "Need help cleaning up A1 board layout before review.",
        selectedHelperId: helpers[3].id,
        leadScore: 6,
        leadTemperature: LeadTemperature.WARM,
        lifecycleStage: LeadLifecycleStage.CONTACTED,
        whatsappClicked: true,
        status: LeadStatus.CONTACTED,
        dealClosed: false,
        notes: "Waiting for final files.",
      },
      {
        userId: studentA.id,
        category: HelperCategory.INTERIOR_DESIGN,
        taskType: LeadTaskType.PORTFOLIO,
        urgency: LeadUrgency.RELAXED,
        deadline: new Date("2026-04-28"),
        budget: 120,
        description: "Portfolio arrangement and typography guidance.",
        selectedHelperId: helpers[2].id,
        assignedHelperId: helpers[2].id,
        leadScore: 5,
        leadTemperature: LeadTemperature.WARM,
        lifecycleStage: LeadLifecycleStage.COMPLETED,
        whatsappClicked: true,
        status: LeadStatus.COMPLETED,
        dealClosed: true,
        notes: "Closed successfully. Student happy with revisions.",
        dealValue: 180,
      },
    ],
  });

  console.log("Seeded CritOrbit demo data.");
  console.log("Admin login: admin@critorbit.my / critorbit123");
  console.log("Student login: aina@student.critorbit.my / critorbit123");
  console.log(`Helpers seeded: ${helpers.length}. Admin id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
