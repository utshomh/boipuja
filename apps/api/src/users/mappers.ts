import type { Static } from "elysia";

import type { users } from "@boipuja/db/schema";
import { MeDto, PublicUserDto, UserSummaryDto } from "@boipuja/contracts/users";

type DbUser = typeof users.$inferSelect;

export function toUserSummaryDto(
  user: Pick<DbUser, "id" | "username" | "displayName" | "avatarUrl">,
): Static<typeof UserSummaryDto> {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}

export function toPublicUserDto(
  user: Pick<
    DbUser,
    "id" | "username" | "displayName" | "avatarUrl" | "bio" | "createdAt"
  >,
): Static<typeof PublicUserDto> {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toMeDto(user: DbUser): Static<typeof MeDto> {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
