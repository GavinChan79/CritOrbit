import { requireApprovedHelper } from "@/lib/auth";
import { getHelperVerificationFilePath, getHelperVerificationStatusLabel } from "@/lib/helper-verification";
import { prisma } from "@/lib/prisma";
import { Card, SectionHeading } from "@/components/ui";
import { HelperVerificationManager } from "@/components/helper-verification-manager";

export default async function HelperVerificationPage() {
  const { helper } = await requireApprovedHelper();
  const verification = await prisma.helperVerification.findUnique({
    where: { helperId: helper.id },
    select: {
      status: true,
      adminNote: true,
      updatedAt: true,
    },
  });

  return (
    <div>
      <SectionHeading
        eyebrow="Helper Verification"
        title="Upload your identity verification"
        description="This section is private and used only for internal verification review. Nothing here is shown publicly except the verified badge after approval."
      />

      <div className="mt-8">
        <HelperVerificationManager
          verification={
            verification
              ? {
                  status: verification.status,
                  adminNote: verification.adminNote,
                  icFrontUrl: getHelperVerificationFilePath("front"),
                  icBackUrl: getHelperVerificationFilePath("back"),
                  updatedAt: verification.updatedAt.toISOString(),
                }
              : {
                  status: "NONE",
                  adminNote: null,
                  icFrontUrl: null,
                  icBackUrl: null,
                  updatedAt: null,
                }
          }
        />
      </div>

      <Card className="mt-8 bg-yellow">
        <div className="display-font text-2xl font-black">Current state</div>
        <p className="mt-3 text-sm font-semibold text-muted">
          {getHelperVerificationStatusLabel(verification?.status ?? "NONE")}
        </p>
      </Card>
    </div>
  );
}
