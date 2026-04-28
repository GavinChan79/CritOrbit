import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Programming Assignment Help Malaysia | CritOrbit",
  description:
    "Get programming assignment help in Malaysia. Find helpers for debugging, logic, code structure, and urgent deadlines on CritOrbit.",
};

const helpAreas = [
  ["Programming logic", "Get support when the assignment requirements make sense on paper but not yet in code."],
  ["Debugging problems", "Find help tracking down errors, broken flows, and unexpected output in your program."],
  ["Code structure", "Browse support for making coursework cleaner, more readable, and easier to complete."],
  ["Urgent submissions", "Move faster when a programming deadline is close and you still need practical progress."],
] as const;

const audience = [
  ["Students learning programming", "Helpful for students still growing confidence with coding syntax, logic, and structure."],
  ["Students building projects", "Useful for coursework involving functions, problem solving, and working program output."],
] as const;

const reasons = [
  ["Fast response", "CritOrbit helps students react quickly when programming assignments start stalling near the deadline."],
  ["Practical browsing", "Students can explore helpers directly instead of guessing where to find technical support."],
  ["Student-friendly flow", "The platform keeps the path simple so students can focus on fixing the assignment."],
] as const;

const steps = [
  ["01", "Browse helpers", "Start by exploring helpers who suit programming coursework and technical assignment work.", "bg-yellow"],
  ["02", "Compare strengths", "Review profiles and choose a helper who looks aligned with your programming task.", "bg-pink"],
  ["03", "Build momentum", "Use CritOrbit to make faster progress on debugging, logic, and submission pressure.", "bg-green text-white"],
] as const;

const relatedPages = [
  ["/coding-assignment-help-malaysia", "Coding Assignment Help Malaysia"],
  ["/engineering-assignment-help-malaysia", "Engineering Assignment Help Malaysia"],
  ["/urgent-assignment-help-malaysia", "Urgent Assignment Help Malaysia"],
  ["/assignment-help-malaysia", "Assignment Help Malaysia"],
] as const;

export default function ProgrammingAssignmentHelpMalaysiaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Programming Help
              </div>
              <h1 className="mt-6 max-w-4xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Programming Assignment Help Malaysia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps Malaysian students find assignment helpers for programming coursework, debugging
                problems, and code-related deadlines.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether you are learning how to think through a problem or trying to finish a working program before the
                due date, this page helps students understand the type of programming assignment help available on
                CritOrbit.
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
                  Code Support
                </div>
                <div className="mt-5 display-font text-3xl font-black leading-tight">
                  Help for code logic, debugging, and faster progress
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
          <SectionHeading eyebrow="Help Areas" title="What kind of programming help" description="Browse support for common programming assignment problems and technical pressure points." />
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
            <SectionHeading eyebrow="Who It Helps" title="Who this is for" description="A useful route for students who need help making programming coursework move." />
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
          <SectionHeading eyebrow="Why CritOrbit" title="Why use CritOrbit" description="Students use CritOrbit when they want a simpler route to programming assignment support." />
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
          <SectionHeading eyebrow="How It Works" title="How it works" description="A simple path for students who need programming assignment help in Malaysia." align="center" />
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
          <SectionHeading eyebrow="Internal Links" title="Related Assignment Help" description="Explore more CritOrbit pages for coding, technical, and urgent assignment support." />
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
                <div className="display-font text-4xl font-black">Ready to browse programming helpers?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Explore CritOrbit for support with programming logic, debugging, and code-related deadlines.
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
