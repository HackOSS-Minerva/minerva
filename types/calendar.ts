export interface GoogleEvent {
  kind: string;
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  description?: string;
  location?: string;
  creator: {
    email: string;
    self: boolean;
  };
  organizer: {
    email: string;
    self: boolean;
  };
  start: {
    dateTime: string;
    date?: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    date?: string;
    timeZone: string;
  };
}

export interface CalendarResponse {
  kind: string;
  etag: string;
  summary: string;
  updated: string;
  timeZone: string;
  accessRole: string;
  defaultReminders: Array<{
    method: string;
    minutes: number;
  }>;
  nextSyncToken?: string;
  items: GoogleEvent[];
}

export type MissingScheduleField =
  | "Title"
  | "Description"
  | "Date"
  | "Time"
  | "Location";

export interface IncompleteScheduleEvent {
  event: GoogleEvent;
  id: string;
  title: string;
  missingFields: MissingScheduleField[];
}
