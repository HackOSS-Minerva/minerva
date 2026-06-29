export function convertToCSV(
  data: Record<string, unknown>[],
  fields: string[],
): Blob {
  if (data.length === 0) {
    return new Blob([fields.join(",")], { type: "text/csv" });
  }

  const escapeValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "";
    }
    if (Array.isArray(value)) {
      return escapeValue(value.join("; "));
    }
    if (typeof value === "object") {
      return escapeValue(JSON.stringify(value));
    }
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = fields.join(",");
  const rows = data.map((row) =>
    fields
      .map((field) => {
        if (field === "privacy_policy_consent" || field === "code_of_conduct_consent") {
          return "TRUE";
        }
        return escapeValue(row[field]);
      })
      .join(","),
  );

  const csv = [header, ...rows].join("\r\n");
  return new Blob([csv], { type: "text/csv" });
}