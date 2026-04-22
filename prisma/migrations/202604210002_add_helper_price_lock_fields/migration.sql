ALTER TABLE "Helper"
  ADD COLUMN IF NOT EXISTS "submittedPriceAnchor" "HelperPriceAnchor" NOT NULL DEFAULT 'RM100',
  ADD COLUMN IF NOT EXISTS "priceLockedByAdmin" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Helper"
SET "submittedPriceAnchor" = "priceAnchor"
WHERE "submittedPriceAnchor" IS DISTINCT FROM "priceAnchor";
