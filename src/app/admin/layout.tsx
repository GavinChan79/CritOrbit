import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[288px_minmax(0,1fr)]">
      <AdminSidebar />
      <main className="px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
