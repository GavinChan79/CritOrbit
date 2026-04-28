import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Last Minute Assignment Help Malaysia | CritOrbit",
  description:
    "Get last minute assignment help in Malaysia. Find helpers for urgent reports, coding, slides, and fast deadline support on CritOrbit.",
};

const helpAreas = [
  ["Assignments due soon", "Useful when the deadline is almost here and you need to regain control quickly."],
  ["Report cleanup", "Find help when written work still needs structure, editing, or formatting at the last minute."],
  ["Slides and visuals", "Browse support for presentations that still need stronger layout and clearer flow."],
  ["Technical tasks", "Move faster on coding, analysis, or assignment work that still needs practical progress."],
] as const;

const audience = [
  ["Students who started late", "Helpful for anyone trying to salvage a submission with limited time left."],
  ["Students juggling multiple deadlines", "A practical route when several assignments are due at once and work is backing up."],
] as const;

const reasons = [
  ["Fast response", "CritOrbit is shaped for students who often start searching for help only when the pressure becomes real."],
  ["Quick browsing", "The platform reduces wasted time by helping students move directly into browsing support options."],
  ["Student-friendly support", "It keeps the process simple when you are already dealing with last minute stress."],
] as const;

const steps = [
  ["01", "Open the options", "Start by browsing helpers who fit the assignment type you need help with right now.", "bg-yellow"],
  ["02", "Choose a direction", "Compare profiles and decide which helper looks most useful for the task.", "bg-pink"],
  ["03", "Push toward submission", "Use CritOrbit to regain momentum and reduce last minute assignment chaos.", "bg-green text-white"],
] as const;

export default function LastMinuteAssignmentHelpMalaysiaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Last Minute Help
              </div>
              <h1 className="mt-6 max-w-4xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Last Minute Assignment Help Malaysia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps Malaysian students find assignment helpers when the submission is close and the work
                still is not where it needs to be.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether it is a report, slide deck, coding task, or general coursework problem, this page helps
                students understand the kind of last minute assignment help available on CritOrbit.
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
                  Time Pressure
                </div>
                <div className="mt-5 display-font text-3xl font-black leading-tight">
                  A clearer route when the deadline is almost here
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
          <SectionHeading eyebrow="Help Areas" title="What kind of last minute help" description="Browse support for assignment work that still needs a push near the deadline." />
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
            <SectionHeading eyebrow="Who It Helps" title="Who this is for" description="A useful route for students who need to recover quickly from time pressure." />
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
          <SectionHeading eyebrow="Why CritOrbit" title="Why use CritOrbit" description="Students use CritOrbit when they want a simpler response to last minute assignment stress." />
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
          <SectionHeading eyebrow="How It Works" title="How it works" description="A simple path for students who need last minute assignment help in Malaysia." align="center" />
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
                <div className="display-font text-4xl font-black">Ready to browse last minute help?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Explore CritOrbit for support with urgent reports, slides, coding tasks, and near-deadline coursework.
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
