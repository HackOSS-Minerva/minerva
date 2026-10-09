"use client";

import { useMemo, useState } from "react";
import { useSchedule } from "@/hooks/use-schedule";
import { columns } from "@/components/schedule/columns";
import { DataTable } from "@/components/schedule/data-table";
import { IncompleteEventsAlert } from "@/components/schedule/incomplete-events-alert";
import { ScheduleValidationSuccess } from "@/components/schedule/schedule-validation-success";
import { getIncompleteScheduleEvents } from "@/lib/schedule";

const ScheduleContent = () => {
  const { data, isLoading, isError, error } = useSchedule();
  const [filterIncompleteOnly, setFilterIncompleteOnly] = useState(false);

  // On page load / data arrival, parse frontend events to check for:
  // Title, description, date, time, and location
  const items = data?.items;
  const incompleteEvents = useMemo(() => {
    if (!items) return [];
    return getIncompleteScheduleEvents(items);
  }, [items]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="mx-auto w-10/12">
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-destructive text-lg font-semibold">
          Failed to load schedule:{" "}
          {(error as Error)?.message ?? "Unknown error"}
        </p>
      </div>
    );
  }

  const displayedEvents = filterIncompleteOnly
    ? incompleteEvents.map((issue) => issue.event)
    : (data?.items ?? []);
  return (
    <div className="flex w-full flex-col gap-6">
      {/* UI showing validation status on page load */}
      {incompleteEvents.length > 0 ? (
        <IncompleteEventsAlert
          incompleteEvents={incompleteEvents}
          filterActive={filterIncompleteOnly}
          onToggleFilter={() => setFilterIncompleteOnly((prev) => !prev)}
        />
      ) : (
        <ScheduleValidationSuccess totalCount={items?.length ?? 0} />
      )}

      <DataTable columns={columns} data={displayedEvents} />
    </div>
  );
};

export default ScheduleContent;
