import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { parseSpecialties } from "@/lib/helpers";
import { getCategoryLabel } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { Card, SectionHeading, SiteHeader, buttonStyles } from "@/components/ui";
import { HelperDetailActions } from "@/components/helper-detail-actions";

export default async function HelperDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ helperId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();
  const { helperId } = await params;
  const query = await searchParams;
  const draftId = readQuery(query.draftId);

  const helper = await prisma.helper.findFirst({
    where: {
      id: helperId,
      isActive: true,
    },
    include: {
      portfolioItems: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!helper) {
    notFound();
  }

  const specialties = parseSpecialties(helper.specialties);

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={draftId ? `/helpers/select?draftId=${draftId}` : "/#helpers"}
            className={buttonStyles({ tone: "ink", size: "sm" })}
          >
            {draftId ? "Back to Helper Selection" : "Back to Homepage"}
          </Link>
        </div>

        <div className="mt-5">
          <SectionHeading
            eyebrow="Helper Portfolio"
            title={helper.name}
            description="Review the helper profile, specialties, and portfolio before starting the match flow."
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <Card className="bg-white">
              <div className="flex flex-wrap items-center gap-3">
                <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">
                  {getCategoryLabel(helper.category)}
                </span>
                <span className="retro-pill bg-yellow px-3 py-1 text-xs font-black uppercase text-ink">
                  {specialties.length} specialties
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted">{helper.shortBio}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <span
                    key={specialty.code}
                    className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase"
                  >
                    {specialty.label}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="bg-white">
              <div className="display-font text-2xl font-black">Take the next step</div>
              <p className="mt-3 text-sm leading-7 text-muted">
                {draftId
                  ? "If this looks like the right fit, you can match with this helper immediately."
                  : "Start from the brief form to get matched with the right helper for your request."}
              </p>
              <div className="mt-5">
                <HelperDetailActions
                  helperId={helper.id}
                  draftId={draftId || undefined}
                  helperName={helper.name}
                />
              </div>
            </Card>
          </div>

          <Card className="bg-white">
            <div className="display-font text-3xl font-black">Portfolio</div>
            <p className="mt-3 text-sm text-muted">
              A clearer look at sample work, presentation quality, and supporting links.
            </p>

            {helper.portfolioItems.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {helper.portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-[22px] border-[3px] border-line bg-cream"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-52 w-full object-cover"
                    />
                    <div className="space-y-3 p-4">
                      <div className="display-font text-2xl font-black">{item.title}</div>
                      {item.description ? (
                        <p className="text-sm leading-7 text-muted">{item.description}</p>
                      ) : (
                        <p className="text-sm leading-7 text-muted">
                          Portfolio sample prepared by the admin team for public viewing.
                        </p>
                      )}
                      {item.externalLink ? (
                        <a
                          href={item.externalLink}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonStyles({ tone: "yellow", size: "sm" })}
                        >
                          Open External Link
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[22px] border-[3px] border-line bg-cream p-5 text-sm text-muted">
                Portfolio samples will appear here once the admin team adds them.
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

function readQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
