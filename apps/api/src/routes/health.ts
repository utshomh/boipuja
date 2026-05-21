import Elysia, { t } from "elysia";

export const healthRoutes = new Elysia({ prefix: "/health" }).get(
  "/",
  () => ({
    ok: true,
    service: "boipuja-api",
  }),
  {
    response: {
      200: t.Object({
        ok: t.Boolean(),
        service: t.String(),
      }),
    },
    detail: {
      tags: ["Health"],
      summary: "Health check",
      description: "Returns a simple API health status.",
    },
  },
);
