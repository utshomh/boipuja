import { pgEnum } from "drizzle-orm/pg-core";

import {
  readingStatusValues,
  visibilityValues,
  sessionStatusValues,
  sessionSyncModeValues,
  participantRoleValues,
  filePurposeValues,
} from "@boipuja/contracts/enum-values";

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

export type ReadingStatus = (typeof readingStatusValues)[number];
export type Visibility = (typeof visibilityValues)[number];
export type SessionStatus = (typeof sessionStatusValues)[number];
export type SessionSyncMode = (typeof sessionSyncModeValues)[number];
export type ParticipantRole = (typeof participantRoleValues)[number];
export type FilePurpose = (typeof filePurposeValues)[number];
