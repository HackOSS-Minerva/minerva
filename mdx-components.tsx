import type { MDXComponents } from "mdx/types";
import { CardDescription, CardTitle } from "@/components/ui/card";

const components = {
  h1: ({ children }) => (
    <CardTitle className="text-primary text-center">{children}</CardTitle>
  ),
  h2: ({ children }) => (
    <CardDescription className="text-center">{children}</CardDescription>
  ),
  p: ({ children }) => (
    <CardDescription className="text-center">{children}</CardDescription>
  ),
  strong: ({ children }) => <span className="font-bold">{children}</span>,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
