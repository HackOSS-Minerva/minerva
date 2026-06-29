import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatShirtSize(size: string): string {
  const sizeMap: Record<string, string> = {
    'XS': 'Extra Small',
    'S': 'Small',
    'M': 'Medium',
    'L': 'Large',
    'XL': 'Extra Large',
    'XXL': 'Double Extra Large'
  };
  return `(${size}) ${sizeMap[size] || size}`;
}
