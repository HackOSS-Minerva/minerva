"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { statuses } from "@/data/status";
import {
  shirts,
  affiliations,
  teams,
  genders,
  grades,
  ages,
  dietrestrictions,
} from "@/data/information";
import { formatShirtSize } from "@/lib/utils";

const roles = [
  "participant",
  "judge",
  "speaker",
  "superadmin",
  "volunteer",
] as const;

interface FilterOption {
  value: string; // e.g. "status:ACCEPTANCE"
  label: string;
  group: string;
  columnId: string;
}

function toTitleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function buildFilterOptions(slug: string): FilterOption[] {
  const options: FilterOption[] = [];

  // Status is common to all
  statuses.forEach((s) =>
    options.push({
      value: `status:${s}`,
      label: toTitleCase(s),
      group: "Status",
      columnId: "status",
    }),
  );

  // Shirt size is common to all
  shirts.forEach((s) =>
    options.push({
      value: `shirt:${s}`,
      label: formatShirtSize(s),
      group: "Shirt Size",
      columnId: "shirt",
    }),
  );

  // Gender is common to all
  genders.forEach((g) =>
    options.push({
      value: `gender:${g}`,
      label: g,
      group: "Gender",
      columnId: "gender",
    }),
  );

  // Diet restriction is common to all
  dietrestrictions.forEach((d) =>
    options.push({
      value: `dietrestriction:${d}`,
      label: d,
      group: "Diet Restriction",
      columnId: "dietrestriction",
    }),
  );

  // Role is available on the attendance dashboard
  roles.forEach((r) =>
    options.push({
      value: `role:${r}`,
      label: toTitleCase(r),
      group: "Role",
      columnId: "role",
    }),
  );

  if (slug === "judges" || slug === "speakers") {
    affiliations.forEach((a) =>
      options.push({
        value: `affiliation:${a}`,
        label: a,
        group: "Affiliation",
        columnId: "affiliation",
      }),
    );
  }

  if (slug === "superadmins") {
    teams.forEach((t) =>
      options.push({
        value: `team:${t}`,
        label: t,
        group: "Team",
        columnId: "team",
      }),
    );
  }

  if (slug === "feedback") {
    const findOptions = [
      "instagram",
      "discord",
      "website",
      "class announcement",
      "devpost",
      "tabling",
      "student organization",
      "email",
    ];
    findOptions.forEach((f) =>
      options.push({
        value: `find:${f}`,
        label: toTitleCase(f),
        group: "Found Via",
        columnId: "find",
      }),
    );

    for (let i = 1; i <= 10; i++) {
      options.push({
        value: `rating:${i}`,
        label: `${i} ${i === 1 ? "(Worst)" : i === 10 ? "(Best)" : ""}`,
        group: "Rating",
        columnId: "rating",
      });
    }
  }

  if (slug === "participants" || slug === "superadmins") {
    grades.forEach((g) =>
      options.push({
        value: `grade:${g}`,
        label: g,
        group: "Grade",
        columnId: "grade",
      }),
    );
    ages.forEach((a) =>
      options.push({
        value: `age:${a}`,
        label: a,
        group: "Age",
        columnId: "age",
      }),
    );
  }

  return options;
}

function getColumnId(value: string): string {
  return value.split(":")[0];
}

function getColumnValue(value: string): string {
  return value.split(":").slice(1).join(":");
}

export function TableToolbar({
  table,
  slug,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
  slug: string;
}) {
  const anchor = useComboboxAnchor();
  const allFilterOptions = React.useMemo(
    () => buildFilterOptions(slug),
    [slug],
  );

  // Only include filter options whose column actually exists in the table
  const filterOptions = React.useMemo(() => {
    const columnIds = new Set(
      table.getAllColumns().map((col) => col.id),
    );
    return allFilterOptions.filter((opt) => columnIds.has(opt.columnId));
  }, [allFilterOptions, table]);

  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  const handleValueChange = (values: string[]) => {
    setSelectedValues(values);

    // Build column filters from selected values
    const filterMap = new Map<string, string[]>();
    for (const composite of values) {
      const colId = getColumnId(composite);
      const colVal = getColumnValue(composite);
      const existing = filterMap.get(colId) ?? [];
      existing.push(colVal);
      filterMap.set(colId, existing);
    }

    const columnFilters = Array.from(filterMap.entries()).map(
      ([id, filterValues]) => ({
        id,
        value: filterValues,
      }),
    );

    table.setColumnFilters(columnFilters);
  };

  // Filter options based on input value
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return filterOptions;
    const q = inputValue.toLowerCase();
    return filterOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.group.toLowerCase().includes(q),
    );
  }, [inputValue, filterOptions]);

  // Group filtered options for rendering
  const groupedFiltered = React.useMemo(() => {
    const map = new Map<string, FilterOption[]>();
    for (const opt of filteredOptions) {
      const group = map.get(opt.group) ?? [];
      group.push(opt);
      map.set(opt.group, group);
    }
    return Array.from(map.entries());
  }, [filteredOptions]);

  return (
    <div className="flex flex-col gap-3 px-4 lg:px-6">
      {/* Grouped filter combobox */}
      <div className="flex items-center gap-2">
        <Combobox
          multiple
          autoHighlight
          value={selectedValues}
          onValueChange={handleValueChange}
          onInputValueChange={setInputValue}
          filteredItems={filteredOptions}
        >
          <ComboboxChips ref={anchor} className="w-full min-w-0">
            <ComboboxValue>
              {(values: string[]) => (
                <>
                  {values.map((value: string) => {
                    const option = filterOptions.find((o) => o.value === value);
                    const label = option?.label ?? value;
                    const group = option?.group ?? "";
                    return (
                      <ComboboxChip key={value}>
                        {group ? `${group}: ${label}` : label}
                      </ComboboxChip>
                    );
                  })}
                </>
              )}
            </ComboboxValue>
            <ComboboxChipsInput placeholder="Filter by..." />
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {groupedFiltered.map(([groupLabel, options]) => (
                <ComboboxGroup key={groupLabel}>
                  <ComboboxLabel>{groupLabel}</ComboboxLabel>
                  {options.map((opt) => (
                    <ComboboxItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}