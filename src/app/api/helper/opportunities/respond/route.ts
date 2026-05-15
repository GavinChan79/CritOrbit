import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLeadInviteByToken } from "@/lib/lead-invite-response";
import { helperInviteFollowUpSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = helperInviteFollowUpSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid invite note." },
        { status: 400 },
      );
    }

    const invite = await getLeadInviteByToken(parsed.data.token);

    if (!invite) {
      return NextResponse.json({ error: "This invite link is invalid." }, { status: 404 });
    }

    if (invite.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Only accepted invites can add an estimated price or note." },
        { status: 409 },
      );
    }

    await prisma.leadInvite.update({
      where: { id: invite.id },
      data: {
        estimatedPrice: parsed.data.estimatedPrice,
        availabilityNote: parsed.data.availabilityNote,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not save the helper response note." },
      { status: 500 },
    );
  }
}
