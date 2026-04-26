ALTER TABLE "Helper"
ADD COLUMN "studentsHelpedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastBookedAt" TIMESTAMP(3);

UPDATE "Helper"
SET "studentsHelpedCount" = COALESCE("projectsCompleted", 0)
WHERE "studentsHelpedCount" = 0;

CREATE TABLE "EventLog" (
  "id" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "helperId" TEXT,
  "draftId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventLog_eventType_createdAt_idx" ON "EventLog"("eventType", "createdAt");
CREATE INDEX "EventLog_helperId_createdAt_idx" ON "EventLog"("helperId", "createdAt");
CREATE INDEX "EventLog_draftId_createdAt_idx" ON "EventLog"("draftId", "createdAt");
