import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "University Assignment Help KL | CritOrbit",
  description:
    "Get university assignment help in KL. Find reliable helpers for reports, coding, slides, and coursework deadlines on CritOrbit.",
};

const helpAreas = [
  ["Reports and research", "Get support for university coursework that needs clearer writing, structure, and organization."],
  ["Coding and technical tasks", "Find help for assignments involving technical work, problem solving, or debugging pressure."],
  ["Presentation work", "Browse support for slide decks, visuals, and cleaner final presentation delivery."],
  ["Deadline pressure", "Move faster when multiple university deadlines in KL start landing at the same time."],
] as const;

const audience = [
  ["KL university students", "Useful for students studying in Kuala Lumpur who want a more direct route to assignment support."],
  ["Busy semester students", "Helpful when lectures, coursework, and deadlines all start piling up at once."],
] as const;

const reasons = [
  ["Fast response", "CritOrbit helps students in KL take action quickly when their assignment load starts to feel heavy."],
  ["Broader support", "The platform covers different types of coursework, from writing and slides to technical tasks."],
  ["Student-friendly browsing", "It keeps the process simpler for students who want support without wasting extra time."],
] as const;

const steps = [
  ["01", "Browse helpers", "Start by exploring helpers who fit the kind of university coursework you are handling.", "bg-yellow"],
  ["02", "Compare the options", "Review profiles and choose a helper who feels relevant to your assignment type.", "bg-pink"],
  ["03", "Keep the semester moving", "Use CritOrbit to make faster progress on reports, coding tasks, and presentations.", "bg-blue text-white"],
] as const;

export default function UniversityAssignmentHelpKLPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                KL Student Help
              </div>
              <h1 className="mt-6 max-w-4xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                University Assignment Help KL
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps university students in Kuala Lumpur find assignment helpers for reports, presentations,
                coding tasks, and busy semester deadlines.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether you study in KL and need help catching up on coursework or simply want a clearer route to
                browsing support, this page helps students understand what is available on CritOrbit.
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
                  Kuala Lumpur Students
                </div>
                <div className="mt-5 display-font text-3xl font-black leading-tight">
                  Support for busy university coursework in KL
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {helpAreas.map(([title, copy], index) => (
                    <div
                      key={title}
                      className={`rounded-[22px] border-[3px] border-line p-4 shadow-[5px_5px_0_rgba(31,27,24,0.28)] ${
                        index % 2 === 0 ? "bg-pink text-ink" : "bg-green text-white"
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
          <SectionHeading eyebrow="Help Areas" title="What kind of university help" description="Browse support for common university assignment pressure points in KL." />
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
            <SectionHeading eyebrow="Who It Helps" title="Who this is for" description="A useful route for university students in Kuala Lumpur managing coursework pressure." />
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
          <SectionHeading eyebrow="Why CritOrbit" title="Why use CritOrbit" description="Students use CritOrbit when they want a simpler way to browse assignment support." />
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
          <SectionHeading eyebrow="How It Works" title="How it works" description="A simple path for students looking for university assignment help in KL." align="center" />
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
                <div className="display-font text-4xl font-black">Ready to browse university helpers?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Explore CritOrbit for support with university reports, coding tasks, presentations, and deadlines in KL.
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
