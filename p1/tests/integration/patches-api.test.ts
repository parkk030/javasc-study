import { beforeEach, describe, expect, it } from "vitest";
import { GET as getGames } from "@/app/api/games/route";
import { GET as getGameBySlug } from "@/app/api/games/[slug]/route";
import { GET as getPatches, POST as createPatch } from "@/app/api/patches/route";
import { GET as getPatchById } from "@/app/api/patches/[id]/route";
import { patchRadarRepository } from "@/repositories/patch-radar.repository";

describe("Games & Patches Serverless API Integration Tests (T-06)", () => {
  beforeEach(() => {
    patchRadarRepository.resetStore();
  });

  it("GET /api/games returns games filtered by genre", async () => {
    const req = new Request("http://localhost/api/games?genre=MMORPG");
    const res = await getGames(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.meta.total).toBe(2);
  });

  it("GET /api/games/[slug] returns game hub detail or 404 when not found", async () => {
    const okRes = await getGameBySlug(
      new Request("http://localhost/api/games/league-of-legends"),
      { params: Promise.resolve({ slug: "league-of-legends" }) }
    );
    expect(okRes.status).toBe(200);
    const okBody = await okRes.json();
    expect(okBody.data.game.name).toBe("리그 오브 레전드");
    expect(okBody.data.patches.length).toBeGreaterThanOrEqual(1);

    const notFoundRes = await getGameBySlug(
      new Request("http://localhost/api/games/unknown-game"),
      { params: Promise.resolve({ slug: "unknown-game" }) }
    );
    expect(notFoundRes.status).toBe(404);
  });

  it("GET /api/patches filters by gameSlug and changeType and returns changeCounts", async () => {
    const req = new Request(
      "http://localhost/api/patches?gameSlug=valorant&changeType=nerf"
    );
    const res = await getPatches(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].version).toBe("v13.06");
    expect(body.data[0].changeCounts.nerf).toBe(1);
  });

  it("GET /api/patches/[id] returns 200 for valid ID and 404 for unknown ID", async () => {
    const res = await getPatchById(
      new Request("http://localhost/api/patches/patch-lol-2619"),
      { params: Promise.resolve({ id: "patch-lol-2619" }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.patch.title).toContain("26.19");
    expect(body.data.changeCounts.buff).toBe(2);

    const missing = await getPatchById(
      new Request("http://localhost/api/patches/non-existent"),
      { params: Promise.resolve({ id: "non-existent" }) }
    );
    expect(missing.status).toBe(404);
  });

  it("POST /api/patches creates a new patch (201) and dispatches notifications", async () => {
    const req = new Request("http://localhost/api/patches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user-admin-1",
      },
      body: JSON.stringify({
        gameSlug: "valorant",
        version: "v13.08",
        title: "13.08 패치노트 — 제트 순풍 버프",
        category: "balance",
        tldr: ["제트 순풍 지속시간 롤백 상향"],
        changes: [
          {
            type: "buff",
            target: "제트",
            summary: "순풍 지속시간 8.0초 → 10.0초 상향",
          },
        ],
        sourceUrl: "https://playvalorant.com/ko-kr/news/",
      }),
    });

    const res = await createPatch(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.patch.version).toBe("v13.08");
    expect(body.data.dispatch.dispatchedCount).toBe(1);
    expect(body.data.dispatch.notifications[0].matchedKeywords).toEqual(["제트"]);
  });
});
