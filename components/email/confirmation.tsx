import Template from "./template";
import { Text } from "@react-email/components";
import config from "@/tenants/designverse/designverse.json";

interface ConfirmationProps {
  name: string;
  position: string;
  preview: string;
}

const Confirmation = ({ name, position, preview }: ConfirmationProps) => {
  return (
    <Template name={name} preview={preview}>
      <Text>
        Thank you for applying as a{" "}
        <strong>{position ?? "Insert Position"}</strong>!
      </Text>
      <Text>
        We appreciate your support towards {config.name}. Please keep an eye out
        for future {config.name} emails regarding updates and announcements.
      </Text>
    </Template>
  );
};

export default Confirmation;
