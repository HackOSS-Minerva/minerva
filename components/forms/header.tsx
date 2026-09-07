"use client";
import { CardHeader } from "@/components/ui/card";
import { useFields } from "@/hooks/use-fields";

const Header = () => {
  const {
    metadata: { Header },
  } = useFields();

  return (
    <CardHeader>
      <div className="px-4">
        <Header />
      </div>
    </CardHeader>
  );
};

export default Header;
