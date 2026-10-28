import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("PatchRadar"),
  USE_MOCK_DB: z.enum(["true", "false"]).default("true"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(rawEnv: Record<string, string | undefined> = process.env): AppEnv {
  const parsed = envSchema.safeParse({
    NODE_ENV: rawEnv.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: rawEnv.NEXT_PUBLIC_APP_NAME,
    USE_MOCK_DB: rawEnv.USE_MOCK_DB,
    SUPABASE_URL: rawEnv.SUPABASE_URL,
    SUPABASE_ANON_KEY: rawEnv.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: rawEnv.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  const env = parsed.data;
  if (env.USE_MOCK_DB === "false") {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new Error(
        "Invalid environment configuration: SUPABASE_URL and SUPABASE_ANON_KEY are required when USE_MOCK_DB is 'false'."
      );
    }
  }

  return env;
}

export function getEnv(): AppEnv {
  return parseEnv(process.env);
}

export function isMockDbMode(rawEnv: Record<string, string | undefined> = process.env): boolean {
  const env = parseEnv(rawEnv);
  return env.NODE_ENV === "test" || env.USE_MOCK_DB === "true";
}
