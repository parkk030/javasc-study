import { getEnv, isMockDbMode } from "@/lib/env";
import { ok, withErrorHandler } from "@/lib/response";

export interface HealthData {
  status: "healthy";
  service: string;
  mode: "mock" | "cloud";
  timestamp: string;
}

export const GET = withErrorHandler(async () => {
  const env = getEnv();
  const payload: HealthData = {
    status: "healthy",
    service: env.NEXT_PUBLIC_APP_NAME,
    mode: isMockDbMode() ? "mock" : "cloud",
    timestamp: new Date().toISOString(),
  };

  return ok(payload);
});
