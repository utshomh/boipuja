import { ErrorDto } from "@boipuja/contracts";
import { Elysia } from "elysia";

import { unauthorized } from "../http";
import { SESSION_COOKIE_NAME } from "./session";
import { getCurrentUserFromSessionToken } from "./current-user";

export const authPlugin = new Elysia({ name: "auth-plugin" }).macro(
  "requireAuth",
  {
    response: {
      401: ErrorDto,
    },

    async resolve({ cookie, status }) {
      const sessionToken = cookie[SESSION_COOKIE_NAME]?.value;

      const user =
        typeof sessionToken === "string"
          ? await getCurrentUserFromSessionToken(sessionToken)
          : null;

      if (!user) {
        return status(401, unauthorized());
      }

      return {
        user,
      };
    },
  },
);
