ALTER TABLE "LeadInvite"
ADD COLUMN "responseToken" TEXT,
ADD COLUMN "estimatedPrice" INTEGER,
ADD COLUMN "availabilityNote" TEXT;

UPDATE "LeadInvite"
SET "responseToken" = md5("id" || '-' || extract(epoch from "createdAt")::text)
WHERE "responseToken" IS NULL;

ALTER TABLE "LeadInvite"
ALTER COLUMN "responseToken" SET NOT NULL;

CREATE UNIQUE INDEX "LeadInvite_responseToken_key" ON "LeadInvite"("responseToken");
