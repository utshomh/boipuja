import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing.");
}

if (!databaseUrl.includes("boipuja_test")) {
  throw new Error(
    `Refusing to reset non-test database. DATABASE_URL=${databaseUrl}`,
  );
}

const client = new Client({
  connectionString: databaseUrl,
});

await client.connect();

try {
  await client.query(`
    DROP SCHEMA IF EXISTS public CASCADE;
    DROP SCHEMA IF EXISTS drizzle CASCADE;

    CREATE SCHEMA public;

    GRANT ALL ON SCHEMA public TO public;
  `);

  console.log("Test database reset.");
} finally {
  await client.end();
}
