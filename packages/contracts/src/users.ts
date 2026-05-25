import { t } from "elysia";

import { UuidString } from "./common";

export const UserSummaryDto = t.Object({
  id: UuidString,
  username: t.String(),
  displayName: t.String(),
  avatarUrl: t.Nullable(t.String()),
});

export const PublicUserDto = t.Object({
  id: UuidString,
  username: t.String(),
  displayName: t.String(),
  avatarUrl: t.Nullable(t.String()),
  bio: t.Nullable(t.String()),
  createdAt: t.String(),
});

export const MeDto = t.Object({
  id: UuidString,
  email: t.String(),
  emailVerified: t.Boolean(),
  username: t.String(),
  displayName: t.String(),
  avatarUrl: t.Nullable(t.String()),
  bio: t.Nullable(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const UpdateMeBody = t.Object({
  username: t.Optional(t.String({ minLength: 1, pattern: "\\S" })),
  displayName: t.Optional(t.String({ minLength: 1, pattern: "\\S" })),
  avatarUrl: t.Optional(t.Nullable(t.String())),
  bio: t.Optional(t.Nullable(t.String())),
});
