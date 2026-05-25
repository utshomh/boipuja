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
    async ({ body, user, status }) => {
      const updates: Partial<typeof users.$inferInsert> = {
        updatedAt: new Date(),
      };

      if ("username" in body && body.username !== undefined) {
        const username = normalizeToLowerCase(body.username);

        const [existingUser] = await db
          .select()
          .from(users)
          .where(and(eq(users.username, username), ne(users.id, user.id)))
          .limit(1);

        if (existingUser) {
          return status(409, conflict("Username is already in use"));
        }

        updates.username = username;
      }

      if ("displayName" in body && body.displayName !== undefined) {
        updates.displayName = normalize(body.displayName);
      }

      if ("avatarUrl" in body) {
        updates.avatarUrl = body.avatarUrl;
      }

      if ("bio" in body) {
        updates.bio = body.bio;
      }

      const [updatedUser] = await db
        .update(users)
        .set(updates)
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
