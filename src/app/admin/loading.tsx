import { RouteLoading } from "@/components/route-loading";

export default function AdminLoading() {
  return (
    <div className="px-4 py-8 md:px-6">
      <RouteLoading
        title="Admin"
        description="Loading the latest lead, helper, and revenue data."
        blocks={4}
      />
    </div>
  );
}
