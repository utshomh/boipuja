import { defineConfig } from "drizzle-kit";

import { serverEnv } from "@boipuja/config/server";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
