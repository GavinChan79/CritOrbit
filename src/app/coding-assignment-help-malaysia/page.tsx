import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Coding Assignment Help Malaysia | CritOrbit",
  description:
    "Get coding assignment help in Malaysia. Find helpers for debugging, logic, coursework, and urgent programming deadlines on CritOrbit.",
};

const helpAreas = [
  ["Debugging help", "Get support when your code is breaking, returning errors, or failing test cases."],
  ["Logic and structure", "Find help with algorithms, program flow, and turning assignment requirements into working steps."],
  ["Code cleanup", "Browse support for refactoring messy submissions into clearer, more readable coursework."],
  ["Submission pressure", "Move faster when your coding assignment is due soon and you need practical momentum."],
] as const;

const whoItsFor = [
  ["Beginner coders", "Useful for students still learning syntax, structure, and how to approach programming tasks."],
  ["University students", "A good fit for coursework involving coding exercises, technical assignments, and project milestones."],
] as const;

const reasons = [
  ["Fast response", "CritOrbit helps students act quickly when coding work is stuck and deadlines are getting close."],
  ["Helper browsing", "Students can explore available helpers instead of guessing where to ask for technical support."],
  ["Student-friendly flow", "The platform keeps the path simple so students can focus on fixing the assignment."],
] as const;

const steps = [
  ["01", "Browse helpers", "Start on CritOrbit and look for helpers suited to coding assignments and technical work.", "bg-yellow"],
  ["02", "Compare the fit", "Check profiles and strengths so you can choose a helper that matches your task.", "bg-pink"],
  ["03", "Keep moving", "Use the platform to move faster on debugging, logic, and delivery pressure.", "bg-green text-white"],
] as const;

export default function CodingAssignmentHelpMalaysiaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Coding Help
              </div>
              <h1 className="mt-6 max-w-4xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Coding Assignment Help Malaysia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps Malaysian students find assignment helpers for coding coursework, debugging problems,
                and technical deadlines that feel too close for comfort.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether you are struggling with logic, fixing errors, or trying to finish a programming task on time,
                this page helps students understand the kind of coding assignment help available on CritOrbit.
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
                  Technical Support
                </div>
                <div className="mt-5 display-font text-3xl font-black leading-tight">
                  Clearer progress for stuck coding assignments
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
          <SectionHeading eyebrow="Help Areas" title="What kind of coding help" description="Browse support for the most common pressure points in student coding assignments." />
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
            <SectionHeading eyebrow="Who It Helps" title="Who this is for" description="A useful page for students who need extra support with coding coursework." />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {whoItsFor.map(([title, copy]) => (
                <Card key={title} className="border-white bg-white/10 text-white backdrop-blur">
                  <h2 className="display-font text-2xl font-black">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/80">{copy}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="Why CritOrbit" title="Why use CritOrbit" description="Students use CritOrbit when they want a faster route to assignment support." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map(([title, copy], index) => (
              <Card key={title} className={index === 1 ? "bg-yellow" : "bg-white"}>
                <h2 className="display-font text-2xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading eyebrow="How It Works" title="How it works" description="A simple path for students who need coding assignment help in Malaysia." align="center" />
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
                <div className="display-font text-4xl font-black">Ready to browse coding helpers?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Explore CritOrbit to find support for debugging, coding logic, and urgent programming coursework.
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
