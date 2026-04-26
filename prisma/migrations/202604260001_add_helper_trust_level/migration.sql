CREATE TYPE "HelperTrustLevel" AS ENUM ('STANDARD_HELPER', 'VERIFIED_HELPER', 'TRUSTED_HELPER');

ALTER TABLE "Helper"
ADD COLUMN "trustLevel" "HelperTrustLevel" NOT NULL DEFAULT 'STANDARD_HELPER';

UPDATE "Helper"
SET "trustLevel" = CASE
  WHEN "isVerified" = true THEN 'VERIFIED_HELPER'::"HelperTrustLevel"
  ELSE 'STANDARD_HELPER'::"HelperTrustLevel"
END;
