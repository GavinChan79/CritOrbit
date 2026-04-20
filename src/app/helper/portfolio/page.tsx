import { requireApprovedHelper } from "@/lib/auth";
import { Card, SectionHeading } from "@/components/ui";
import { HelperPortfolioManager } from "@/components/helper-portfolio-manager";
import { prisma } from "@/lib/prisma";

export default async function HelperPortfolioPage() {
  const { helper } = await requireApprovedHelper();
  const portfolioItems = await prisma.helperPortfolioItem.findMany({
    where: {
      helperId: helper.id,
    },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      description: true,
      externalLink: true,
      displayOrder: true,
      sourceApplicationFileId: true,
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <SectionHeading
        eyebrow="Helper Portfolio"
        title="Manage your portfolio"
        description="Your uploads stay attached to your helper record only. Once your helper profile is public, these items appear automatically on the public helper page."
      />

      <div className="mt-8">
        <HelperPortfolioManager items={portfolioItems} />
      </div>

      <Card className="mt-8 bg-yellow">
        <div className="display-font text-2xl font-black">Privacy boundary</div>
        <div className="mt-4 grid gap-3 text-sm font-semibold">
          <p>Only portfolio uploads created from this page can become public.</p>
          <p>Identity and other internal helper files are not exposed here.</p>
          <p>Admin still keeps overall roster control and visibility rules.</p>
        </div>
      </Card>
    </div>
  );
}
