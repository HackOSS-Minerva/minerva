"use client";

import * as React from "react";
import type { RowData, Table } from "@tanstack/react-table";
import { FilterToolbar, type FilterOption } from "@/components/schedule/toolbar";
import { statuses } from "@/data/status";
import {
  affiliations,
  ages,
  dietrestrictions,
  feedbackFindOptions,
  feedbackMaxRating,
  genders,
  grades,
  roles,
  shirts,
  teams,
} from "@/data/information";
import { formatShirtSize, toTitleCase } from "@/lib/localization";

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
    feedbackFindOptions.forEach((f) =>
      options.push({
        value: `find:${f}`,
        label: toTitleCase(f),
        group: "Found Via",
        columnId: "find",
      }),
    );

    for (let i = 1; i <= feedbackMaxRating; i++) {
      options.push({
        value: `rating:${i}`,
        label: `${i} ${i === 1 ? "(Worst)" : i === feedbackMaxRating ? "(Best)" : ""}`,
        group: "Rating",
        columnId: "rating",
      });
    }
  }

  if (slug === "participants") {
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

export function TableToolbar<TData extends RowData>({
  table,
  slug,
}: {
  table: Table<TData>;
  slug: string;
}) {
  const allFilterOptions = React.useMemo(() => buildFilterOptions(slug), [slug]);
  return <FilterToolbar table={table} allFilterOptions={allFilterOptions} />;
}
