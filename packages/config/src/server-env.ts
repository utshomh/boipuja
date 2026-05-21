import { z } from "zod";

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

  API_HOST: z.string().min(1, "API_HOST is required"),

  API_PORT: z.coerce.number().int().positive(),

  CORS_ORIGIN: z.string().url(),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),

  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),

  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\nInvalid Boipuja server environment variables:\n");

  const errors = parsed.error.flatten().fieldErrors;

  for (const [key, messages] of Object.entries(errors)) {
    console.error(`${key}: ${messages?.join(", ")}`);
  }

  throw new Error("Invalid server environment variables");
}

export const serverEnv = parsed.data;

export type ServerEnv = typeof serverEnv;
