import { RequirementForm } from "@/components/client-forms";
import { SectionHeading, SiteHeader } from "@/components/ui";

export default function RequirementsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
        <SectionHeading
          eyebrow="Step 1"
          title="Tell us what your assignment needs"
          description="Keep it clean and specific so the helper shortlist is more relevant."
        />
        <div className="mt-8">
          <RequirementForm />
        </div>
      </main>
    </div>
  );
}
