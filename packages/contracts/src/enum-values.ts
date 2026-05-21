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

export type ReadingStatus = (typeof readingStatusValues)[number];
export type Visibility = (typeof visibilityValues)[number];
export type SessionStatus = (typeof sessionStatusValues)[number];
export type SessionSyncMode = (typeof sessionSyncModeValues)[number];
export type ParticipantRole = (typeof participantRoleValues)[number];
export type FilePurpose = (typeof filePurposeValues)[number];
