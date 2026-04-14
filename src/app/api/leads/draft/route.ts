import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { draftLeadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const json = await request.json();
    const parsed = draftLeadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid draft payload." },
        { status: 400 },
      );
    }

    const draft = await prisma.leadDraft.create({
      data: {
        userId: session?.user?.id ?? null,
        category: parsed.data.category,
        taskType: parsed.data.taskType,
        urgency: parsed.data.urgency,
        deadline: new Date(parsed.data.deadline),
        budget: parsed.data.budget ?? null,
        description: parsed.data.description,
      },
    });

    return NextResponse.json({ draftId: draft.id });
  } catch {
    return NextResponse.json({ error: "Failed to save your draft." }, { status: 500 });
  }
}
