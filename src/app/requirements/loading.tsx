import { SiteHeader } from "@/components/ui";
import { RouteLoading } from "@/components/route-loading";

export default function RequirementsLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <RouteLoading
          title="Requirements"
          description="Loading the assignment brief form."
          blocks={2}
        />
      </main>
    </div>
  );
}
