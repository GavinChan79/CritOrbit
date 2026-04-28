import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Engineering Assignment Help Malaysia | CritOrbit",
  description:
    "Get engineering assignment help in Malaysia. Find helpers for calculations, reports, technical work, and presentations on CritOrbit.",
};

const helpAreas = [
  ["Technical reports", "Get support organizing engineering reports, explanations, and clearer technical writeups."],
  ["Calculations", "Find help working through formulas, numerical steps, and structured problem solving."],
  ["Design and analysis", "Browse support for assignments that involve interpretation, analysis, or technical reasoning."],
  ["Presentation work", "Move faster when engineering coursework needs cleaner slides or stronger visual delivery."],
] as const;

const audience = [
  ["Diploma engineering students", "Useful for students handling foundational technical assignments and report tasks."],
  ["Degree engineering students", "A good fit for more advanced coursework, calculations, and project-based assignments."],
] as const;

const reasons = [
  ["Fast response", "CritOrbit helps engineering students react quickly when the assignment pressure starts building."],
  ["Practical browsing", "Students can explore helpers in a more focused way instead of searching blindly for support."],
  ["Student-friendly flow", "The platform keeps the path simple so students can spend more time on the actual work."],
] as const;

const steps = [
  ["01", "Browse helpers", "Start by exploring helpers who fit technical coursework and engineering tasks.", "bg-yellow"],
  ["02", "Compare strengths", "Review profiles and choose a helper who matches the type of engineering support you need.", "bg-pink"],
  ["03", "Keep the assignment moving", "Use CritOrbit to build progress on calculations, reports, and delivery pressure.", "bg-green text-white"],
] as const;

const relatedPages = [
  ["/coding-assignment-help-malaysia", "Coding Assignment Help Malaysia"],
  ["/programming-assignment-help-malaysia", "Programming Assignment Help Malaysia"],
  ["/urgent-assignment-help-malaysia", "Urgent Assignment Help Malaysia"],
  ["/assignment-help-malaysia", "Assignment Help Malaysia"],
] as const;

export default function EngineeringAssignmentHelpMalaysiaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Engineering Help
              </div>
              <h1 className="mt-6 max-w-4xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Engineering Assignment Help Malaysia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps Malaysian students find assignment helpers for engineering coursework, technical
                reports, calculations, and presentation pressure.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether you are stuck on formulas, writing up technical ideas, or trying to finish an engineering task
                on time, this page helps students understand the kind of support available on CritOrbit.
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
                  Technical Coursework
                </div>
                <div className="mt-5 display-font text-3xl font-black leading-tight">
                  Support for reports, calculations, and engineering tasks
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {helpAreas.map(([title, copy], index) => (
                    <div
                      key={title}
                      className={`rounded-[22px] border-[3px] border-line p-4 shadow-[5px_5px_0_rgba(31,27,24,0.28)] ${
                        index % 2 === 0 ? "bg-blue text-white" : "bg-pink text-ink"
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
              <Card key={item} className={index === 3 ? "bg-yellow" : "bg-white"}>
                <div className="flex items-start gap-3">
                  <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">{`0${index + 1}`}</span>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-ink">{item}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="Help Areas" title="What kind of engineering help" description="Browse support for the most common types of engineering coursework pressure." />
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
            <SectionHeading eyebrow="Who It Helps" title="Who this is for" description="A useful route for engineering students at different study levels." />
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
          <SectionHeading eyebrow="Why CritOrbit" title="Why use CritOrbit" description="Students use CritOrbit when they want a faster and more practical route to support." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map(([title, copy], index) => (
              <Card key={title} className={index === 2 ? "bg-yellow" : "bg-white"}>
                <h2 className="display-font text-2xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="How It Works" title="How it works" description="A simple path for students who need engineering assignment help in Malaysia." align="center" />
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
          <SectionHeading eyebrow="Internal Links" title="Related Assignment Help" description="Explore more CritOrbit pages for technical and urgent assignment support." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedPages.map(([href, label], index) => (
              <Link key={href} href={href} className="block">
                <Card className={index === 1 ? "bg-yellow" : "bg-white"}>
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
                <div className="display-font text-4xl font-black">Ready to browse engineering helpers?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Explore CritOrbit for help with engineering reports, calculations, and technical assignment pressure.
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
