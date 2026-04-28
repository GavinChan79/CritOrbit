import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Business Assignment Help Malaysia | CritOrbit",
  description:
    "Get business assignment help in Malaysia. Find helpers for case studies, reports, presentations, and deadline pressure on CritOrbit.",
};

const helpAreas = [
  ["Case studies", "Get support understanding scenarios, business problems, and how to structure stronger responses."],
  ["Reports", "Find help for writing, editing, and organizing business reports with clearer flow and structure."],
  ["Presentation slides", "Browse support for turning business analysis into cleaner, more persuasive presentation decks."],
  ["Research tasks", "Move faster when your assignment needs supporting research, examples, and organized ideas."],
] as const;

const audience = [
  ["Diploma students", "Useful for business coursework that needs clearer writing, analysis, and presentation support."],
  ["Degree students", "A strong fit for more advanced case studies, reports, and strategic assignment work."],
] as const;

const reasons = [
  ["Fast response", "CritOrbit helps students take action quickly when business assignments pile up near the deadline."],
  ["Relevant helpers", "The platform is designed to make helper discovery feel more focused and less random."],
  ["Student-friendly support", "It gives students a cleaner route to assignment help without the usual search friction."],
] as const;

const steps = [
  ["01", "Browse options", "Start by exploring helpers who suit business-related coursework and report tasks.", "bg-yellow"],
  ["02", "Review strengths", "Compare profiles and pick a helper who feels aligned with your assignment needs.", "bg-pink"],
  ["03", "Keep the work moving", "Use CritOrbit to build momentum on case studies, writing, and presentation tasks.", "bg-blue text-white"],
] as const;

const relatedPages = [
  ["/assignment-help-malaysia", "Assignment Help Malaysia"],
  ["/coding-assignment-help-malaysia", "Coding Assignment Help Malaysia"],
  ["/engineering-assignment-help-malaysia", "Engineering Assignment Help Malaysia"],
  ["/urgent-assignment-help-malaysia", "Urgent Assignment Help Malaysia"],
] as const;

export default function BusinessAssignmentHelpMalaysiaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Business Help
              </div>
              <h1 className="mt-6 max-w-4xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Business Assignment Help Malaysia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps Malaysian students find assignment helpers for business coursework, reports,
                presentations, and strategy-heavy classwork.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether you are working through a case study, shaping a report, or trying to present ideas more
                clearly, this page helps students understand the kind of business assignment help available on CritOrbit.
              </p>
              <div className="mt-8">
                <Link href="/" className={buttonStyles({ tone: "purple", size: "lg" })}>
                  Browse Helpers
                </Link>
              </div>
            </div>
            <div className="retro-outline-lg rounded-[34px] bg-paper p-6 md:p-8">
              <div className="rounded-[28px] border-[3px] border-line bg-purple p-6 text-white">
                <div className="retro-pill inline-flex bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-ink">
                  Coursework Support
                </div>
                <div className="mt-5 display-font text-3xl font-black leading-tight">
                  Help for reports, analysis, and presentation work
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {helpAreas.map(([title, copy], index) => (
                    <div
                      key={title}
                      className={`rounded-[22px] border-[3px] border-line p-4 shadow-[5px_5px_0_rgba(31,27,24,0.28)] ${
                        index % 2 === 0 ? "bg-green text-white" : "bg-pink text-ink"
                      }`}
                    >
                      <div className="display-font text-2xl font-black">{title}</div>
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em]">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="Trust Signals" title="Why Students Choose CritOrbit" description="Students use CritOrbit because it feels faster, clearer, and more reliable when assignment pressure builds." />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "50+ students helped",
              "Fast response within 1 hour",
              "Trusted by Malaysian university students",
              "Real helper portfolios with proven results",
            ].map((item, index) => (
              <Card key={item} className={index === 2 ? "bg-yellow" : "bg-white"}>
                <div className="flex items-start gap-3">
                  <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">{`0${index + 1}`}</span>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-ink">{item}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="Help Areas" title="What kind of business help" description="Browse support for the most common types of business assignments." />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {helpAreas.map(([title, copy]) => (
              <Card key={title} className="bg-white">
                <h2 className="display-font text-2xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-green py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeading eyebrow="Who It Helps" title="Who this is for" description="A useful route for business students who want practical assignment support." />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {audience.map(([title, copy]) => (
                <Card key={title} className="border-white bg-white/10 text-white backdrop-blur">
                  <h2 className="display-font text-2xl font-black">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/80">{copy}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="Why CritOrbit" title="Why use CritOrbit" description="Students use CritOrbit when they need a more direct route to assignment support." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map(([title, copy], index) => (
              <Card key={title} className={index === 0 ? "bg-yellow" : "bg-white"}>
                <h2 className="display-font text-2xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="How It Works" title="How it works" description="A simple path for students who need business assignment help in Malaysia." align="center" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map(([number, title, copy, accent]) => (
              <Card key={title} className="bg-white">
                <div className={`inline-flex rounded-[18px] border-[3px] border-line px-4 py-2 display-font text-3xl font-black ${accent}`}>
                  {number}
                </div>
                <h2 className="mt-5 display-font text-2xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="Internal Links" title="Related Assignment Help" description="Explore more CritOrbit pages for other types of assignment support." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedPages.map(([href, label], index) => (
              <Link key={href} href={href} className="block">
                <Card className={index === 0 ? "bg-yellow" : "bg-white"}>
                  <h2 className="display-font text-2xl font-black">{label}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">Browse {label.toLowerCase()} on CritOrbit.</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <div className="retro-outline-lg rounded-[36px] bg-purple px-6 py-10 text-white md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="display-font text-4xl font-black">Ready to browse business helpers?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Explore CritOrbit for support with business case studies, reports, and presentation work.
                </p>
                <p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-yellow">Get help before your deadline hits.</p>
              </div>
              <Link href="/" className={buttonStyles({ tone: "yellow", size: "lg" })}>
                Browse Helpers
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
