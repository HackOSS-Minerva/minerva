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

interface FilterOption {
  value: string; // e.g. "status:completed" or "day:Sunday"
  label: string;
  group: string;
  columnId: string;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function buildFilterOptions(): FilterOption[] {
  const options: FilterOption[] = [];

  // Status options
  const statuses: Array<{ value: string; label: string }> = [
    { value: "completed", label: "Completed" },
    { value: "ongoing", label: "Ongoing" },
    { value: "planned", label: "Planned" },
  ];

  statuses.forEach((s) =>
    options.push({
      value: `status:${s.value}`,
      label: s.label,
      group: "Status",
      columnId: "status",
    }),
  );

  // Day of week options
  DAYS_OF_WEEK.forEach((day) =>
    options.push({
      value: `day:${day}`,
      label: day,
      group: "Day",
      columnId: "day",
    }),
  );

  return options;
}

function getColumnId(value: string): string {
  return value.split(":")[0];
}

function getColumnValue(value: string): string {
  return value.split(":").slice(1).join(":");
}

export function ScheduleToolbar({
  table,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
}) {
  const anchor = useComboboxAnchor();
  const allFilterOptions = React.useMemo(() => buildFilterOptions(), []);

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