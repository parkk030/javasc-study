import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health Integration Test (T-02)", () => {
  it("returns 200 OK with standard health payload", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("healthy");
    expect(body.data.service).toBe("PatchRadar");
    expect(body.data.mode).toBe("mock");
    expect(typeof body.data.timestamp).toBe("string");
  });
});
