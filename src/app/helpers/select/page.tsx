import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { parseSpecialties } from "@/lib/helpers";
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
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

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
          title="Pick Your Creative Partner"
          description="Recommended badges appear when the helper’s category and specialty align with your brief."
        />
        <div className="mt-8">
          <HelperSelectionClient
            helpers={helpers.map((helper) => ({
              id: helper.id,
              name: helper.name,
              category: helper.category,
              displayOrder: helper.displayOrder,
              specialties: parseSpecialties(helper.specialties),
              shortBio: helper.shortBio,
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
