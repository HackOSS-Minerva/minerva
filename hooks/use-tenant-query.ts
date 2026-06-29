import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useIdeas(tenant: string) {
  return useQuery(api.ideas.list, { tenant });
}
