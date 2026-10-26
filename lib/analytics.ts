export type AnalyticsRole = "participant" | "judge" | "speaker" | "superadmin" | "volunteer";

export type ApplicationStatus = "PENDING" | "ACCEPTANCE" | "REJECTION";

export type AnalyticsEvent =
  | "application_created"
  | "application_status_changed"
  | "application_deleted"
  | "checkin_created"
  | "checkin_deleted"
  | "submission_created"
  | "submission_deleted";

export type AnalyticsEventProperties = {
  tenant: string;
  entity_id: string;
  role?: AnalyticsRole;
  status?: ApplicationStatus;
  user_id?: string;
  event_id?: string;
  gender?: string;
  dietrestriction?: string;
  shirt?: string;
  school?: string;
  major?: string;
  age?: string;
  grade?: string;
};

export type StatusCounts = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
};

export type ParticipantDemographicKey =
  | "gender"
  | "dietrestriction"
  | "shirt"
  | "school"
  | "major"
  | "age"
  | "grade";

export type ParticipantDemographicBreakdown = {
  value: string;
  count: number;
  percentage: number;
};

export type ParticipantDemographics = Record<
  ParticipantDemographicKey,
  ParticipantDemographicBreakdown[]
>;

export type AnalyticsData = {
  applications: {
    total: number;
    accepted: number;
    byRole: Record<AnalyticsRole, StatusCounts>;
    participantDemographics: ParticipantDemographics;
  };
  checkins: {
    activeParticipants: number;
  };
  submissions: {
    total: number;
  };
};
