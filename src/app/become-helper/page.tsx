import { SectionHeading, SiteFooter, SiteHeader } from "@/components/ui";
import { HelperApplicationForm } from "@/components/helper-application-form";

export default function BecomeHelperPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <section className="retro-outline-lg overflow-hidden rounded-[34px] bg-purple text-white">
          <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-12">
            <div>
              <div className="retro-pill inline-flex bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-ink">
                Helper Onboarding
              </div>
              <h1 className="mt-5 display-font text-5xl font-black leading-[0.95] md:text-6xl">
                Earn with CritOrbit
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-white/86">
                Get real student clients without finding them yourself.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Get consistent assignment requests",
                  "Flexible workload",
                  "No marketing needed",
                  "Focus only on delivery",
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="rounded-[20px] border-[3px] border-white/70 bg-white/10 px-4 py-4 text-sm font-bold"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border-[3px] border-white/70 bg-white/10 p-6">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
                  Trust
                </div>
                <div className="mt-3 display-font text-3xl font-black">
                  Growing student platform
                </div>
              </div>
              <p className="text-sm leading-7 text-white/82">
                Used by university students who want fast, curated assignment help
                through a controlled admin-managed flow.
              </p>
              <div className="rounded-[22px] border-[3px] border-line bg-yellow px-5 py-4 text-ink">
                <div className="text-xs font-black uppercase tracking-[0.16em]">
                  Why it converts
                </div>
                <p className="mt-2 text-sm font-semibold leading-7">
                  CritOrbit brings qualified student requests to you so you can
                  focus on output quality, speed, and repeat trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <SectionHeading
            eyebrow="Apply"
            title="Join the controlled helper roster"
            description="Applications are reviewed by admin before anything becomes public. This stays curated, not open-market."
          />
          <div className="mt-8">
            <HelperApplicationForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
