import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { parseSpecialties } from "@/lib/helpers";
import { getHelperCompletionScore, rankHelpersByConversion } from "@/lib/helper-ranking";
import { prisma } from "@/lib/prisma";
import { getPublicHelpers } from "@/lib/public-helpers";
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

  const helpers = await getPublicHelpers({
    include: {
      verification: {
        select: {
          status: true,
        },
      },
      _count: {
        select: {
          portfolioItems: true,
        },
      },
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

  const sortedHelpers = rankHelpersByConversion(
    helpers.map((helper) => ({
      ...helper,
      completionScore: getHelperCompletionScore({
        name: helper.name,
        shortBio: helper.shortBio,
        email: helper.email,
        whatsappNumber: helper.whatsappNumber,
        responseTime: helper.responseTime,
        deliveryTime: helper.deliveryTime,
        portfolioNote: helper.portfolioNote,
        specialties: helper.specialties,
        type: helper.type,
        teamSize: helper.teamSize,
        portfolioItemsCount: helper._count.portfolioItems,
        verificationStatus: helper.verification?.status ?? "NONE",
      }),
      portfolioItemsCount: helper._count.portfolioItems,
    })),
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
              priceAnchor: helper.priceAnchor,
              clickCount: helper.clickCount,
              selectionCount: helper.selectionCount,
              category: helper.category,
              displayOrder: helper.displayOrder,
              specialties: parseSpecialties(helper.specialties),
              shortBio: helper.shortBio,
              portfolioItems: helper.portfolioItems,
              completionScore: helper.completionScore,
              portfolioItemsCount: helper.portfolioItemsCount,
              conversionScore: helper.conversionScore,
              conversionTier: helper.conversionTier,
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
