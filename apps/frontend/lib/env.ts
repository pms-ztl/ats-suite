import { z } from "zod";

const envSchema = z.object({
  // Primary API base URL used by api-client.ts and register page
  NEXT_PUBLIC_API_URL: z.string().default("/api"),
  // Legacy alias, kept for forward-compatibility with the template convention
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000"),
  // Feature flag: when "true" the app uses local mock data instead of real API calls
  NEXT_PUBLIC_USE_MOCKS: z.enum(["true", "false"]).default("false"),
  // Optional tenant identifier for multi-tenant deployments
  NEXT_PUBLIC_TENANT_ID: z.string().optional(),
  // Human-readable application name shown in the UI
  NEXT_PUBLIC_APP_NAME: z.string().default("ATS Platform"),
  // Public-facing URL of this Next.js application
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
    NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = validateEnv();
