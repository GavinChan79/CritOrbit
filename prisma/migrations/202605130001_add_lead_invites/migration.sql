CREATE TYPE "LeadInviteGroup" AS ENUM ('PREFERRED', 'BACKUP');

CREATE TYPE "LeadInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'UNAVAILABLE');

CREATE TABLE "LeadInvite" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "inviteGroup" "LeadInviteGroup" NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "status" "LeadInviteStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LeadInvite_leadId_helperId_key" ON "LeadInvite"("leadId", "helperId");
CREATE INDEX "LeadInvite_leadId_inviteGroup_sentAt_idx" ON "LeadInvite"("leadId", "inviteGroup", "sentAt");
CREATE INDEX "LeadInvite_helperId_status_sentAt_idx" ON "LeadInvite"("helperId", "status", "sentAt");

ALTER TABLE "LeadInvite" ADD CONSTRAINT "LeadInvite_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadInvite" ADD CONSTRAINT "LeadInvite_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "Helper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
