import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/crawler/sync/route";
import { patchRadarRepository } from "@/repositories/patch-radar.repository";

describe("/api/crawler/sync Integration", () => {
  beforeEach(() => {
    patchRadarRepository.resetStore();
  });

  it("GET /api/crawler/sync returns all game crawl schedules and logs", async () => {
    const req = new NextRequest("http://localhost:3000/api/crawler/sync");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.schedules).toHaveLength(6);
    expect(json.data.logs.length).toBeGreaterThanOrEqual(2);
  });

  it("POST /api/crawler/sync crawls official homepage for a game and creates patch automatically", async () => {
    const req = new NextRequest("http://localhost:3000/api/crawler/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameSlug: "valorant",
        force: true,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.newlyCrawledCount).toBe(1);
    expect(json.data.newPatches[0].version).toBe("v13.08");
    expect(json.data.newPatches[0].isAutoCrawled).toBe(true);
  });
});
