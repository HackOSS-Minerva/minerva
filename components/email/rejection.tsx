import Template, { type EmailConfig } from "./template";
import { Text } from "@react-email/components";
import designverseConfig from "@/tenants/designverse/designverse.json";

interface RejectionProps {
  name: string;
  position: string;
  preview: string;
  config?: EmailConfig;
}

const Rejection = ({
  name,
  position,
  preview,
  config = designverseConfig,
}: RejectionProps) => {
  return (
    <Template name={name} preview={preview} config={config}>
      <Text>
        Thank you for applying to {config.name} as a{" "}
        {position ?? "Insert Position"}. Unfortunately, due to particular
        circumstances we are unable to provide you a spot at {config.name}.
      </Text>
      <Text>
        However, we loved getting to know you and hope that you apply next year.
        If you have any questions, please reach out at {config.email}
      </Text>
    </Template>
  );
};

export default Rejection;
