import { Elysia } from "elysia";
import { eq } from "drizzle-orm";

import { db } from "@boipuja/db";
import { ErrorDto } from "@boipuja/contracts";
import { users } from "@boipuja/db/schema";
import { MeDto, UpdateMeBody } from "@boipuja/contracts/users";

import { unauthorized } from "../http";
import { toMeDto } from "../users/mappers";
import { normalize, normalizeToLowerCase } from "../utils/normalizers";
import { getCurrentUserFromCookie, SESSION_COOKIE_NAME } from "../auth/session";

export const meRoutes = new Elysia()
  .get(
    "/me",
    async ({ cookie, set }) => {
      const sessionToken = cookie[SESSION_COOKIE_NAME]?.value;
      const user = await getCurrentUserFromCookie(
        sessionToken ? String(sessionToken) : undefined,
      );

      if (!user) {
        set.status = 401;
        return unauthorized("You must be logged in.");
      }

      return toMeDto(user);
    },
    {
      response: {
        200: MeDto,
        401: ErrorDto,
      },
      detail: {
        tags: ["Users"],
        summary: "Get current user",
      },
    },
  )
  .patch(
    "/me",
    async ({ body, cookie, set }) => {
      const sessionToken = cookie[SESSION_COOKIE_NAME]?.value;
      const user = await getCurrentUserFromCookie(
        sessionToken ? String(sessionToken) : undefined,
      );

      if (!user) {
        set.status = 401;
        return unauthorized("You must be logged in.");
      }

      const username = body.username
        ? normalizeToLowerCase(body.username)
        : user.username;
      const displayName = body.displayName
        ? normalize(body.displayName)
        : undefined;

      const [updatedUser] = await db
        .update(users)
        .set({
          username,
          displayName,
          avatarUrl: body.avatarUrl,
          bio: body.bio,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      return toMeDto(updatedUser);
    },
    {
      body: UpdateMeBody,
      response: {
        200: MeDto,
        401: ErrorDto,
      },
      detail: {
        tags: ["Users"],
        summary: "Update current user",
      },
    },
  );
