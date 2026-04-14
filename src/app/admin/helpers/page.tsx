import { HelperAdminManager } from "@/components/helper-admin-manager";
import { SectionHeading } from "@/components/ui";
import { parseSpecialties } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";

export default async function AdminHelpersPage() {
  const helpers = await prisma.helper.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      shortBio: true,
      displayOrder: true,
      isActive: true,
      specialties: true,
      createdAt: true,
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
            category: helper.category,
            shortBio: helper.shortBio,
            displayOrder: helper.displayOrder,
            isActive: helper.isActive,
            specialties: parseSpecialties(helper.specialties),
          }))}
        />
      </div>
    </div>
  );
}
