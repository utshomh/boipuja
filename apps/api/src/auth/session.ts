import { and, eq, gt, isNull } from "drizzle-orm";
import { authSessions, db, users } from "@boipuja/db";
import { randomBytes, createHash } from "node:crypto";

export const SESSION_COOKIE_NAME = "boipuja_cookie";

export const SESSION_TTL_DAYS = 30;

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  return expiresAt;
}

export function getSessionCookieMaxAge() {
  return SESSION_TTL_DAYS * 24 * 60 * 60;
}

export async function getCurrentUserFromCookie(
  sessionToken: string | undefined,
) {
  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashSessionToken(sessionToken);

  const [session] = await db
    .select({
      user: users,
    })
    .from(authSessions)
    .innerJoin(users, eq(users.id, authSessions.userId))
    .where(
      and(
        eq(authSessions.tokenHash, tokenHash),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return session?.user ?? null;
}
