import { defineConfig } from "drizzle-kit";

import { databaseEnv } from "@boipuja/config/database";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseEnv.DATABASE_URL,
  },
});
