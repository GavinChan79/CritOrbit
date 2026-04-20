import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { calculateLeadScore, getDerivedLeadMetrics } from "@/lib/scoring";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/whatsapp";
import { leadMatchPayloadSchema } from "@/lib/validators";
import { getCategoryLabel, getTaskTypeLabel } from "@/lib/helpers";
import { titleizeEnum } from "@/lib/format";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const json = await request.json();
    const parsed = leadMatchPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid lead payload." }, { status: 400 });
    }

    const ownerUserId = session?.user?.id ?? null;
    const draft = await prisma.leadDraft.findFirst({
      where: {
        id: parsed.data.draftId,
        userId: ownerUserId,
      },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft request not found." }, { status: 404 });
    }

    const helper = await prisma.helper.findUnique({ where: { id: parsed.data.selectedHelperId } });

    if (!helper || !helper.isActive || helper.status !== "ACTIVE") {
      return NextResponse.json({ error: "Selected helper not found." }, { status: 404 });
    }

    const score = calculateLeadScore({
      urgency: draft.urgency,
      budget: draft.budget,
      description: draft.description,
      helperSelected: true,
    });

    const derivedMetrics = getDerivedLeadMetrics(score);

    const existingLead = await prisma.lead.findUnique({
      where: { clientRequestKey: draft.id },
      select: {
        id: true,
        userId: true,
        whatsappClicked: true,
        selectedHelperId: true,
      },
    });

    let lead = await prisma.lead.upsert({
      where: { clientRequestKey: draft.id },
      update: {
        selectedHelperId: helper.id,
        leadScore: derivedMetrics.leadScore,
        leadTemperature: derivedMetrics.leadTemperature,
      },
      create: {
        clientRequestKey: draft.id,
        userId: draft.userId,
        category: draft.category,
        taskType: draft.taskType,
        urgency: draft.urgency,
        deadline: draft.deadline,
        budget: draft.budget ?? null,
        description: draft.description,
        selectedHelperId: helper.id,
        leadScore: derivedMetrics.leadScore,
        leadTemperature: derivedMetrics.leadTemperature,
      },
      include: {
        selectedHelper: {
          select: { name: true },
        },
      },
    });

    if (lead.userId !== draft.userId) {
      return NextResponse.json({ error: "You do not have access to this lead." }, { status: 403 });
    }

    const helperCounterUpdate =
      existingLead?.selectedHelperId === helper.id
        ? { selectionCount: { increment: 1 } }
        : {
            selectionCount: { increment: 1 },
          };

    await prisma.helper.update({
      where: { id: helper.id },
      data: helperCounterUpdate,
    });

    if (!lead.whatsappClicked) {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: { whatsappClicked: true },
        include: {
          selectedHelper: {
            select: { name: true },
          },
        },
      });
    }

    const whatsappHelperName = lead.selectedHelper?.name ?? helper.name;

    const message = buildWhatsappMessage({
      category: getCategoryLabel(lead.category),
      taskType: getTaskTypeLabel(lead.taskType),
      urgency: titleizeEnum(lead.urgency),
      deadline: lead.deadline,
      budget: lead.budget,
      helperName: whatsappHelperName,
      description: lead.description,
    });

    revalidatePath("/helpers/select");
    revalidatePath(`/helpers/${helper.id}`);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/helper-stats");

    return NextResponse.json({
      leadId: lead.id,
      whatsappUrl: buildWhatsappUrl(message),
    });
  } catch {
    return NextResponse.json({ error: "Failed to create lead." }, { status: 500 });
  }
}
