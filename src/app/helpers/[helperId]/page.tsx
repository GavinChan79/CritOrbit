import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  getCategoryLabel,
  getHelperBookedTimeLabel,
  getHelperDeliveryTime,
  getHelperDetailPitch,
  getHelperPastWorksLabel,
  getHelperPriceAnchor,
  getHelperPriceTierLabel,
  getHelperProjectsCompleted,
  getHelperRankingReasons,
  getHelperResponseSpeed,
  getStudentsHelpedLabel,
  getHelperTrustLevelLabel,
  isFastResponseText,
  parseSpecialties,
} from "@/lib/helpers";
import { getPublicHelperById } from "@/lib/public-helpers";
import { Card, SectionHeading, SiteHeader, buttonStyles } from "@/components/ui";
import { TrackEventOnMount } from "@/components/event-tracker";
import { HelperDetailActions } from "@/components/helper-detail-actions";
import { HelperAvatar } from "@/components/helper-avatar";
import { HelperPortfolioPreview } from "@/components/helper-portfolio-preview";
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

  const helper = await getPublicHelperById(helperId, {
    include: {
      verification: {
        select: {
          status: true,
        },
      },
      portfolioItems: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!helper) {
    notFound();
  }

  const specialties = parseSpecialties(helper.specialties);
  const heroSpecialties = specialties.slice(0, 2);
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
  const studioPitch = getHelperDetailPitch({
    category: helper.category,
    type: helper.type,
    projectsCompleted,
  });
  const responseSpeed = getHelperResponseSpeed({
    type: helper.type,
    isVerified: helper.isVerified,
    trustLevel: helper.trustLevel,
    responseTime: helper.responseTime,
  });
  const deliveryTime = getHelperDeliveryTime({
    type: helper.type,
    isVerified: helper.isVerified,
    trustLevel: helper.trustLevel,
    deliveryTime: helper.deliveryTime,
  });
  const portfolioLabel = getHelperPastWorksLabel(helper.portfolioItems.length);
  const bookedTimeLabel = getHelperBookedTimeLabel({
    type: helper.type,
    selectionCount: null,
    clickCount: null,
    lastBookedAt: helper.lastBookedAt,
  });
  const studentsHelpedLabel = getStudentsHelpedLabel({
    type: helper.type,
    studentsHelpedCount: helper.studentsHelpedCount,
    projectsCompleted: helper.projectsCompleted,
  });
  const tagline =
    helper.type === "TEAM"
      ? "Studio support for urgent, presentation-ready student work."
      : "Reliable assignment support with clear communication and fast turnaround.";
  const fastResponse = isFastResponseText(responseSpeed);
  const trustLabel = getHelperTrustLevelLabel(helper);
  const reasonPills = getHelperRankingReasons({
    type: helper.type,
    trustLevel: helper.trustLevel,
    responseTime: helper.responseTime,
    lastBookedAt: helper.lastBookedAt,
    getHelpClickCount: helper.selectionCount ?? 0,
    whatsappRedirectCount: helper.selectionCount ?? 0,
    profileViewCount: helper.clickCount ?? 0,
    limit: 4,
  });

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <TrackEventOnMount
        eventType="VIEW_HELPER_PROFILE"
        helperId={helper.id}
        draftId={draftId || undefined}
        metadata={{ surface: "helper-profile" }}
      />
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
            description="Review the helper profile, trust signals, and portfolio before starting the match flow."
          />
        </div>

        <div className="mt-8 space-y-6">
          <Card className="bg-white">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                  <div className="shrink-0">
                    <HelperAvatar
                      name={helper.name}
                      imageUrl={undefined}
                      sizeClass="h-28 w-28"
                      roundedClass="rounded-[28px]"
                      textClass="text-4xl"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={cn(
                          "retro-pill px-3 py-1 text-xs font-black uppercase",
                          helper.trustLevel === "TRUSTED_HELPER" && "bg-green text-white",
                          helper.trustLevel === "VERIFIED_HELPER" && "bg-blue text-white",
                          helper.trustLevel === "STANDARD_HELPER" && "bg-white text-ink",
                        )}
                      >
                        {helper.trustLevel === "TRUSTED_HELPER"
                          ? "Trusted Helper ★"
                          : helper.trustLevel === "VERIFIED_HELPER"
                            ? "Verified Helper ✓"
                            : trustLabel}
                      </span>
                      <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">
                        {getCategoryLabel(helper.category)}
                      </span>
                      {fastResponse ? (
                        <span className="retro-pill bg-yellow px-3 py-1 text-xs font-black uppercase text-ink">
                          Fast Response ⚡
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 text-sm font-bold text-ink">{tagline}</p>
                    <p className="mt-3 text-sm leading-7 text-muted">{helper.shortBio}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {heroSpecialties.map((specialty) => (
                        <span
                          key={specialty.code}
                          className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase"
                        >
                          {specialty.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full xl:w-[320px]">
                <div className="rounded-[20px] border-[3px] border-line bg-[#f3fff5] px-4 py-4">
                  <div className="text-sm font-black text-ink">Get Help Now {"\u2192"}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    You&apos;ll be connected via WhatsApp instantly
                  </div>
                  <div className="mt-4">
                    <HelperDetailActions helperId={helper.id} draftId={draftId || undefined} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[18px] border-[3px] border-line bg-yellow px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-ink/70">Price</div>
                <div className="mt-2 display-font text-xl font-black text-ink">
                  {getHelperPriceAnchor({
                    type: helper.type,
                    projectsCompleted: helper.projectsCompleted,
                    priceTier: helper.priceTier,
                    priceAnchor: helper.priceAnchor,
                  })}
                </div>
                <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-ink/70">
                  {getHelperPriceTierLabel(helper.priceTier)}
                </div>
              </div>

              <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">Delivery</div>
                <div className="mt-2 text-sm font-black text-ink">{deliveryTime}</div>
              </div>

              <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">Students Helped</div>
                <div className="mt-2 text-sm font-black text-ink">{studentsHelpedLabel}</div>
              </div>

              <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">Response Time</div>
                <div className="mt-2 text-sm font-black text-ink">{responseSpeed}</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {reasonPills.slice(0, 4).map((reason) => (
                <span
                  key={`${helper.id}-reason-${reason}`}
                  className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase"
                >
                  {reason}
                </span>
              ))}
              <span className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase">
                {portfolioLabel}
              </span>
              <span className="retro-pill bg-pink px-3 py-1 text-xs font-black uppercase text-ink">
                {bookedTimeLabel}
              </span>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="bg-white">
              <div className="display-font text-2xl font-black">
                {helper.type === "TEAM" ? "About the Studio" : "About the Helper"}
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                {studioPitch.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>

              {helper.portfolioNote ? (
                <div className="mt-5 rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm leading-7 text-muted">
                  <span className="font-black uppercase tracking-[0.14em]">Portfolio Note</span>
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
              <div className="display-font text-3xl font-black">
                {helper.type === "TEAM" ? "Studio Portfolio" : "Portfolio"}
              </div>
              <p className="mt-3 text-sm text-muted">
                A clearer look at sample work, presentation quality, and supporting links.
              </p>

              {helper.portfolioItems.length ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {helper.portfolioItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "overflow-hidden rounded-[22px] border-[3px] border-line bg-cream",
                        index > 1 && "hidden md:block",
                      )}
                    >
                      <HelperPortfolioPreview
                        item={item}
                        variant="detail"
                        className="rounded-none border-0 shadow-none"
                      />
                      <div className="space-y-3 p-4">
                        <div className="line-clamp-2 display-font text-2xl font-black">{item.title}</div>
                        {item.description ? (
                          <p className="line-clamp-3 text-sm leading-7 text-muted">{item.description}</p>
                        ) : (
                          <p className="text-sm leading-7 text-muted">
                            Portfolio sample prepared for public viewing.
                          </p>
                        )}
                        {item.externalLink ? (
                          <a
                            href={item.externalLink}
                            target="_blank"
                            rel="noreferrer"
                            className={buttonStyles({ tone: "yellow", size: "sm" })}
                          >
                            {isPdfPortfolioItem(item) ? "Open Portfolio File" : "Open External Link"}
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
        </div>
      </main>
    </div>
  );
}

function readQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isPdfPortfolioItem(item: { imageUrl: string; externalLink?: string | null }) {
  return [item.externalLink, item.imageUrl].some((value) =>
    typeof value === "string" && /\.pdf(?:[?#]|$)/i.test(value.toLowerCase()),
  );
}
