export interface ParsedCsvRow {
  rowNumber: number;
  values: Record<string, string>;
}

export interface ParsedCsv {
  headers: string[];
  rows: ParsedCsvRow[];
}

const fail = (message: string): never => {
  throw new Error(message);
};

/** Parses RFC 4180 CSV while preserving the source row where each record begins. */
export function parseCsv(source: string): ParsedCsv {
  const input = source.startsWith("\uFEFF") ? source.slice(1) : source;
  const rows: ParsedCsvRow[] = [];
  let headers: string[] | undefined;
  let rowNumber = 1;
  let recordRowNumber = 1;
  let field = "";
  let fields: string[] = [];
  let inQuotes = false;
  let quoteClosed = false;
  let fieldStarted = false;

  const finishRow = () => {
    fields.push(field);

    if (headers === undefined) {
      if (fields.every((header) => header === "")) {
        fail("missing headers");
      }

      const seen = new Set<string>();
      for (const [index, header] of fields.entries()) {
        if (header === "") {
          fail(`row 1: column ${index + 1}: empty header`);
        }
        if (seen.has(header)) {
          fail(`duplicate header '${header}'`);
        }
        seen.add(header);
      }
      headers = fields;
    } else {
      if (fields.length !== headers.length) {
        fail(
          `row ${recordRowNumber}: expected ${headers.length} cells, got ${fields.length}`,
        );
      }

      rows.push({
        rowNumber: recordRowNumber,
        values: Object.fromEntries(
          headers.map((header, index) => [header, fields[index]!]),
        ),
      });
    }

    field = "";
    fields = [];
    quoteClosed = false;
    fieldStarted = false;
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]!;

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          quoteClosed = true;
        }
        continue;
      }

      if (character === "\r") {
        if (input[index + 1] === "\n") {
          index += 1;
        }
        field += "\n";
        rowNumber += 1;
        continue;
      }

      if (character === "\n") {
        field += "\n";
        rowNumber += 1;
        continue;
      }

      field += character;
      continue;
    }

    if (quoteClosed) {
      if (character !== "," && character !== "\r" && character !== "\n") {
        fail(`row ${rowNumber}: unexpected character after closing quote`);
      }
    } else if (character === '"') {
      if (field !== "") {
        fail(`row ${rowNumber}: unexpected quote in unquoted field`);
      }
      inQuotes = true;
      fieldStarted = true;
      continue;
    } else if (character !== "," && character !== "\r" && character !== "\n") {
      field += character;
      fieldStarted = true;
      continue;
    }

    if (character === ",") {
      fields.push(field);
      field = "";
      quoteClosed = false;
      fieldStarted = false;
      continue;
    }

    finishRow();
    if (character === "\r" && input[index + 1] === "\n") {
      index += 1;
    }
    rowNumber += 1;
    recordRowNumber = rowNumber;
  }

  if (inQuotes) {
    fail(`row ${rowNumber}: unterminated quoted field`);
  }

  if (fieldStarted || quoteClosed || fields.length > 0) {
    finishRow();
  }

  if (headers === undefined) {
    fail("missing headers");
  }

  return { headers: headers!, rows };
}
