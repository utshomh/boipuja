import { z } from "zod";

const databaseEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (value) =>
        value.startsWith("postgres://") || value.startsWith("postgresql://"),
      "DATABASE_URL must be a valid PostgreSQL connection string",
    ),
});

const parsed = databaseEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\nInvalid Boipuja database environment variables:\n");

  const errors = parsed.error.flatten().fieldErrors;

  for (const [key, messages] of Object.entries(errors)) {
    console.error(`${key}: ${messages?.join(", ")}`);
  }

  throw new Error("Invalid database environment variables");
}

export const databaseEnv = parsed.data;

export type DatabaseEnv = typeof databaseEnv;
