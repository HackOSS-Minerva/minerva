"use client";

import { useSchedule } from "@/hooks/use-schedule";
import { columns } from "@/components/schedule/columns";
import { DataTable } from "@/components/schedule/data-table";

const ScheduleContent = () => {
  const { data, isLoading, isError, error } = useSchedule();

  if (isLoading) {
    return (
      <>
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
      </>
    );
  }

  if (isError) {
    return (
      <>
        <div className="flex flex-col items-center justify-center">
          <p className="text-destructive text-lg font-semibold">
            Failed to load schedule:{" "}
            {(error as Error)?.message ?? "Unknown error"}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <DataTable columns={columns} data={data?.items ?? []} />
    </>
  );
};

export default ScheduleContent;
