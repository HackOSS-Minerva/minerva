import Template from "./template";
import { Button, Section, Text } from "@react-email/components";
import type { TenantConfig } from "@/lib/tenant-config";

interface AcceptanceProps {
  name: string;
  position: string;
  preview: string;
  tenant: TenantConfig;
}

const Acceptance = ({ name, position, preview, tenant }: AcceptanceProps) => {
  return (
    <Template name={name} preview={preview} tenant={tenant}>
      <Text>
        🎉 Congratulations 🎉 You have been accepted into {tenant.name} as a{" "}
        <strong>{position ?? "Insert Position"}</strong>
      </Text>
      <Text>
        We will be using Discord as our primary communication platform regarding
        announcements, events, workshops, activities, and more!
      </Text>
      <Section className="text-center">
        <Button
          href={tenant.discord}
          className="rounded bg-[#7289da] px-5 py-3 text-center text-xs font-semibold text-white no-underline"
        >
          Join Discord
        </Button>
      </Section>
      <Text>We look forward to seeing you there!</Text>
    </Template>
  );
};

export default Acceptance;
