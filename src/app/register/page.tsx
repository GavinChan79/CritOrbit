import Link from "next/link";
import { AuthForm } from "@/components/client-forms";
import { SiteHeader } from "@/components/ui";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-20">
        <div className="flex flex-col justify-center">
          <div className="retro-card bg-pink p-8">
            <div className="display-font text-5xl font-black">Register</div>
            <p className="mt-3 text-base leading-7">
              Create a student account to save requests, revisit helper choices, and track your lead status.
            </p>
            <p className="mt-5 text-sm font-semibold">
              Already registered? <Link href="/login" className="underline">Log in</Link>.
            </p>
          </div>
        </div>
        <AuthForm mode="register" />
      </main>
    </div>
  );
}
