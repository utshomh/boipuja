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
