import { pgEnum } from "drizzle-orm/pg-core";

export const readingStatusValues = [
  "want_to_read",
  "reading",
  "finished",
  "dropped",
] as const;

export const visibilityValues = ["private", "public"] as const;

export const sessionStatusValues = [
  "scheduled",
  "live",
  "paused",
  "ended",
  "cancelled",
] as const;

export const sessionSyncModeValues = ["host_controlled", "loose_sync"] as const;

export const participantRoleValues = [
  "host",
  "moderator",
  "participant",
] as const;

export const filePurposeValues = [
  "avatar",
  "book_cover",
  "book_file",
  "attachment",
] as const;

export const bookFormatValues = ["pdf", "epub", "other"] as const;

export const readingStatusEnum = pgEnum("reading_status", readingStatusValues);

export const visibilityEnum = pgEnum("visibility", visibilityValues);

export const sessionStatusEnum = pgEnum("session_status", sessionStatusValues);

export const sessionSyncModeEnum = pgEnum(
  "session_sync_mode",
  sessionSyncModeValues,
);

export const participantRoleEnum = pgEnum(
  "participant_role",
  participantRoleValues,
);

export const filePurposeEnum = pgEnum("file_purpose", filePurposeValues);

export const bookFormatEnum = pgEnum("book_format", bookFormatValues);

export type ReadingStatus = (typeof readingStatusValues)[number];
export type Visibility = (typeof visibilityValues)[number];
export type SessionStatus = (typeof sessionStatusValues)[number];
export type SessionSyncMode = (typeof sessionSyncModeValues)[number];
export type ParticipantRole = (typeof participantRoleValues)[number];
export type FilePurpose = (typeof filePurposeValues)[number];
export type BookFormat = (typeof bookFormatValues)[number];
