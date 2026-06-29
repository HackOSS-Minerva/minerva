"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface PackingChecklistProps {
  tenant: string;
}

// Items must match the markdown list in packing-checklist.mdx
const ITEMS = [
  "Laptop",
  "Charger",
  "Student ID",
  "Water Bottle",
  "Sleeping Bag",
  "Headphones",
  "Comfortable Clothes",
  "Toiletries",
  "Snacks",
  "Reusable Bag",
];

export function PackingChecklist({ tenant }: PackingChecklistProps) {
  const [checkedItems, setCheckedItems] = useLocalStorage<
    Record<string, boolean>
  >(`packing-${tenant}`, {});

  return (
    <div className="space-y-3">
      {ITEMS.map((item) => (
        <label key={item} className="flex cursor-pointer items-center gap-3">
          <Checkbox
            checked={checkedItems[item] ?? false}
            onCheckedChange={(checked) =>
              setCheckedItems((prev) => ({
                ...prev,
                [item]: checked === true,
              }))
            }
          />
          <span
            className={`text-sm ${
              checkedItems[item] ? "text-muted-foreground line-through" : ""
            }`}
          >
            {item}
          </span>
        </label>
      ))}
    </div>
  );
}
