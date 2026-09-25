"use client";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { useSchedule } from "@/hooks/use-schedule";
import { useDashboard } from "@/hooks/use-dashboard";
import { groupEventsByDay } from "@/lib/schedule";
import { DataTable } from "./datatable";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const { dashboard: slug } = useParams<{ dashboard: string }>();
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const { data: schedule } = useSchedule();

  const eventid =
    slug === "attendance" ? selectedEventId || undefined : undefined;
  const dashboard = useDashboard(eventid);

  const events = useMemo(
    () => schedule?.items?.filter((event) => event.summary) ?? [],
    [schedule],
  );
  const groupedEventOptions = useMemo(() => groupEventsByDay(events), [events]);

  if (dashboard.data === undefined) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      {slug === "attendance" && (
        <div>
          <Select
            value={selectedEventId || undefined}
            onValueChange={setSelectedEventId}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  events.length > 0
                    ? "Select an event to view attendance..."
                    : "No events available"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {groupedEventOptions.map(([groupLabel, options]) => (
                <SelectGroup key={groupLabel}>
                  <SelectLabel>{groupLabel}</SelectLabel>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <DataTable dashboard={dashboard} />
    </div>
  );
};

export default Dashboard;
