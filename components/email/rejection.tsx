import Template from "./template";
import { Text } from "@react-email/components";
import config from "@/tenants/designverse/designverse.json";

interface RejectionProps {
  name: string;
  position: string;
  preview: string;
}

const Rejection = ({ name, position, preview }: RejectionProps) => {
  return (
    <Template name={name} preview={preview}>
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
