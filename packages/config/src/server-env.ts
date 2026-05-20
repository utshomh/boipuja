import { z } from "zod";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (value) =>
        value.startsWith("postgres://") || value.startsWith("postgresql://"),
      "DATABASE_URL must be a valid PostgreSQL connection string",
    ),

  API_HOST: z.string().default("localhost"),

  API_PORT: z.coerce.number().int().positive().default(3000),

  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "DATABASE_URL is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "DATABASE_URL is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "DATABASE_URL is required"),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\nInvalid Boipuja server environment variables:\n");

  const errors = parsed.error.flatten().fieldErrors;

  for (const [key, messages] of Object.entries(errors)) {
    console.error(`${key}: ${messages?.join(", ")}`);
  }

  console.error("\nCheck your root .env file.\n");

  throw new Error("Invalid server environment variables");
}

export const serverEnv = parsed.data;

export type ServerEnv = typeof serverEnv;
