ALTER TYPE "HelperStatus" ADD VALUE IF NOT EXISTS 'FROZEN';
ALTER TYPE "HelperStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

ALTER TYPE "HelperPriceAnchor" ADD VALUE IF NOT EXISTS 'RM600';
ALTER TYPE "HelperPriceAnchor" ADD VALUE IF NOT EXISTS 'RM800';
ALTER TYPE "HelperPriceAnchor" ADD VALUE IF NOT EXISTS 'RM900';

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key"
  ON "PasswordResetToken"("tokenHash");

CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_expiresAt_idx"
  ON "PasswordResetToken"("userId", "expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'PasswordResetToken_userId_fkey'
      AND table_name = 'PasswordResetToken'
  ) THEN
    ALTER TABLE "PasswordResetToken"
      ADD CONSTRAINT "PasswordResetToken_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;
