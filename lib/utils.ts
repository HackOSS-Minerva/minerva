import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatShirtSize(size: string): string {
  const sizeMap: Record<string, string> = {
    XS: "Extra Small",
    S: "Small",
    M: "Medium",
    L: "Large",
    XL: "Extra Large",
    XXL: "Double Extra Large",
  };
  return `(${size}) ${sizeMap[size] || size}`;
}

/** "PENDING" -> "Pending", "judge" -> "Judge". Guards empty strings. */
export function toTitleCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** "PENDING_REVIEW" -> "Pending Review". Used for status badges/labels. */
export function toSpacedTitleCase(str: string, delimiter = "_"): string {
  if (!str) return str;
  return str
    .split(delimiter)
    .map((word) => toTitleCase(word))
    .join(" ");
}

/** Multi-word variant: "class announcement" -> "Class Announcement". */
export function toWordsTitleCase(str: string): string {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => (word ? toTitleCase(word) : word))
    .join(" ");
}

const GUEST_INITIALS_FALLBACK = "GU";

/** Up to two initials for avatar/logo fallbacks ("Anna Marie Lopez" -> "AM"). */
export function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter((part) => /^[a-z0-9]/i.test(part[0]));
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || GUEST_INITIALS_FALLBACK
  );
}

