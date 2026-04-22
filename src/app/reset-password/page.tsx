import { SectionHeading, SiteHeader } from "@/components/ui";
import { ResetPasswordForm } from "@/components/password-reset-forms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] ?? "" : params.token ?? "";

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Account Recovery"
          title="Set a new password"
          description="Use your secure reset link to choose a new password for your CritOrbit account."
        />
        <div className="mt-8">
          <ResetPasswordForm token={token} />
        </div>
      </main>
    </div>
  );
}
