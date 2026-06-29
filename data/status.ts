export const statuses = ["ACCEPTANCE", "PENDING", "REJECTION"] as const;

export const variants: Record<string, string> = {
  REJECTION: "bg-red-500 text-white",
  PENDING: "bg-yellow-500 text-white",
  ACCEPTANCE: "bg-green-500 text-white",
};
