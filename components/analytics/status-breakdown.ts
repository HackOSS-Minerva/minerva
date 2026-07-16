import { createElement } from "react";

type StatusBreakdownProps = {
  title: string;
  rows: Array<{ label: string; value: number | string }>;
};

export function StatusBreakdown({ title, rows }: StatusBreakdownProps) {
  return createElement(
    "section",
    {
      className: "rounded-lg border bg-card text-card-foreground shadow-sm",
      "aria-label": title,
    },
    createElement(
      "h2",
      { className: "p-6 pb-0 text-base font-semibold" },
      title,
    ),
    createElement(
      "div",
      { className: "p-6" },
      createElement(
        "table",
        { className: "w-full text-sm" },
        createElement(
          "thead",
          null,
          createElement(
            "tr",
            { className: "border-b" },
            createElement(
              "th",
              {
                scope: "col",
                className:
                  "h-10 px-2 text-left font-medium text-muted-foreground",
              },
              "Metric",
            ),
            createElement(
              "th",
              {
                scope: "col",
                className:
                  "h-10 px-2 text-right font-medium text-muted-foreground",
              },
              "Count",
            ),
          ),
        ),
        createElement(
          "tbody",
          null,
          ...rows.map((row) =>
            createElement(
              "tr",
              { key: row.label, className: "border-b last:border-0" },
              createElement(
                "th",
                { scope: "row", className: "p-2 text-left font-normal" },
                row.label,
              ),
              createElement(
                "td",
                { className: "p-2 text-right font-medium" },
                row.value,
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
