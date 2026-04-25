import { SectionHeading } from "@/components/ui";
import { AdminApplicationsManager } from "@/components/admin-applications-manager";
import { getApplicationExperienceRank } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { logServerDataLoadError } from "@/lib/server-load";

async function getApplications() {
  return prisma.helper.findMany({
    where: {
      agreedToTerms: true,
    },
    select: {
      id: true,
      name: true,
      type: true,
      teamSize: true,
      category: true,
      experienceLevel: true,
      submittedPriceAnchor: true,
      status: true,
      shortBio: true,
      portfolioNote: true,
      email: true,
      whatsappNumber: true,
      agreedToTerms: true,
      agreedAt: true,
      applicationFiles: {
        select: {
          id: true,
          kind: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      createdAt: true,
    },
  });
}

export default async function AdminApplicationsPage() {
  let applications: Awaited<ReturnType<typeof getApplications>> = [];

  try {
    applications = await getApplications();
  } catch (error) {
    logServerDataLoadError("admin-applications-page", error);
  }
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
        {applications.length === 0 ? (
          <div className="mb-4 rounded-[20px] border-[3px] border-line bg-yellow px-5 py-4 text-sm font-semibold text-ink">
            Applications could not be loaded or there are no applications yet.
          </div>
        ) : null}
        <AdminApplicationsManager
          applications={sortedApplications.map((application) => ({
            ...application,
            agreedAt: application.agreedAt?.toISOString() ?? null,
            applicationFiles: application.applicationFiles.map((file) => ({
              ...file,
              createdAt: file.createdAt.toISOString(),
            })),
            createdAt: application.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
