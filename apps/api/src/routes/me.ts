import { Elysia } from "elysia";
import { eq } from "drizzle-orm";

import { db } from "@boipuja/db";
import { ErrorDto } from "@boipuja/contracts";
import { users } from "@boipuja/db/schema";
import { MeDto, UpdateMeBody } from "@boipuja/contracts/users";

import { toMeDto } from "../users/mappers";
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
    async ({ body, user }) => {
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
      requireAuth: true,
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
