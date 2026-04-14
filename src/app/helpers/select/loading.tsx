import { SiteHeader } from "@/components/ui";
import { RouteLoading } from "@/components/route-loading";

export default function HelperSelectLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <RouteLoading
          title="Creative Partner"
          description="Loading the shortlisted helpers for this request."
          blocks={4}
        />
      </main>
    </div>
  );
}
