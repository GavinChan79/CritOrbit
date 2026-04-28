import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Assignment Help Malaysia – Fast & Reliable | CritOrbit",
  description:
    "Get assignment help in Malaysia with CritOrbit. Find reliable helpers for reports, coding tasks, presentations, and urgent deadlines.",
};

const reasons = [
  {
    title: "Curated helper discovery",
    description:
      "Students can browse a focused roster of helpers instead of wasting time searching random groups or waiting on vague replies.",
    accent: "bg-yellow",
  },
  {
    title: "Fast support for urgent work",
    description:
      "CritOrbit is built for deadline pressure, so students can move quickly when they need coding help, reports, or polished slides.",
    accent: "bg-pink",
  },
  {
    title: "Made for Malaysian university life",
    description:
      "The platform is shaped around Malaysian students who need practical help options, clearer matching, and a smoother path to the right helper.",
    accent: "bg-blue text-white",
  },
] as const;

const helpTypes = [
  {
    title: "Coding assignments",
    description:
      "Find helpers for programming coursework, debugging, technical problem-solving, and structured coding deliverables.",
  },
  {
    title: "Reports and written work",
    description:
      "Get support for research reports, case studies, formatting, editing, and deadline-driven academic writing tasks.",
  },
  {
    title: "Presentations and slides",
    description:
      "Browse helpers who can shape presentation decks, improve slide storytelling, and clean up visuals for stronger submissions.",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Browse available helpers",
    description:
      "Start by exploring helpers who match the kind of assignment support you need.",
    accent: "bg-yellow",
  },
  {
    number: "02",
    title: "Compare the right fit",
    description:
      "Review profiles, specialties, and strengths so you can shortlist a helper with confidence.",
    accent: "bg-pink",
  },
  {
    number: "03",
    title: "Move fast on your deadline",
    description:
      "Choose your preferred option and continue the process quickly when the submission window is tight.",
    accent: "bg-green text-white",
  },
] as const;

export default function AssignmentHelpMalaysiaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                SEO Landing Page
              </div>
              <h1 className="mt-6 max-w-3xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Assignment Help Malaysia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps Malaysian university students discover assignment helpers for urgent coursework,
                difficult subjects, and tight submission windows.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether you need support for coding tasks, report writing, or presentation work, this page makes it
                easier to understand how CritOrbit helps students find the right kind of academic support faster.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/helpers" className={buttonStyles({ tone: "purple", size: "lg" })}>
                  Browse Helpers
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="retro-outline-lg rounded-[34px] bg-paper p-6 md:p-8">
                <div className="rounded-[28px] border-[3px] border-line bg-purple p-6 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="retro-pill bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-ink">
                      Student Support
                    </div>
                    <div className="rounded-full border-[2px] border-white/70 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em]">
                      Malaysia
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="display-font text-3xl font-black leading-tight">
                      Faster helper discovery for stressed students
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      Built for students who need reliable assignment help without the usual friction of searching in the
                      dark.
                    </p>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[
                      ["Coding", "Debugging and technical coursework"],
                      ["Reports", "Research, writing, and cleanup"],
                      ["Slides", "Presentation structure and visuals"],
                    ].map(([title, copy], index) => (
                      <div
                        key={title}
                        className={[
                          "rounded-[22px] border-[3px] border-line p-4 shadow-[5px_5px_0_rgba(31,27,24,0.28)]",
                          index === 0 ? "bg-pink text-ink" : "",
                          index === 1 ? "bg-green text-white" : "",
                          index === 2 ? "bg-blue text-white" : "",
                        ].join(" ")}
                      >
                        <div className="display-font text-2xl font-black">{title}</div>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em]">{copy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading
            eyebrow="Why CritOrbit"
            title="Why students use CritOrbit"
            description="CritOrbit is designed to help Malaysian students move from stress to action with a cleaner path to the right helper."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map((reason) => (
              <Card key={reason.title} className="bg-white">
                <div
                  className={`inline-flex rounded-[18px] border-[3px] border-line px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${reason.accent}`}
                >
                  Why it matters
                </div>
                <h2 className="mt-5 display-font text-2xl font-black">{reason.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{reason.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-green py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeading
              eyebrow="Help Types"
              title="Types of assignment help"
              description="Students can browse helpers for the most common academic pressure points."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {helpTypes.map((item) => (
                <Card key={item.title} className="border-white bg-white/10 text-white backdrop-blur">
                  <h2 className="display-font text-2xl font-black">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/80">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading
            eyebrow="How It Works"
            title="How it works"
            description="A simple three-step flow for students who need assignment help in Malaysia."
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.title} className="bg-white">
                <div
                  className={`inline-flex rounded-[18px] border-[3px] border-line px-4 py-2 display-font text-3xl font-black ${step.accent}`}
                >
                  {step.number}
                </div>
                <h2 className="mt-5 display-font text-2xl font-black">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{step.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <div className="retro-outline-lg rounded-[36px] bg-purple px-6 py-10 text-white md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="display-font text-4xl font-black">Ready to find assignment help?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Browse helpers on CritOrbit and explore support for coding tasks, reports, presentations, and urgent
                  deadlines.
                </p>
              </div>
              <Link href="/helpers" className={buttonStyles({ tone: "yellow", size: "lg" })}>
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
