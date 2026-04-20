import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { compareHelpersForConversion, parseSpecialties } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/scoring";
import { HelperSelectionClient } from "@/components/client-forms";
import { SectionHeading, SiteHeader } from "@/components/ui";

export default async function HelperSelectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const draftId = readQuery(params.draftId);
  const session = await getAuthSession();

  if (!draftId) {
    redirect("/requirements");
  }

  const draft = await prisma.leadDraft.findFirst({
    where: {
      id: draftId,
      userId: session?.user?.id ?? null,
    },
  });

  if (!draft) {
    redirect("/requirements");
  }

  const helpers = await prisma.helper.findMany({
    where: { isActive: true, status: "ACTIVE" },
    include: {
      portfolioItems: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          description: true,
          externalLink: true,
          displayOrder: true,
        },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        take: 3,
      },
    },
  });

  const sortedHelpers = [...helpers].sort((left, right) =>
    compareHelpersForConversion(
        {
          name: left.name,
          type: left.type,
          teamSize: left.teamSize,
          isVerified: left.isVerified,
          projectsCompleted: left.projectsCompleted,
          impressionCount: left.impressionCount,
          clickCount: left.clickCount,
          selectionCount: left.selectionCount,
          responseTime: left.responseTime,
          deliveryTime: left.deliveryTime,
          repeatClients: left.repeatClients,
        priceTier: left.priceTier,
        portfolioItems: left.portfolioItems,
        specialties: parseSpecialties(left.specialties),
        displayOrder: left.displayOrder,
      },
        {
          name: right.name,
          type: right.type,
          teamSize: right.teamSize,
          isVerified: right.isVerified,
          projectsCompleted: right.projectsCompleted,
          impressionCount: right.impressionCount,
          clickCount: right.clickCount,
          selectionCount: right.selectionCount,
          responseTime: right.responseTime,
          deliveryTime: right.deliveryTime,
          repeatClients: right.repeatClients,
        priceTier: right.priceTier,
        portfolioItems: right.portfolioItems,
        specialties: parseSpecialties(right.specialties),
        displayOrder: right.displayOrder,
      },
    ),
  );

  const baseScore = calculateLeadScore({
    urgency: draft.urgency,
    budget: draft.budget,
    description: draft.description,
  });

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <SectionHeading
          eyebrow="Step 2"
          title="Choose the best service option for your assignment"
          description="Studios and top helpers are ranked first so you can pick with confidence in seconds."
        />
        <div className="mt-8">
          <HelperSelectionClient
            helpers={sortedHelpers.map((helper) => ({
              id: helper.id,
              name: helper.name,
              type: helper.type,
              teamSize: helper.teamSize,
              isVerified: helper.isVerified,
              projectsCompleted: helper.projectsCompleted,
              impressionCount: helper.impressionCount,
              responseTime: helper.responseTime,
              deliveryTime: helper.deliveryTime,
              repeatClients: helper.repeatClients,
              priceTier: helper.priceTier,
              clickCount: helper.clickCount,
              selectionCount: helper.selectionCount,
              category: helper.category,
              displayOrder: helper.displayOrder,
              specialties: parseSpecialties(helper.specialties),
              shortBio: helper.shortBio,
              portfolioItems: helper.portfolioItems,
            }))}
            request={{
              draftId: draft.id,
              category: draft.category,
              taskType: draft.taskType,
              urgency: draft.urgency,
              deadline: draft.deadline.toISOString(),
              description: draft.description,
              budget: draft.budget ?? undefined,
              baseScore,
            }}
          />
        </div>
      </main>
    </div>
  );
}

function readQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
