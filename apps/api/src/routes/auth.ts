import Elysia from "elysia";
import { and, eq, gt, isNull, or } from "drizzle-orm";

import { serverEnv } from "@boipuja/config/server";
import { authSessions, db, users } from "@boipuja/db";
import {
  AuthUserResponseDto,
  ErrorDto,
  LoginBody,
  LogoutResponseDto,
  RegisterBody,
} from "@boipuja/contracts";

import { toMeDto } from "../users/mappers";
import { conflict, unauthorized } from "../http";
import { normalize, normalizeToLowerCase } from "../utils/normalizers";
import {
  createSessionToken,
  getSessionCookieMaxAge,
  getSessionExpiryDate,
  hashSessionToken,
  SESSION_COOKIE_NAME,
} from "../auth/session";

export const authRoutes = new Elysia({
  prefix: "/auth",
})
  .post(
    "/register",
    async ({ body, cookie, set }) => {
      const email = normalizeToLowerCase(body.email);
      const username = normalizeToLowerCase(body.username);

      const [existingUser] = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, username)));

      if (existingUser) {
        set.status = 409;
        return conflict("Email or username is already in use");
      }

      const passwordHash = await Bun.password.hash(body.password);

      const [createdUser] = await db
        .insert(users)
        .values({
          email,
          username,
          passwordHash,
          displayName: normalize(body.displayName),
        })
        .returning();

      const sessionToken = createSessionToken();
      const tokenHash = hashSessionToken(sessionToken);
      const expiresAt = getSessionExpiryDate();

      await db
        .insert(authSessions)
        .values({
          userId: createdUser.id,
          tokenHash,
          expiresAt,
        })
        .returning();

      cookie[SESSION_COOKIE_NAME].set({
        value: sessionToken,
        httpOnly: true,
        sameSite: "lax",
        secure: serverEnv.NODE_ENV === "production",
        path: "/",
        maxAge: getSessionCookieMaxAge(),
      });

      return { user: toMeDto(createdUser) };
    },
    {
      body: RegisterBody,
      response: {
        201: AuthUserResponseDto,
        409: ErrorDto,
      },
      detail: {
        tags: ["Auth"],
        summary: "Register",
        description: "Creates a new user account and starts a session.",
      },
    },
  )
  .post(
    "/login",
    async ({ body, cookie, set }) => {
      const email = normalizeToLowerCase(body.email);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        set.status = 401;
        return unauthorized("Invalid email or password");
      }

      const passwordMatches = await Bun.password.verify(
        body.password,
        user.passwordHash,
      );

      if (!passwordMatches) {
        set.status = 401;
        return unauthorized("Invalid email or password");
      }

      const sessionToken = createSessionToken();
      const tokenHash = hashSessionToken(sessionToken);
      const expiresAt = getSessionExpiryDate();

      await db.insert(authSessions).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      cookie[SESSION_COOKIE_NAME].set({
        value: sessionToken,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: getSessionCookieMaxAge(),
      });

      return {
        user: toMeDto(user),
      };
    },
    {
      body: LoginBody,
      response: {
        200: AuthUserResponseDto,
        409: ErrorDto,
      },
      detail: {
        tags: ["Auth"],
        summary: "Login",
        description: "Authenticates a user and starts a session.",
      },
    },
  )
  .post(
    "/logout",
    async ({ cookie }) => {
      const sessionToken = cookie[SESSION_COOKIE_NAME]?.value;

      if (sessionToken) {
        const tokenHash = hashSessionToken(String(sessionToken));

        await db
          .update(authSessions)
          .set({
            revokedAt: new Date(),
          })
          .where(
            and(
              eq(authSessions.tokenHash, tokenHash),
              isNull(authSessions.revokedAt),
              gt(authSessions.expiresAt, new Date()),
            ),
          );
      }

      cookie[SESSION_COOKIE_NAME].remove();

      return {
        ok: true,
      };
    },
    {
      response: {
        200: LogoutResponseDto,
      },
      detail: {
        tags: ["Auth"],
        summary: "Logout",
        description:
          "Revokes the current session and clears the session cookie.",
      },
    },
  );
