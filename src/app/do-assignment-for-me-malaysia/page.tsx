import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Do Assignment For Me Malaysia | CritOrbit",
  description:
    "Looking for do assignment for me help in Malaysia? Browse reliable assignment helpers for reports, coding, slides, and deadlines on CritOrbit.",
};

const helpAreas = [
  ["Reports and writing", "Get support when written coursework still feels unfinished, unclear, or too heavy to handle alone."],
  ["Coding tasks", "Find help for technical assignments that need debugging, logic, or structured progress."],
  ["Slides and presentations", "Browse support for visual work that needs stronger flow, cleanup, or presentation quality."],
  ["General deadline pressure", "Useful when the assignment load is too much and you need a clearer route forward."],
] as const;

const audience = [
  ["Overloaded students", "Helpful for students who feel buried by deadlines and need support browsing quickly."],
  ["Students balancing multiple commitments", "A practical route when classes, projects, work, or life pressures all collide at once."],
] as const;

const reasons = [
  ["Fast response", "CritOrbit helps students act quickly when they have reached the point of needing real assignment support."],
  ["Broader support types", "The platform works across reports, coding, slides, and general coursework pressure."],
  ["Student-friendly browsing", "It gives students a simpler way to look for help instead of searching in scattered places."],
] as const;

const steps = [
  ["01", "Browse helpers", "Start by exploring helpers who fit the type of assignment support you need right now.", "bg-yellow"],
  ["02", "Compare the options", "Review profiles and choose a helper who feels relevant to the task at hand.", "bg-pink"],
  ["03", "Reduce the pressure", "Use CritOrbit to move your assignment work forward with less chaos and more clarity.", "bg-green text-white"],
] as const;

export default function DoAssignmentForMeMalaysiaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Assignment Help
              </div>
              <h1 className="mt-6 max-w-4xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Do Assignment For Me Malaysia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps Malaysian students browse assignment helpers when coursework pressure is high and they
                need a clearer path to support.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether the task is a report, coding assignment, or slide deck, this page helps students understand the
                type of assignment help they can browse on CritOrbit when they are feeling stuck.
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
                  Student Pressure
                </div>
                <div className="mt-5 display-font text-3xl font-black leading-tight">
                  A simpler route when assignment pressure feels too heavy
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {helpAreas.map(([title, copy], index) => (
                    <div
                      key={title}
                      className={`rounded-[22px] border-[3px] border-line p-4 shadow-[5px_5px_0_rgba(31,27,24,0.28)] ${
                        index % 2 === 0 ? "bg-pink text-ink" : "bg-blue text-white"
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
          <SectionHeading eyebrow="Help Areas" title="What kind of support" description="Browse support for the assignment tasks students often struggle to finish alone." />
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
            <SectionHeading eyebrow="Who It Helps" title="Who this is for" description="A useful route for students who need assignment support fast and with less friction." />
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
          <SectionHeading eyebrow="Why CritOrbit" title="Why use CritOrbit" description="Students use CritOrbit when they want a simpler response to assignment overload." />
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
          <SectionHeading eyebrow="How It Works" title="How it works" description="A simple path for students searching do assignment for me support in Malaysia." align="center" />
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

        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <div className="retro-outline-lg rounded-[36px] bg-purple px-6 py-10 text-white md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="display-font text-4xl font-black">Ready to browse assignment helpers?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Explore CritOrbit for support with reports, coding tasks, slides, and general deadline pressure.
                </p>
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
