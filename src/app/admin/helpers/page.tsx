import { HelperAdminManager } from "@/components/helper-admin-manager";
import { SectionHeading } from "@/components/ui";
import { parseSpecialties } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";

export default async function AdminHelpersPage() {
  const helpers = await prisma.helper.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      teamSize: true,
      isVerified: true,
      projectsCompleted: true,
      impressionCount: true,
      responseTime: true,
      deliveryTime: true,
      repeatClients: true,
      priceTier: true,
      clickCount: true,
      selectionCount: true,
      status: true,
      category: true,
      shortBio: true,
      portfolioNote: true,
      email: true,
      whatsappNumber: true,
      agreedToTerms: true,
      agreedAt: true,
      displayOrder: true,
      isActive: true,
      specialties: true,
      createdAt: true,
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
      },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <SectionHeading
        eyebrow="Helpers"
        title="Manage helper roster"
        description="Create, edit, reorder, and toggle helper availability without leaving the admin area."
      />

      <div className="mt-8">
        <HelperAdminManager
          helpers={helpers.map((helper) => ({
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
            status: helper.status,
            category: helper.category,
            shortBio: helper.shortBio,
            portfolioNote: helper.portfolioNote,
            email: helper.email,
            whatsappNumber: helper.whatsappNumber,
            agreedToTerms: helper.agreedToTerms,
            agreedAt: helper.agreedAt?.toISOString() ?? null,
            displayOrder: helper.displayOrder,
            isActive: helper.isActive,
            specialties: parseSpecialties(helper.specialties),
            portfolioItems: helper.portfolioItems,
          }))}
        />
      </div>
    </div>
  );
}
