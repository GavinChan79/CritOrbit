import { requireApprovedHelper } from "@/lib/auth";
import { getCategoryLabel, getHelperStatusLabel, getHelperTypeLabel, parseSpecialties } from "@/lib/helpers";
import { Card, SectionHeading } from "@/components/ui";
import { HelperProfileForm } from "@/components/helper-profile-form";

export default async function HelperProfilePage() {
  const { helper } = await requireApprovedHelper();
  const specialties = parseSpecialties(helper.specialties);

  return (
    <div>
      <SectionHeading
        eyebrow="Helper Profile"
        title="Edit your helper profile"
        description="You can update only your own helper-facing details here. Admin controls activation and assignment."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HelperProfileForm
          initialValues={{
            name: helper.name,
            category: helper.category,
            shortBio: helper.shortBio,
            portfolioNote: helper.portfolioNote ?? "",
            whatsappNumber: helper.whatsappNumber ?? "",
            responseTime: helper.responseTime ?? "",
            deliveryTime: helper.deliveryTime ?? "",
          }}
        />

        <Card className="bg-white">
          <div className="display-font text-3xl font-black">Current profile snapshot</div>
          <div className="mt-5 grid gap-3 text-sm font-semibold">
            <p>Type: {getHelperTypeLabel(helper.type)}</p>
            <p>Status: {getHelperStatusLabel(helper.status)}</p>
            <p>Category: {getCategoryLabel(helper.category)}</p>
            <p>Specialties: {specialties.length > 0 ? specialties.map((item) => item.label).join(", ") : "Managed by admin"}</p>
            <p>Email: {helper.email ?? "Not linked"}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
