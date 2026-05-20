import PG from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { serverEnv } from "@boipuja/config/server";

const { Pool } = PG;

const connectionString = serverEnv.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool);
