import { SectionHeading } from "@/components/ui";
import { AdminApplicationsManager } from "@/components/admin-applications-manager";
import { getApplicationExperienceRank } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";

export default async function AdminApplicationsPage() {
  const applications = await prisma.helper.findMany({
    where: {
      agreedToTerms: true,
    },
    select: {
      id: true,
      name: true,
      type: true,
      teamSize: true,
      category: true,
      status: true,
      shortBio: true,
      portfolioNote: true,
      email: true,
      whatsappNumber: true,
      createdAt: true,
    },
  });
  const sortedApplications = [...applications].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "TEAM" ? -1 : 1;
    }

    const experienceDelta =
      getApplicationExperienceRank(right.shortBio) -
      getApplicationExperienceRank(left.shortBio);

    if (experienceDelta !== 0) {
      return experienceDelta;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });

  return (
    <div>
      <SectionHeading
        eyebrow="Applications"
        title="Review helper applications"
        description="Approve or reject new helper applications while keeping public visibility controlled until activation."
      />

      <div className="mt-8">
        <AdminApplicationsManager
          applications={sortedApplications.map((application) => ({
            ...application,
            createdAt: application.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
