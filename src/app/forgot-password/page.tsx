import { SiteHeader, SectionHeading } from "@/components/ui";
import { ForgotPasswordForm } from "@/components/password-reset-forms";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Account Recovery"
          title="Forgot your password?"
          description="Enter your email address and we’ll send a secure password reset link if an account exists."
        />
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
