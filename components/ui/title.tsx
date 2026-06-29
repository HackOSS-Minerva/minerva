import { type ReactNode } from "react";

interface TitleProps {
  children: ReactNode;
}

const Title = ({ children }: TitleProps) => {
  return (
    <h1 className="mb-6 text-3xl font-bold tracking-tight">{children}</h1>
  );
};

export default Title;