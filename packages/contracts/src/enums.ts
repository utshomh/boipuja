import { t } from "elysia";

import {
  filePurposeValues,
  participantRoleValues,
  readingStatusValues,
  sessionStatusValues,
  sessionSyncModeValues,
  visibilityValues,
} from "./enum-values";

const toEnumObject = <const T extends readonly string[]>(values: T) =>
  Object.fromEntries(values.map((value) => [value, value])) as {
    [K in T[number]]: K;
  };

export const ReadingStatusEnum = t.Enum(toEnumObject(readingStatusValues));

export const VisibilityEnum = t.Enum(toEnumObject(visibilityValues));

export const SessionStatusEnum = t.Enum(toEnumObject(sessionStatusValues));

export const SessionSyncModeEnum = t.Enum(toEnumObject(sessionSyncModeValues));

export const ParticipantRoleEnum = t.Enum(toEnumObject(participantRoleValues));

export const FilePurposeEnum = t.Enum(toEnumObject(filePurposeValues));
