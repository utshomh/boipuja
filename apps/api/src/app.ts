import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { meRoutes } from "./routes/me";
import { authRoutes } from "./routes/auth";
import { healthRoutes } from "./routes/health";

export const app = new Elysia({ prefix: "/api/v1" })
  .use(
    cors({
      origin: true,
    }),
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "Boipuja API",
          version: "0.1.0",
          description:
            "API documentation for the Boipuja social reading platform.",
        },
        tags: [
          {
            name: "Health",
            description: "API health and diagnostics.",
          },
          {
            name: "Auth",
            description: "Authentication and session management.",
          },
          {
            name: "Users",
            description: "Current user and user profile endpoints.",
          },
        ],
      },
    }),
  )
  .get(
    "/",
    () => ({
      name: "Boipuja API",
      version: "0.1.0",
    }),
    {
      response: {
        200: t.Object({
          name: t.String(),
          version: t.String(),
        }),
      },
      detail: {
        tags: ["Health"],
        summary: "API metadata",
      },
    },
  )
  .use(healthRoutes)
  .use(authRoutes)
  .use(meRoutes);

export type App = typeof app;
