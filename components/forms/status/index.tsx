import { EmailType } from "@/types/email";
import Accepted from "./accepted";
import Rejected from "./rejected";
import Pending from "./pending";

interface StatusProps {
  status: EmailType;
}

const Status = ({ status }: StatusProps) => {
  switch (status) {
    case "ACCEPTANCE":
      return <Accepted />;
    case "REJECTION":
      return <Rejected />;
    case "CONFIRMATION":
      return <Pending />;
    default:
      return <Pending />;
  }
};

export default Status;
