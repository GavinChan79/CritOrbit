import { ADMIN_WHATSAPP_NUMBER } from "@/lib/constants";
import { Card, SectionHeading } from "@/components/ui";

export default function AdminSettingsPage() {
  return (
    <div>
      <SectionHeading
        eyebrow="Settings"
        title="Phase 1 platform settings"
        description="A lightweight view for the current controlled-routing setup."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <div className="display-font text-2xl font-black">Admin WhatsApp</div>
          <p className="mt-4 text-sm text-muted">
            All student requests are routed through one configured admin number.
          </p>
          <div className="mt-4 rounded-[18px] border-[3px] border-line bg-cream p-4 font-black">
            {ADMIN_WHATSAPP_NUMBER}
          </div>
        </Card>
        <Card className="bg-yellow">
          <div className="display-font text-2xl font-black">Current guardrails</div>
          <ul className="mt-4 space-y-2 text-sm font-semibold">
            <li>No payment flow</li>
            <li>No direct helper chat</li>
            <li>No helper self-service accounts</li>
            <li>No auto-matching yet</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
