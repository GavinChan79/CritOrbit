import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  getCategoryLabel,
  getHelperDeliveryTime,
  getHelperDetailPitch,
  getHelperPriceAnchor,
  getHelperPriceTierLabel,
  getHelperProjectsCompleted,
  getHelperResponseSpeed,
  getHelperTypeLabel,
  getHelperUrgencySignals,
  parseSpecialties,
} from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { Card, SectionHeading, SiteHeader, buttonStyles } from "@/components/ui";
import { HelperDetailActions } from "@/components/helper-detail-actions";
import { cn } from "@/lib/utils";

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
      status: "ACTIVE",
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
  const projectsCompleted = getHelperProjectsCompleted({
    type: helper.type,
    teamSize: helper.teamSize,
    isVerified: helper.isVerified,
    projectsCompleted: helper.projectsCompleted,
    responseTime: helper.responseTime,
    deliveryTime: helper.deliveryTime,
    repeatClients: helper.repeatClients,
    priceTier: helper.priceTier,
    portfolioItems: helper.portfolioItems,
    specialties,
  });
  const urgencySignals = getHelperUrgencySignals({
    type: helper.type,
    teamSize: helper.teamSize,
    isVerified: helper.isVerified,
    projectsCompleted: helper.projectsCompleted,
  });
  const studioPitch = getHelperDetailPitch({
    category: helper.category,
    type: helper.type,
    projectsCompleted,
  });

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
                <span
                  className={cn(
                    "retro-pill px-3 py-1 text-xs font-black uppercase",
                    helper.type === "TEAM" ? "bg-blue text-white" : "bg-cream text-ink",
                  )}
                >
                  {getHelperTypeLabel(helper.type)}
                </span>
                <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">
                  {getCategoryLabel(helper.category)}
                </span>
                <span className="retro-pill bg-yellow px-3 py-1 text-xs font-black uppercase text-ink">
                  {specialties.length} specialties
                </span>
                <span className="retro-pill bg-pink px-3 py-1 text-xs font-black uppercase text-ink">
                  {helper.type === "TEAM" ? "Booked recently" : "Picked recently"}
                </span>
                {helper.isVerified ? (
                  <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
                    Verified
                  </span>
                ) : null}
              </div>
              <p
                className={cn(
                  "mt-5 text-sm leading-7 text-muted",
                  helper.type === "TEAM" && "font-semibold text-ink",
                )}
              >
                {helper.shortBio}
              </p>
              {helper.teamSize ? (
                <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Team size: {helper.teamSize}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">
                    Trust
                  </div>
                  <div className="mt-2 text-sm font-black text-ink">
                    {helper.type === "TEAM"
                      ? `Handled ${projectsCompleted}+ student projects`
                      : `${projectsCompleted || 24}+ projects`}
                  </div>
                </div>
                <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">
                    Response
                  </div>
                  <div className="mt-2 text-sm font-black text-ink">
                    {getHelperResponseSpeed({
                      type: helper.type,
                      isVerified: helper.isVerified,
                      responseTime: helper.responseTime,
                    })}
                  </div>
                </div>
                <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">
                    Delivery
                  </div>
                  <div className="mt-2 text-sm font-black text-ink">
                    {getHelperDeliveryTime({
                      type: helper.type,
                      isVerified: helper.isVerified,
                      deliveryTime: helper.deliveryTime,
                    })}
                  </div>
                </div>
                <div className="rounded-[18px] border-[3px] border-line bg-yellow px-4 py-3">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-ink/70">
                    Price
                  </div>
                  <div className="mt-2 display-font text-xl font-black text-ink">
                    {getHelperPriceAnchor({
                      type: helper.type,
                      projectsCompleted: helper.projectsCompleted,
                      priceTier: helper.priceTier,
                    })}
                  </div>
                  <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-ink/70">
                    {getHelperPriceTierLabel(helper.priceTier)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {urgencySignals.map((signal) => (
                  <span
                    key={`${helper.id}-${signal}`}
                    className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase"
                  >
                    {signal}
                  </span>
                ))}
                {helper.teamSize ? (
                  <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">
                    Team of {helper.teamSize}
                  </span>
                ) : null}
              </div>
              {helper.portfolioNote ? (
                <div
                  className={cn(
                    "mt-4 rounded-[18px] border-[3px] border-line px-4 py-3 text-sm leading-7",
                    helper.type === "TEAM" ? "bg-blue/10 text-ink" : "bg-cream text-muted",
                  )}
                >
                  <span className="font-black uppercase tracking-[0.14em]">
                    {helper.type === "TEAM" ? "Studio Portfolio" : "Portfolio Note"}
                  </span>
                  <p className="mt-2">{helper.portfolioNote}</p>
                </div>
              ) : null}
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
              <div className="display-font text-2xl font-black">
                {helper.type === "TEAM" ? "About the Studio" : "About"}
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                {studioPitch.map((line) => (
                  <p key={line}>{line}</p>
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
            <div className="display-font text-3xl font-black">
              {helper.type === "TEAM" ? "Studio Portfolio" : "Portfolio"}
            </div>
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
