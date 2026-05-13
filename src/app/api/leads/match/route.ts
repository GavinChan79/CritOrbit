import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { calculateLeadScore, getDerivedLeadMetrics } from "@/lib/scoring";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/whatsapp";
import { leadMatchPayloadSchema } from "@/lib/validators";
import {
  getCategoryLabel,
  getHelperPriceAnchor,
  getHelperTrustLevelLabel,
  getTaskTypeLabel,
} from "@/lib/helpers";
import { titleizeEnum } from "@/lib/format";
import { dispatchLeadInvites } from "@/lib/lead-invites";
import { getPublicHelperById } from "@/lib/public-helpers";
import { logServerDataLoadError } from "@/lib/server-load";

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

    const helper = await getPublicHelperById(parsed.data.selectedHelperId);

    if (!helper) {
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
      data: {
        ...helperCounterUpdate,
        lastBookedAt: new Date(),
      },
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

    try {
      await dispatchLeadInvites({
        lead: {
          id: lead.id,
          category: lead.category,
          taskType: lead.taskType,
          selectedHelperId: lead.selectedHelperId,
        },
      });
    } catch (error) {
      logServerDataLoadError("lead-invite-dispatch", error);
    }

    const whatsappHelperName = lead.selectedHelper?.name ?? helper.name;
    const preferredHelperTrustLevel = getHelperTrustLevelLabel({
      trustLevel: helper.trustLevel,
      isVerified: helper.isVerified,
    });
    const preferredHelperStartingPrice = getHelperPriceAnchor({
      type: helper.type,
      projectsCompleted: helper.projectsCompleted,
      priceTier: helper.priceTier,
      priceAnchor: helper.priceAnchor,
    });

    const message = buildWhatsappMessage({
      category: getCategoryLabel(lead.category),
      taskType: getTaskTypeLabel(lead.taskType),
      urgency: titleizeEnum(lead.urgency),
      deadline: lead.deadline,
      budget: lead.budget,
      preferredHelperName: whatsappHelperName,
      preferredHelperTrustLevel,
      preferredHelperStartingPrice,
      description: lead.description,
      leadId: lead.id,
      draftId: draft.id,
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
