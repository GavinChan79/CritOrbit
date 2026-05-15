CREATE TYPE "LeadInviteDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

ALTER TABLE "LeadInvite"
ADD COLUMN "deliveryStatus" "LeadInviteDeliveryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "deliveryAttemptedAt" TIMESTAMP(3),
ADD COLUMN "deliveryError" TEXT;
