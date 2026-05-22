import { Elysia } from "elysia";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@boipuja/db";
import { users } from "@boipuja/db/schema";
import { ErrorDto, MeDto, UpdateMeBody } from "@boipuja/contracts";

import { conflict } from "../http";
import { toMeDto } from "../mappers/users";
import { authPlugin } from "../auth/plugin";
import { normalize, normalizeToLowerCase } from "../utils/normalizers";

export const meRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/me",
    async ({ user }) => {
      return toMeDto(user);
    },
    {
      requireAuth: true,
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
    async ({ body, user, set }) => {
      const username = body.username
        ? normalizeToLowerCase(body.username)
        : user.username;
      const displayName = body.displayName
        ? normalize(body.displayName)
        : undefined;

      const [existingUser] = await db
        .select()
        .from(users)
        .where(and(eq(users.username, username), ne(users.id, user.id)));

      if (existingUser) {
        set.status = 409;
        return conflict("Username is already in use");
      }

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
      requireAuth: true,
      body: UpdateMeBody,
      response: {
        200: MeDto,
        401: ErrorDto,
        409: ErrorDto,
      },
      detail: {
        tags: ["Users"],
        summary: "Update current user",
      },
    },
  );
