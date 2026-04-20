import { ReactNode } from "react";
import { requireApprovedHelper } from "@/lib/auth";
import { getHelperStatusLabel } from "@/lib/helpers";
import { HelperSidebar } from "@/components/helper-sidebar";

export default async function HelperLayout({ children }: { children: ReactNode }) {
  const { helper } = await requireApprovedHelper();

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[288px_minmax(0,1fr)]">
      <HelperSidebar
        helperName={helper.name}
        helperStatusLabel={getHelperStatusLabel(helper.status)}
      />
      <main className="px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
