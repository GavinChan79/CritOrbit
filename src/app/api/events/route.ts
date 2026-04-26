import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { eventLogSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = eventLogSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
    }

    await prisma.eventLog.create({
      data: {
        eventType: parsed.data.eventType,
        helperId: parsed.data.helperId,
        draftId: parsed.data.draftId,
        metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[events] failed to log event", error);
    return NextResponse.json({ error: "Failed to log event." }, { status: 500 });
  }
}
