import { HelperAdminManager } from "@/components/helper-admin-manager";
import { AdminHelperVerificationManager } from "@/components/admin-helper-verification-manager";
import { SectionHeading } from "@/components/ui";
import { parseSpecialties } from "@/lib/helpers";
import { getAdminHelperVerificationFilePath } from "@/lib/helper-verification";
import { prisma } from "@/lib/prisma";

export default async function AdminHelpersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const verificationFilter = readFilter(Array.isArray(params?.verification) ? params.verification[0] : params?.verification);
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
      verification: {
        select: {
          status: true,
          adminNote: true,
          updatedAt: true,
        },
      },
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

      <div className="mt-6 flex flex-wrap gap-3">
        {[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "verified", label: "Verified" },
          { value: "rejected", label: "Rejected" },
        ].map((filter) => (
          <a
            key={filter.value}
            href={filter.value === "all" ? "/admin/helpers" : `/admin/helpers?verification=${filter.value}`}
            className={`retro-pill px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${
              verificationFilter === filter.value ? "bg-purple text-white" : "bg-white text-ink"
            }`}
          >
            {filter.label}
          </a>
        ))}
      </div>

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

      <div className="mt-12">
        <AdminHelperVerificationManager
          activeFilter={verificationFilter}
          helpers={helpers.map((helper) => ({
            id: helper.id,
            name: helper.name,
            isVerified: helper.isVerified,
            verification: helper.verification
              ? {
                  status: helper.verification.status,
                  adminNote: helper.verification.adminNote,
                  updatedAt: helper.verification.updatedAt?.toISOString() ?? null,
                  icFrontUrl: getAdminHelperVerificationFilePath(helper.id, "front"),
                  icBackUrl: getAdminHelperVerificationFilePath(helper.id, "back"),
                }
              : null,
          }))}
        />
      </div>
    </div>
  );
}

function readFilter(value: string | undefined): "all" | "pending" | "verified" | "rejected" {
  if (value === "pending" || value === "verified" || value === "rejected") {
    return value;
  }

  return "all";
}
