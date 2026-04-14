import { SiteHeader } from "@/components/ui";
import { RouteLoading } from "@/components/route-loading";

export default function RequestDetailLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <RouteLoading
          title="Request Detail"
          description="Loading the latest request summary and status timeline."
          blocks={3}
        />
      </main>
    </div>
  );
}
