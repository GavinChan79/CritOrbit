import Link from "next/link";
import { AuthForm } from "@/components/client-forms";
import { SiteHeader } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-20">
        <div className="flex flex-col justify-center">
          <div className="retro-card bg-yellow p-8">
            <div className="display-font text-5xl font-black">Log In</div>
            <p className="mt-3 text-base leading-7">
              Check your request statuses, keep your briefs organized, and jump back into the helper flow anytime.
            </p>
            <p className="mt-5 text-sm font-semibold">
              Need an account? <Link href="/register" className="underline">Register here</Link>.
            </p>
            <p className="mt-3 text-sm font-semibold">
              Forgot your password? <Link href="/forgot-password" className="underline">Reset it here</Link>.
            </p>
          </div>
        </div>
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
