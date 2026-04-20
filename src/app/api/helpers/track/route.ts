import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const eventValues = ["impression", "click"] as const;

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const event =
      typeof json?.event === "string" &&
      eventValues.includes(json.event as (typeof eventValues)[number])
        ? (json.event as (typeof eventValues)[number])
        : null;

    if (!event) {
      return NextResponse.json({ error: "Invalid tracking event." }, { status: 400 });
    }

    const helperIds = Array.isArray(json?.helperIds)
      ? json.helperIds.filter((value: unknown): value is string => typeof value === "string" && value.length > 0)
      : typeof json?.helperId === "string" && json.helperId.length > 0
        ? [json.helperId]
        : [];

    if (helperIds.length === 0) {
      return NextResponse.json({ error: "Helper id is required." }, { status: 400 });
    }

    const field =
      event === "impression"
        ? { impressionCount: { increment: 1 } }
        : { clickCount: { increment: 1 } };

    await prisma.$transaction(
      helperIds.map((helperId: string) =>
        prisma.helper.update({
          where: { id: helperId },
          data: field,
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to track helper event." }, { status: 500 });
  }
}
