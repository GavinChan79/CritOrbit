import { SiteHeader } from "@/components/ui";
import { RouteLoading } from "@/components/route-loading";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <RouteLoading
          title="Dashboard"
          description="Loading the latest request statuses and helper updates."
          blocks={4}
        />
      </main>
    </div>
  );
}
