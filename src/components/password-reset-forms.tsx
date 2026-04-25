"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonStyles, Card, InputShell } from "@/components/ui-primitives";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setError(json.error ?? "Could not process your request.");
        return;
      }

      setMessage(
        json.message ??
          "If an account exists for that email, a reset link has been sent.",
      );
      setEmail("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not process your request.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="bg-white">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <InputShell label="Email address">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            placeholder="you@student.edu.my"
          />
        </InputShell>

        {error ? <p className="text-sm font-semibold text-[#E24B4A]">{error}</p> : null}
        {message ? <p className="text-sm font-semibold text-green">{message}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className={buttonStyles({ tone: "purple", size: "md" })}
          >
            {pending ? "Sending..." : "Send Reset Link"}
          </button>
          <Link href="/login" className={buttonStyles({ tone: "yellow", size: "md" })}>
            Back to Login
          </Link>
        </div>
      </form>
    </Card>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const parsed = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Review your password fields.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setError(json.error ?? "Could not reset your password.");
        return;
      }

      setMessage(json.message ?? "Password reset successful. You can log in now.");
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not reset your password.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="bg-white">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <InputShell label="New password">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            placeholder="At least 8 characters"
          />
        </InputShell>

        <InputShell label="Confirm new password">
          <input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            placeholder="Repeat your password"
          />
        </InputShell>

        {!token ? (
          <p className="text-sm font-semibold text-[#E24B4A]">
            This reset link is missing a token. Request a new one.
          </p>
        ) : null}
        {error ? <p className="text-sm font-semibold text-[#E24B4A]">{error}</p> : null}
        {message ? (
          <p className="text-sm font-semibold text-green">
            {message || "Password updated successfully."} Redirecting you to login...{" "}
            <Link href="/login" className="font-black text-ink underline decoration-2 underline-offset-2">
              Go to login
            </Link>
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending || !token}
            className={cn(
              buttonStyles({ tone: "purple", size: "md" }),
              (!token || pending) && "opacity-70",
            )}
          >
            {pending ? "Resetting..." : "Reset Password"}
          </button>
          <Link href="/forgot-password" className={buttonStyles({ tone: "yellow", size: "md" })}>
            Request New Link
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonStyles({ tone: "ink", size: "md" }),
              "!bg-ink !text-white visited:!text-white hover:!text-white active:!text-white",
            )}
          >
            Go to Login Now
          </Link>
        </div>
      </form>
    </Card>
  );
}
