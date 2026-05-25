import PG from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { databaseEnv } from "@boipuja/config/database";

const { Pool } = PG;

const connectionString = databaseEnv.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool);
