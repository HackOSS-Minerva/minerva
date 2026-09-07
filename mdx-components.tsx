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
  ul: ({ children }) => (
    <CardDescription>
      <ul className="my-2 list-disc space-y-1 pl-6">{children}</ul>
    </CardDescription>
  ),
  ol: ({ children }) => (
    <CardDescription>
      <ol className="my-2 list-decimal space-y-1 pl-6">{children}</ol>
    </CardDescription>
  ),
  li: ({ children }) => (
    <li className="text-left [&_p]:text-left">{children}</li>
  ),
  strong: ({ children }) => <span className="font-bold">{children}</span>,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
