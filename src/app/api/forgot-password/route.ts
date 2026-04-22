import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { createPasswordResetToken, getPasswordResetUrl } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

const genericResetMessage =
  "If an account exists for that email, a reset link has been sent.";
const rateLimitWindowMs = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = forgotPasswordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email address." },
        { status: 400 },
      );
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    const requestIp = getRequestIp(request);
    const emailRateLimit = checkRateLimit(
      `forgot-password:email:${normalizedEmail}`,
      3,
      rateLimitWindowMs,
    );
    const ipRateLimit = checkRateLimit(
      `forgot-password:ip:${requestIp}`,
      5,
      rateLimitWindowMs,
    );

    if (!emailRateLimit.allowed || !ipRateLimit.allowed) {
      return NextResponse.json({ success: true, message: genericResetMessage });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (user) {
      const resetToken = createPasswordResetToken();

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: resetToken.tokenHash,
          expiresAt: resetToken.expiresAt,
        },
      });

      try {
        await sendPasswordResetEmail({
          to: user.email,
          resetUrl: getPasswordResetUrl(resetToken.token),
        });
      } catch (error) {
        console.error("[email] Failed to send password reset email.", {
          userId: user.id,
          error,
        });
      }
    }

    return NextResponse.json({ success: true, message: genericResetMessage });
  } catch (error) {
    console.error("[forgot-password] request failed", error);
    return NextResponse.json({ error: "Failed to process password reset request." }, { status: 500 });
  }
}
