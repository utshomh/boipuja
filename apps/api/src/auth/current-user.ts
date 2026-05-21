import { and, eq, gt, isNull } from "drizzle-orm";

import { db, users, authSessions } from "@boipuja/db";

import { hashSessionToken } from "./session";

export type AuthUser = typeof users.$inferSelect;

export async function getCurrentUserFromSessionToken(
  sessionToken: string | null | undefined,
): Promise<AuthUser | null> {
  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashSessionToken(sessionToken);

  const [row] = await db
    .select({
      user: users,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(
      and(
        eq(authSessions.tokenHash, tokenHash),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return row?.user ?? null;
}
