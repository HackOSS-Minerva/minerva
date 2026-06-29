"use client";
import { useParams } from "next/navigation";
import { useState, useMemo, useRef } from "react";
import { useSchedule } from "@/hooks/use-schedule";
import { useDashboard } from "@/hooks/use-dashboard";
import { DataTable } from "./datatable";
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

const Dashboard = () => {
  const { dashboard: slug } = useParams<{ dashboard: string }>();
  const anchor = useComboboxAnchor();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const isSelecting = useRef(false);

  const { data: schedule } = useSchedule();

  const eventid =
    slug === "attendance" ? selectedEventId || undefined : undefined;
  const dashboard = useDashboard(eventid);

  const events = schedule?.items?.filter((event) => event.summary) ?? [];

  const getDayOfWeek = (dateTime: string, timeZone: string): string => {
    return new Date(dateTime).toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: timeZone,
    });
  };

  const allFilterOptions = useMemo(() => {
    return events.map((event) => {
      const day = getDayOfWeek(
        event.start.dateTime,
        event.start.timeZone ?? "America/New_York",
      );
      return {
        value: event.id,
        label: event.summary,
        group: day,
      };
    });
  }, [events]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return allFilterOptions;
    const q = inputValue.toLowerCase();
    return allFilterOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.group.toLowerCase().includes(q),
    );
  }, [inputValue, allFilterOptions]);

  const groupedOptions = useMemo(() => {
    const map = new Map<string, typeof allFilterOptions>();
    for (const opt of filteredOptions) {
      const group = map.get(opt.group) ?? [];
      group.push(opt);
      map.set(opt.group, group);
    }
    return Array.from(map.entries());
  }, [filteredOptions]);

  if (dashboard.data === undefined) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      {slug === "attendance" && (
        <div className="px-4 lg:px-6">
          <Combobox
            value={selectedEventId}
            onValueChange={(value: string | null) => {
              setSelectedEventId(value ?? "");
              setInputValue("");
              isSelecting.current = true;
            }}
            onInputValueChange={(value: string) => {
              if (isSelecting.current) {
                isSelecting.current = false;
                return;
              }
              setInputValue(value);
            }}
            filteredItems={filteredOptions}
          >
            <ComboboxChips ref={anchor} className="w-full min-w-0">
              <ComboboxValue>
                {(value: string) => {
                  if (!value) return null;
                  const option = allFilterOptions.find(
                    (o) => o.value === value,
                  );
                  const label = option?.label ?? value;
                  const group = option?.group ?? "";

                  return (
                    <ComboboxChip key={value}>
                      {group ? `${group}: ${label}` : label}
                    </ComboboxChip>
                  );
                }}
              </ComboboxValue>
              <ComboboxChipsInput
                placeholder={
                  events.length > 0
                    ? "Select an event to view attendance..."
                    : "No events available"
                }
              />
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
              <ComboboxEmpty>No events found.</ComboboxEmpty>
              <ComboboxList>
                {groupedOptions.map(([groupLabel, options]) => (
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
      )}
      <DataTable dashboard={dashboard} />
    </div>
  );
};

export default Dashboard;
