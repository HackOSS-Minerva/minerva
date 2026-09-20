import { z } from "zod";

import { parseCsv } from "./csv";

export const BASE_COLUMNS = [
  "tenant_slug",
  "tenant_name",
  "domain",
  "contact_email",
  "discord_url",
  "instagram_url",
  "linkedin_url",
  "devpost_url",
  "heart",
  "logo_url",
  "calendar_id",
  "event_name",
  "event_start_time",
  "event_end_time",
  "submission_deadline",
  "git_commit_grace_window_minutes",
  "registration_open_offset",
] as const;

export const LOCK_PATHS = [
  ["forms", "participant"],
  ["forms", "judge"],
  ["forms", "speaker"],
  ["forms", "superadmin"],
  ["forms", "volunteer"],
  ["forms", "submission"],
  ["forms", "feedback"],
  ["judge", "assignments"],
  ["judge", "submissions"],
  ["judge", "orientation"],
  ["judge", "certificate"],
  ["sponsor", "resume-book"],
  ["sponsor", "team-projects"],
  ["sponsor", "analytics"],
  ["live", "checkin"],
  ["live", "teams"],
] as const;

export const DESCRIPTION_FILES = {
  mdx_participants: "participants.mdx",
  mdx_judges: "judges.mdx",
  mdx_speakers: "speakers.mdx",
  mdx_superadmins: "superadmins.mdx",
  mdx_volunteers: "volunteers.mdx",
  mdx_feedback: "feedback.mdx",
  mdx_submission: "submission.mdx",
  mdx_rules: "rules.mdx",
  mdx_venue: "venue.mdx",
  mdx_code_of_conduct: "code-of-conduct.mdx",
  mdx_judge_orientation: "judge-orientation.mdx",
} as const;

const LOCK_COLUMNS = LOCK_PATHS.flatMap(([section, name]) => [
  `lock_${section}_${name}_opens_at`,
  `lock_${section}_${name}_closes_at`,
]);

export const CSV_COLUMNS = [
  ...BASE_COLUMNS,
  ...LOCK_COLUMNS,
  ...Object.keys(DESCRIPTION_FILES),
] as const;

export type DescriptionKey = keyof typeof DESCRIPTION_FILES;

export interface TenantConfigFile {
  slug: string;
  name: string;
  domain: string;
  discord: string;
  email: string;
  instagram: string;
  linkedin: string;
  devpost?: string;
  heart: string;
  logo: string;
  calendarid: string;
  event: {
    name: string;
    startTime: string;
    endTime: string;
    deadline: string;
    gitCommitGraceWindowMinutes?: number;
    openOffset?: string;
  };
  locks: Record<string, Record<string, [string, string]>>;
}

export interface TenantInput {
  slug: string;
  config: TenantConfigFile;
  descriptions: Record<DescriptionKey, string>;
}

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const urlSchema = z.string().url();
const emailSchema = z.string().email();
const datetimeSchema = z.iso.datetime({ offset: true });
const optionalLinkColumns = [
  "discord_url",
  "instagram_url",
  "linkedin_url",
] as const;
const requiredValueColumns = new Set([
  "tenant_slug",
  "tenant_name",
  "domain",
  "contact_email",
  "logo_url",
  "calendar_id",
  "event_name",
  "event_start_time",
  "event_end_time",
  "submission_deadline",
  ...LOCK_COLUMNS,
]);

const fail = (rowNumber: number, column: string, message: string): never => {
  throw new Error(`row ${rowNumber}: ${column}: ${message}`);
};

const normalizeValue = (value: string) => value.trim();

const requireValue = (
  values: Record<string, string>,
  rowNumber: number,
  column: string,
) => {
  const value = normalizeValue(values[column] ?? "");
  if (value === "") {
    fail(rowNumber, column, "required");
  }
  return value;
};

const validateUrl = (value: string, rowNumber: number, column: string) => {
  if (!urlSchema.safeParse(value).success) {
    fail(rowNumber, column, "invalid URL");
  }
  return value;
};

const validateDatetime = (value: string, rowNumber: number, column: string) => {
  if (!datetimeSchema.safeParse(value).success) {
    fail(rowNumber, column, "invalid ISO datetime with offset");
  }
  return value;
};

const validateRange = (
  rowNumber: number,
  openColumn: string,
  closeColumn: string,
  opensAt: string,
  closesAt: string,
) => {
  if (Date.parse(opensAt) >= Date.parse(closesAt)) {
    fail(rowNumber, openColumn, `must be before ${closeColumn}`);
  }
};

const parseOptionalLink = (
  values: Record<string, string>,
  rowNumber: number,
  column: string,
) => {
  const value = normalizeValue(values[column] ?? "");
  return value === "" ? "" : validateUrl(value, rowNumber, column);
};

const parseOptionalInteger = (
  values: Record<string, string>,
  rowNumber: number,
  column: string,
) => {
  const value = normalizeValue(values[column] ?? "");
  if (value === "") {
    return undefined;
  }
  const parsed = Number(value);
  if (
    !/^(?:0|[1-9]\d*)$/.test(value) ||
    !Number.isSafeInteger(parsed) ||
    parsed < 0 ||
    parsed > 1440
  ) {
    fail(rowNumber, column, "must be an integer between 0 and 1440");
  }
  return parsed;
};

export function parseTenantCsv(source: string): TenantInput[] {
  const parsed = parseCsv(source);
  const expectedColumns = new Set<string>(CSV_COLUMNS);
  const providedColumns = new Set(parsed.headers);

  for (const column of CSV_COLUMNS) {
    if (!providedColumns.has(column)) {
      throw new Error(`missing required header '${column}'`);
    }
  }

  for (const column of parsed.headers) {
    if (!expectedColumns.has(column) && column !== "Timestamp") {
      throw new Error(`unknown header '${column}'`);
    }
  }

  const seenSlugs = new Set<string>();

  return parsed.rows.map(({ rowNumber, values }) => {
    for (const column of requiredValueColumns) {
      requireValue(values, rowNumber, column);
    }

    const slug = requireValue(values, rowNumber, "tenant_slug");
    if (!slugSchema.safeParse(slug).success) {
      fail(rowNumber, "tenant_slug", "must match lowercase kebab-case");
    }
    if (seenSlugs.has(slug)) {
      fail(rowNumber, "tenant_slug", `duplicate slug '${slug}'`);
    }
    seenSlugs.add(slug);

    const domain = validateUrl(
      requireValue(values, rowNumber, "domain"),
      rowNumber,
      "domain",
    );
    const email = requireValue(values, rowNumber, "contact_email");
    if (!emailSchema.safeParse(email).success) {
      fail(rowNumber, "contact_email", "invalid email");
    }
    const logo = validateUrl(
      requireValue(values, rowNumber, "logo_url"),
      rowNumber,
      "logo_url",
    );
    const eventStart = validateDatetime(
      requireValue(values, rowNumber, "event_start_time"),
      rowNumber,
      "event_start_time",
    );
    const eventEnd = validateDatetime(
      requireValue(values, rowNumber, "event_end_time"),
      rowNumber,
      "event_end_time",
    );
    const eventDeadline = validateDatetime(
      requireValue(values, rowNumber, "submission_deadline"),
      rowNumber,
      "submission_deadline",
    );
    validateRange(
      rowNumber,
      "event_start_time",
      "event_end_time",
      eventStart,
      eventEnd,
    );
    if (Date.parse(eventDeadline) < Date.parse(eventStart)) {
      fail(
        rowNumber,
        "submission_deadline",
        "must be at or after event_start_time",
      );
    }

    const locks: TenantConfigFile["locks"] = {};
    for (const [section, name] of LOCK_PATHS) {
      const opensColumn = `lock_${section}_${name}_opens_at`;
      const closesColumn = `lock_${section}_${name}_closes_at`;
      const opensAt = validateDatetime(
        requireValue(values, rowNumber, opensColumn),
        rowNumber,
        opensColumn,
      );
      const closesAt = validateDatetime(
        requireValue(values, rowNumber, closesColumn),
        rowNumber,
        closesColumn,
      );
      validateRange(rowNumber, opensColumn, closesColumn, opensAt, closesAt);
      (locks[section] ??= {})[name] = [opensAt, closesAt];
    }

    const event: TenantConfigFile["event"] = {
      name: requireValue(values, rowNumber, "event_name"),
      startTime: eventStart,
      endTime: eventEnd,
      deadline: eventDeadline,
    };
    const graceWindow = parseOptionalInteger(
      values,
      rowNumber,
      "git_commit_grace_window_minutes",
    );
    if (graceWindow !== undefined) {
      event.gitCommitGraceWindowMinutes = graceWindow;
    }
    const openOffset = normalizeValue(values.registration_open_offset ?? "");
    if (openOffset !== "") {
      event.openOffset = openOffset;
    }

    const descriptions = Object.fromEntries(
      Object.keys(DESCRIPTION_FILES).map((key) => [
        key,
        (values[key] ?? "").replace(/\r\n?/g, "\n"),
      ]),
    ) as Record<DescriptionKey, string>;
    const config: TenantConfigFile = {
      slug,
      name: requireValue(values, rowNumber, "tenant_name"),
      domain,
      discord: parseOptionalLink(values, rowNumber, optionalLinkColumns[0]),
      email,
      instagram: parseOptionalLink(values, rowNumber, optionalLinkColumns[1]),
      linkedin: parseOptionalLink(values, rowNumber, optionalLinkColumns[2]),
      devpost: parseOptionalLink(values, rowNumber, "devpost_url"),
      heart: normalizeValue(values.heart ?? ""),
      logo,
      calendarid: requireValue(values, rowNumber, "calendar_id"),
      event,
      locks,
    };

    return { slug, config, descriptions };
  });
}
