import { createElement, type AriaAttributes, type ComponentType } from "react";

type MetricIconProps = {
  className?: string;
  "aria-hidden"?: AriaAttributes["aria-hidden"];
};

type MetricCardProps = {
  label: string;
  value: number | string;
  description?: string;
  icon?: ComponentType<MetricIconProps>;
};

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}: MetricCardProps) {
  return createElement(
    "article",
    { className: "rounded-lg border bg-card text-card-foreground shadow-sm" },
    createElement(
      "div",
      {
        className:
          "flex flex-row items-center justify-between space-y-0 p-6 pb-2",
      },
      createElement(
        "h2",
        { className: "text-sm font-medium text-muted-foreground" },
        label,
      ),
      Icon
        ? createElement(Icon, {
            "aria-hidden": "true",
            className: "h-4 w-4 text-muted-foreground",
          })
        : null,
    ),
    createElement(
      "div",
      { className: "p-6 pt-0" },
      createElement("div", { className: "text-2xl font-bold" }, value),
      description
        ? createElement(
            "p",
            { className: "mt-1 text-xs text-muted-foreground" },
            description,
          )
        : null,
    ),
  );
}
