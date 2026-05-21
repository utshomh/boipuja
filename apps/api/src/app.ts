import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";

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
  .use(healthRoutes);

export type App = typeof app;
