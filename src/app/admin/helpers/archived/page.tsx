import Link from "next/link";
import { ArchivedHelperAdminManager } from "@/components/archived-helper-admin-manager";
import { SectionHeading } from "@/components/ui";
import { buttonStyles } from "@/components/ui-primitives";
import { getCategoryLabel, getHelperStatusLabel, getHelperTypeLabel } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { logServerDataLoadError } from "@/lib/server-load";

async function getArchivedHelpers() {
  return prisma.helper.findMany({
    where: {
      status: "ARCHIVED",
    },
    select: {
      id: true,
      name: true,
      email: true,
      category: true,
      status: true,
      type: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      portfolioItems: {
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          selectedForLeads: true,
          assignedLeads: true,
          applicationFiles: true,
          portfolioItems: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export default async function AdminArchivedHelpersPage() {
  let helpers: Awaited<ReturnType<typeof getArchivedHelpers>> = [];

  try {
    helpers = await getArchivedHelpers();
  } catch (error) {
    logServerDataLoadError("admin-archived-helpers-page", error);
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Archived Helpers"
        title="Archived helper records"
        description="Review removed helpers separately so the main roster stays focused on active operations."
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/helpers" className={buttonStyles({ tone: "yellow", size: "sm" })}>
          Back to Helper Roster
        </Link>
      </div>

      <div className="mt-8">
        <ArchivedHelperAdminManager
          helpers={helpers.map((helper) => ({
            id: helper.id,
            name: helper.name,
            email: helper.email,
            categoryLabel: getCategoryLabel(helper.category),
            statusLabel: getHelperStatusLabel(helper.status),
            typeLabel: getHelperTypeLabel(helper.type),
            isActive: helper.isActive,
            createdAt: helper.createdAt.toISOString(),
            updatedAt: helper.updatedAt.toISOString(),
            portfolioCount: helper._count.portfolioItems,
            selectedLeadCount: helper._count.selectedForLeads,
            assignedLeadCount: helper._count.assignedLeads,
            applicationFileCount: helper._count.applicationFiles,
          }))}
        />
      </div>
    </div>
  );
}
