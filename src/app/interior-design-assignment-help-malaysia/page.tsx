import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Card, SectionHeading, SiteFooter, SiteHeader, buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Interior Design Assignment Help Malaysia | CritOrbit",
  description:
    "Get interior design assignment help in Malaysia. From concept to presentation boards, find reliable helpers on CritOrbit.",
};

const helpTypes = [
  {
    title: "Space planning",
    description:
      "Get support for layout thinking, zoning, circulation, and practical planning decisions for studio and coursework projects.",
    accent: "bg-yellow",
  },
  {
    title: "Concept development",
    description:
      "Find help refining ideas, visual direction, mood, and storytelling when your interior design concept needs more clarity.",
    accent: "bg-pink",
  },
  {
    title: "Presentation boards",
    description:
      "Browse helpers for board composition, visual hierarchy, layout cleanup, and stronger final presentation output.",
    accent: "bg-blue text-white",
  },
  {
    title: "3D work",
    description:
      "Explore support for 3D modeling, rendering, and visual presentation when you need your interior ideas shown more clearly.",
    accent: "bg-green text-white",
  },
] as const;

const studentTypes = [
  {
    title: "Diploma students",
    description:
      "Useful for students building fundamentals in spatial design, drafting, concept work, and visual presentation.",
  },
  {
    title: "Degree students",
    description:
      "Helpful for more advanced interior design and interior architecture coursework, project development, and final presentations.",
  },
] as const;

const reasons = [
  {
    title: "Fast response",
    description:
      "CritOrbit is built for students under pressure, so you can move faster when deadlines are close and progress is stuck.",
  },
  {
    title: "Real portfolios",
    description:
      "The platform is designed around visible helper work so students can browse with more confidence before choosing a direction.",
  },
  {
    title: "Student-friendly support",
    description:
      "It is a simpler, more approachable way for Malaysian students to explore interior design assignment help without extra friction.",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Browse helpers",
    description:
      "Start on CritOrbit and explore helpers whose strengths fit interior design and interior architecture assignments.",
    accent: "bg-yellow",
  },
  {
    number: "02",
    title: "Compare portfolios",
    description:
      "Review specialties and visual work so you can identify the most relevant helper for your project.",
    accent: "bg-pink",
  },
  {
    number: "03",
    title: "Move your project forward",
    description:
      "Choose the right fit and continue quickly when you need progress on concepts, boards, or 3D output.",
    accent: "bg-purple text-white",
  },
] as const;

export default function InteriorDesignAssignmentHelpMalaysiaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <section className="surface-grid overflow-hidden bg-yellow">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-6 md:py-24">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Interior Design Help
              </div>
              <h1 className="mt-6 max-w-4xl display-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Interior Design Assignment Help Malaysia
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
                {APP_NAME} helps interior design and interior architecture students in Malaysia find assignment helpers
                for visual work, concept development, and deadline-heavy project support.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
                Whether you are stuck on planning, presentation boards, or 3D visuals, this page is built to help
                students understand the kind of interior design assignment help available on CritOrbit.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/" className={buttonStyles({ tone: "purple", size: "lg" })}>
                  Browse Helpers
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="retro-outline-lg rounded-[34px] bg-paper p-6 md:p-8">
                <div className="rounded-[28px] border-[3px] border-line bg-purple p-6 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="retro-pill bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-ink">
                      Interior Studio Flow
                    </div>
                    <div className="rounded-full border-[2px] border-white/70 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em]">
                      Malaysia
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="display-font text-3xl font-black leading-tight">
                      Support for concepts, boards, and visual output
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      Built for students who need a clearer path from design ideas to presentable assignment work.
                    </p>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {helpTypes.map((item) => (
                      <div
                        key={item.title}
                        className={`rounded-[22px] border-[3px] border-line p-4 shadow-[5px_5px_0_rgba(31,27,24,0.28)] ${item.accent}`}
                      >
                        <div className="display-font text-2xl font-black">{item.title}</div>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em]">{item.description}</p>
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
            eyebrow="Help Areas"
            title="What kind of help"
            description="CritOrbit can help students browse support across the most common interior design assignment needs."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {helpTypes.map((item) => (
              <Card key={item.title} className="bg-white">
                <h2 className="display-font text-2xl font-black">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-green py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeading
              eyebrow="Who It Helps"
              title="Who this is for"
              description="A useful starting point for Malaysian interior design students at different study levels."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {studentTypes.map((item) => (
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
            eyebrow="Why CritOrbit"
            title="Why use CritOrbit"
            description="Students use CritOrbit when they want a faster and more confidence-building way to browse assignment help."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map((reason, index) => (
              <Card key={reason.title} className={index === 1 ? "bg-yellow" : "bg-white"}>
                <h2 className="display-font text-2xl font-black">{reason.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{reason.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionHeading
            eyebrow="How It Works"
            title="How it works"
            description="A simple path for students who want interior design assignment help in Malaysia."
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
                <div className="display-font text-4xl font-black">Ready to browse interior design helpers?</div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Explore CritOrbit to find support for interior design concepts, boards, presentation work, and 3D
                  output.
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
