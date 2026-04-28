import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Urgent Assignment Help Malaysia | CritOrbit",
  description:
    "Get urgent assignment help in Malaysia. Find helpers for reports, coding, slides, and fast deadline support on CritOrbit.",
};

const helpAreas = [
  ["Fast deadline support", "Useful when your assignment deadline is close and you need to act quickly."],
  ["Reports and writing", "Find help when urgent written work still needs clearer flow, cleanup, or structure."],
  ["Coding and technical tasks", "Browse support for urgent programming, calculation, or technical assignment pressure."],
  ["Presentation work", "Move faster on slides and visual delivery when there is almost no time left."],
] as const;

const audience = [
  ["Students under pressure", "Helpful for anyone trying to recover momentum on overdue or nearly due assignments."],
  ["University and diploma students", "A practical route for students at different levels who need faster support."],
] as const;

const reasons = [
  ["Fast response", "CritOrbit is shaped around the reality that many students start looking for help at the last minute."],
  ["Clearer browsing", "Students can move directly into browsing instead of losing time in unclear search loops."],
  ["Student-friendly flow", "The platform keeps things simple when you are already stressed by the deadline."],
] as const;

const steps = [
  ["01", "Browse quickly", "Start on CritOrbit and immediately explore helpers relevant to your urgent assignment.", "bg-yellow"],
  ["02", "Choose a fit", "Compare profiles fast and shortlist the option that feels most useful right now.", "bg-pink"],
  ["03", "Keep the deadline alive", "Use the platform to regain momentum on writing, coding, or presentation work.", "bg-green text-white"],
] as const;

const relatedPages = [
  ["/last-minute-assignment-help-malaysia", "Last Minute Assignment Help Malaysia"],
  ["/cheap-assignment-help-malaysia", "Cheap Assignment Help Malaysia"],
  ["/coding-assignment-help-malaysia", "Coding Assignment Help Malaysia"],
  ["/assignment-help-malaysia", "Assignment Help Malaysia"],
] as const;

export default function UrgentAssignmentHelpMalaysiaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Urgent Help
              </div>
              <h1 className="mt-6 max-w-4xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Urgent Assignment Help Malaysia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps Malaysian students find assignment helpers when deadlines are close and the work still
                needs support.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether the urgent task is a report, coding assignment, or presentation, this page helps students
                understand the kind of urgent assignment help available on CritOrbit.
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
                  Deadline Pressure
                </div>
                <div className="mt-5 display-font text-3xl font-black leading-tight">
                  A faster route when time is running out
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {helpAreas.map(([title, copy], index) => (
                    <div
                      key={title}
                      className={`rounded-[22px] border-[3px] border-line p-4 shadow-[5px_5px_0_rgba(31,27,24,0.28)] ${
                        index % 2 === 0 ? "bg-red text-white" : "bg-pink text-ink"
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
              <Card key={item} className={index === 0 ? "bg-yellow" : "bg-white"}>
                <div className="flex items-start gap-3">
                  <span className="retro-pill bg-purple px-3 py-1 text-xs font-black uppercase text-white">{`0${index + 1}`}</span>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-ink">{item}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="Help Areas" title="What kind of urgent help" description="Browse support for the kinds of assignment tasks students often leave too late." />
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
            <SectionHeading eyebrow="Who It Helps" title="Who this is for" description="A useful route for students trying to recover from deadline pressure." />
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
          <SectionHeading eyebrow="Why CritOrbit" title="Why use CritOrbit" description="Students use CritOrbit when they need a faster way to respond to assignment stress." />
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
          <SectionHeading eyebrow="How It Works" title="How it works" description="A simple path for students who need urgent assignment help in Malaysia." align="center" />
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
          <SectionHeading eyebrow="Internal Links" title="Related Assignment Help" description="Explore more CritOrbit pages for last minute, coding, and broader assignment support." />
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
                <div className="display-font text-4xl font-black">Ready to browse urgent help?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Explore CritOrbit for support with urgent reports, coding tasks, and fast-moving assignment pressure.
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
