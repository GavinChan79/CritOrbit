import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { APP_NAME, APP_POWERED_BY, APP_TAGLINE } from "@/lib/constants";
import {
  getCategoryLabel,
  getHelperBookedTimeLabel,
  getHelperCardSpecialties,
  getHelperDeliveryTime,
  getHelperLastActiveLabel,
  getHelperPastWorksLabel,
  getHelperPriceAnchor,
  getHelperPriceTierLabel,
  getHelperReplyLine,
  getHelperResponseSpeed,
  getHelperTrustedByLabel,
  getHelperTypeLabel,
  getHelperUrgencySignals,
  isFastResponseText,
  parseSpecialties,
} from "@/lib/helpers";
import {
  getHelperCompletionScore,
  getHelperConversionTierLabel,
  rankHelpersByConversion,
} from "@/lib/helper-ranking";
import { buttonStyles, Card, SectionHeading, SiteFooter, SiteHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  noStore();

  const helpers = await prisma.helper.findMany({
    where: { isActive: true, status: "ACTIVE" },
    include: {
      verification: {
        select: {
          status: true,
        },
      },
      _count: {
        select: {
          portfolioItems: true,
        },
      },
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
        take: 3,
      },
    },
  });
  const sortedHelpers = rankHelpersByConversion(
    helpers.map((helper) => ({
      ...helper,
      completionScore: getHelperCompletionScore({
        name: helper.name,
        shortBio: helper.shortBio,
        email: helper.email,
        whatsappNumber: helper.whatsappNumber,
        responseTime: helper.responseTime,
        deliveryTime: helper.deliveryTime,
        portfolioNote: helper.portfolioNote,
        specialties: helper.specialties,
        type: helper.type,
        teamSize: helper.teamSize,
        portfolioItemsCount: helper._count.portfolioItems,
        verificationStatus: helper.verification?.status ?? "NONE",
      }),
      portfolioItemsCount: helper._count.portfolioItems,
    })),
  )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Malaysia Student Help Platform
              </div>
              <h1 className="mt-6 max-w-xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Get Your Assignment Done. Fast.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-ink/80">
                {APP_TAGLINE} Malaysia&apos;s helper platform for students who need the right support fast.
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                {APP_POWERED_BY}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/requirements" className={buttonStyles({ tone: "purple", size: "lg" })}>
                  Get Help Now {"\u2192"}
                </Link>
                <Link href="/#helpers" className={buttonStyles({ tone: "yellow", size: "lg" })}>
                  Browse Helpers
                </Link>
                <Link href="/become-helper" className={buttonStyles({ tone: "ink", size: "lg" })}>
                  Become a Helper
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="retro-outline-lg relative rounded-[34px] bg-paper p-8">
                <div className="paper-dots relative overflow-hidden rounded-[28px] border-[3px] border-line bg-purple p-8 text-white">
                  <div className="absolute right-5 top-5 h-16 w-16 rounded-full border-[3px] border-white/70 bg-yellow/85 shadow-[4px_4px_0_rgba(31,27,24,0.4)]" />
                  <div className="absolute bottom-6 right-8 h-5 w-20 rotate-[-8deg] rounded-full border-[3px] border-line bg-pink" />
                  <div className="absolute left-6 top-20 h-3 w-3 rounded-full bg-white/90" />

                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                    <div className="retro-pill bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-ink">
                      Live Control Board
                    </div>
                    <div className="flex items-center gap-2 rounded-full border-[2px] border-white/70 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em]">
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow" />
                      Admin Routed
                    </div>
                  </div>

                  <div className="relative z-10 mt-5 flex items-start justify-between gap-4">
                    <div className="max-w-sm">
                      <div className="display-font text-3xl font-black leading-tight md:text-[2.15rem]">
                        Orbit Control Board
                      </div>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-white/88">
                        A playful control panel for urgent briefs, curated helper picks, and smooth WhatsApp handoff.
                      </p>
                    </div>
                    <div className="hidden rounded-[18px] border-[3px] border-white/70 bg-white/10 px-4 py-3 text-right sm:block">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
                        Queue
                      </div>
                      <div className="display-font mt-1 text-2xl font-black">03</div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-[1.02fr_0.98fr]">
                    <div className="rounded-[24px] border-[3px] border-line bg-pink p-5 text-ink shadow-[5px_5px_0_rgba(31,27,24,0.28)]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-black uppercase tracking-[0.18em]">Rendering</div>
                        <span className="retro-pill bg-white px-3 py-1 text-[10px] font-black uppercase">24h Slot</span>
                      </div>
                      <div className="mt-3 display-font text-[1.7rem] font-black leading-tight">Fast turnarounds</div>
                      <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
                        <span className="text-lg">{"\u2197"}</span>
                        Deadline-friendly output
                      </div>
                    </div>

                    <div className="rounded-[24px] border-[3px] border-line bg-green p-5 text-white shadow-[5px_5px_0_rgba(31,27,24,0.28)]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-black uppercase tracking-[0.18em]">Interior + Arch</div>
                        <span className="retro-pill bg-white px-3 py-1 text-[10px] font-black uppercase text-ink">50+ Roster</span>
                      </div>
                      <div className="mt-3 display-font text-[1.7rem] font-black leading-tight">Curated helpers</div>
                      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                        <span className="rounded-full border-[2px] border-white/70 bg-white/10 px-2 py-1">Layouts</span>
                        <span className="rounded-full border-[2px] border-white/70 bg-white/10 px-2 py-1">Boards</span>
                        <span className="rounded-full border-[2px] border-white/70 bg-white/10 px-2 py-1">Portfolios</span>
                      </div>
                    </div>

                    <div className="rounded-[26px] border-[3px] border-line bg-blue p-5 text-white shadow-[5px_5px_0_rgba(31,27,24,0.28)] sm:col-span-2">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="retro-pill bg-white px-3 py-1 text-[10px] font-black uppercase text-ink">
                              Controlled Flow
                            </span>
                            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
                              Brief {"\u2192"} Match {"\u2192"} WhatsApp
                            </span>
                          </div>
                          <div className="mt-3 max-w-xl display-font text-[1.55rem] font-black leading-tight">
                            Students never message helpers directly. Admin owns the handoff from the first click.
                          </div>
                        </div>
                        <div className="rounded-[22px] border-[3px] border-white/70 bg-white/12 px-4 py-4">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                            Route
                          </div>
                          <div className="mt-2 display-font text-xl font-black">WA Redirect {"\u2192"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -left-6 -top-6 rounded-[22px] border-[3px] border-line bg-red px-4 py-3 display-font text-lg font-black text-white shadow-[5px_5px_0_var(--line)]">
                  Bold. Clear. Functional.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading
            eyebrow="How It Works"
            title="A simple, controlled student support flow"
            description={`${APP_NAME} keeps the playful front-end experience while routing every real conversation through admin.`}
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["01", "Fill Your Brief", "Tell us your course, task type, urgency, deadline, budget, and assignment details.", "bg-yellow"],
              ["02", "Pick a Helper", "Browse recommended helpers based on category and specialty tags.", "bg-pink"],
              ["03", "WhatsApp & Done", "We create the lead and open admin WhatsApp with your pre-filled request.", "bg-blue text-white"],
            ].map(([number, title, copy, badgeClass]) => (
              <Card key={title} className="bg-white">
                <div
                  className={`inline-flex rounded-[18px] border-[3px] border-line px-4 py-2 display-font text-3xl font-black ${badgeClass}`}
                >
                  {number}
                </div>
                <h3 className="mt-5 display-font text-2xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-green py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeading eyebrow={`Why ${APP_NAME}`} title="Built for students under pressure" />
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {[
                ["50+", "Helpers"],
                ["Fast", "Reply"],
                ["RM100–RM2000", "Budget Range"],
                ["Interior + Architecture", "Coverage"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[28px] border-[3px] border-white bg-white/10 p-6 backdrop-blur">
                  <div className="display-font text-3xl font-black">{value}</div>
                  <div className="mt-2 text-sm font-bold uppercase tracking-[0.18em]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="helpers" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Featured Helpers"
              title="A few creative partners from the roster"
              description="All helpers are still routed through admin so the platform stays controlled."
            />
            <Link href="/requirements" className={buttonStyles({ tone: "pink", size: "md" })}>
              Start Matching
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {sortedHelpers.map((helper, index) => {
              const specialties = getHelperCardSpecialties(
                parseSpecialties(helper.specialties),
              );
              const urgencySignals = getHelperUrgencySignals({
                type: helper.type,
                teamSize: helper.teamSize,
                isVerified: helper.isVerified,
                projectsCompleted: helper.projectsCompleted,
              });
              const responseSpeed = getHelperResponseSpeed({
                type: helper.type,
                isVerified: helper.isVerified,
                responseTime: helper.responseTime,
              });
              const deliveryTime = getHelperDeliveryTime({
                type: helper.type,
                isVerified: helper.isVerified,
                deliveryTime: helper.deliveryTime,
              });
              const trustedByLabel = getHelperTrustedByLabel({
                type: helper.type,
                teamSize: helper.teamSize,
                isVerified: helper.isVerified,
                projectsCompleted: helper.projectsCompleted,
                selectionCount: helper.selectionCount,
                portfolioItems: helper.portfolioItems,
                specialties: parseSpecialties(helper.specialties),
              });
              const portfolioLabel = getHelperPastWorksLabel(helper.portfolioItems.length);
              const bookedTimeLabel = getHelperBookedTimeLabel({
                type: helper.type,
                selectionCount: helper.selectionCount,
                clickCount: helper.clickCount,
              });
              const profileImage = helper.portfolioItems[0]?.imageUrl;
              const fastResponse = isFastResponseText(responseSpeed);
              const demandLabel = helper.conversionTier === "TOP_PICK" ? "\uD83D\uDD25 High demand today" : null;
              const slotsLabel = helper.conversionTier === "TOP_PICK" ? "\u26A0\uFE0F Limited slots available" : null;
              const tierLabel = getHelperConversionTierLabel(helper.conversionTier);

              return (
                <Card
                  key={helper.id}
                  className={cn(
                    index === 1 ? "bg-yellow" : "bg-white",
                    helper.type === "TEAM" && "border-blue bg-[#f4f8ff]",
                    helper.conversionTier === "TOP_PICK" &&
                      "border-[4px] border-green bg-[#f3fff5] shadow-[10px_10px_0_var(--line)]",
                    helper.conversionTier === "POPULAR" && "border-purple bg-[#faf4ff]",
                  )}
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={`${helper.name} profile preview`}
                            className="h-[72px] w-[72px] rounded-[22px] border-[3px] border-line object-cover"
                          />
                        ) : (
                          <div
                            className={cn(
                              "flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border-[3px] border-line display-font text-2xl font-black",
                              helper.type === "TEAM" ? "bg-blue text-white" : "bg-yellow text-ink",
                            )}
                          >
                            {helper.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <Link
                              href={`/helpers/${helper.id}`}
                              className={cn(
                                "display-font text-2xl font-black underline-offset-4 hover:underline",
                                helper.type === "TEAM" && "text-[2rem]",
                              )}
                            >
                              {helper.name}
                            </Link>
                            <div className="flex flex-wrap gap-2">
                              {specialties.map((specialty) => (
                                <span
                                  key={specialty.code}
                                  className="retro-pill bg-cream px-3 py-1 text-xs font-black uppercase"
                                >
                                  {specialty.label}
                                </span>
                              ))}
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
                            <div className="mt-2 text-sm font-black text-ink">
                              {deliveryTime} delivery
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={cn(
                              "retro-pill px-3 py-1 text-xs font-black uppercase",
                              helper.type === "TEAM" ? "bg-blue text-white" : "bg-cream text-ink",
                            )}
                          >
                            {getHelperTypeLabel(helper.type)}
                          </span>
                          {helper.isVerified ? (
                            <span className="retro-pill bg-green px-3 py-1 text-xs font-black uppercase text-white">
                              Verified Helper
                            </span>
                          ) : null}
                          {fastResponse ? (
                            <span className="retro-pill bg-yellow px-3 py-1 text-xs font-black uppercase text-ink">
                              Fast Response ⚡
                            </span>
                          ) : null}
                          {helper.type === "TEAM" ? (
                            <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">
                              Team
                            </span>
                          ) : null}
                          <span
                            className={cn(
                              "retro-pill px-3 py-1 text-xs font-black uppercase",
                              helper.conversionTier === "TOP_PICK" && "bg-green text-white",
                              helper.conversionTier === "POPULAR" && "bg-purple text-white",
                              helper.conversionTier === "STANDARD" && "bg-white text-ink",
                            )}
                          >
                            {tierLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-black text-ink">
                        {trustedByLabel} {"\u2022"} {bookedTimeLabel}
                      </div>
                      <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-black text-ink">
                        {getHelperReplyLine(responseSpeed)}
                      </div>
                      <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-black text-ink">
                        {portfolioLabel}
                      </div>
                      <div className="rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-black text-ink">
                        {bookedTimeLabel}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase">
                        {getCategoryLabel(helper.category)}
                      </span>
                      <span className="retro-pill bg-white px-3 py-1 text-xs font-black uppercase">
                        {getHelperLastActiveLabel({ type: helper.type })}
                      </span>
                      {demandLabel ? (
                        <span className="retro-pill bg-pink px-3 py-1 text-xs font-black uppercase text-ink">
                          {demandLabel}
                        </span>
                      ) : null}
                      {slotsLabel ? (
                        <span className="retro-pill bg-yellow px-3 py-1 text-xs font-black uppercase text-ink">
                          {slotsLabel}
                        </span>
                      ) : null}
                      {urgencySignals.slice(0, 1).map((signal) => (
                        <span
                          key={`${helper.id}-${signal}`}
                          className="retro-pill bg-pink px-3 py-1 text-xs font-black uppercase text-ink"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {helper.portfolioItems.length ? (
                    <div className="mt-5">
                      <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                        {helper.type === "TEAM" ? "Studio Portfolio" : "Portfolio"}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {helper.portfolioItems.map((item) => (
                          <div
                            key={item.id}
                            className="overflow-hidden rounded-[18px] border-[3px] border-line bg-cream"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-24 w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-5">
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/helpers/${helper.id}`} className={buttonStyles({ tone: "green", size: "sm" })}>
                        Get Help with Your Assignment {"\u2192"}
                      </Link>
                      <Link href={`/helpers/${helper.id}`} className={buttonStyles({ tone: "yellow", size: "sm" })}>
                        View Profile
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <div className="retro-outline-lg rounded-[36px] bg-purple px-6 py-10 text-white md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="display-font text-4xl font-black">Start Your Creative Journey</div>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">
                  Brief us once, browse the right helper, then let {APP_NAME} handle the routing and follow-up.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/requirements" className={buttonStyles({ tone: "yellow", size: "lg" })}>
                  Get Help Now {"\u2192"}
                </Link>
                <Link href="/become-helper" className={buttonStyles({ tone: "ink", size: "lg" })}>
                  Join as Helper
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="faqs" className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
          <SectionHeading eyebrow="FAQs" title="A few important rules" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["Can I contact helpers directly?", `No. All communication is routed through ${APP_NAME} admin WhatsApp.`],
              ["Do you support payments?", "Not in Phase 1. Admin handles matching and deal tracking manually."],
              ["Can I use this for architecture and interior work?", "Yes. Both categories are supported in the current helper roster."],
              ["Will I see my request status later?", "Yes, logged-in users can track requests from the dashboard."],
            ].map(([question, answer]) => (
              <Card key={question} className="bg-white">
                <h3 className="display-font text-2xl font-black">{question}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{answer}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
