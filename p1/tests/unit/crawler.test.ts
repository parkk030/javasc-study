import { beforeEach, describe, expect, it } from "vitest";
import { patchRadarRepository } from "@/repositories/patch-radar.repository";
import { crawlerService } from "@/services/crawler.service";

describe("CrawlerService (Automated Official Homepage Patch Crawler)", () => {
  beforeEach(() => {
    patchRadarRepository.resetStore();
  });

  it("returns patch completion schedules and pending update status for all 6 games", async () => {
    const schedules = await crawlerService.getSchedules();

    expect(schedules).toHaveLength(6);
    const lol = schedules.find((s) => s.gameSlug === "league-of-legends");
    expect(lol).toBeDefined();
    expect(lol?.latestAvailableVersion).toBe("v26.20");
    expect(lol?.hasPendingUpdate).toBe(true);
    expect(lol?.maintenanceEndTimeLabel).toContain("11:00 KST");
  });

  it("crawls official homepage patch notes at patch completion time and dispatches notifications", async () => {
    const result = await crawlerService.syncOfficialPatches({
      gameSlug: "league-of-legends",
    });

    expect(result.totalChecked).toBe(1);
    expect(result.newlyCrawledCount).toBe(1);
    expect(result.newPatches[0]?.version).toBe("v26.20");
    expect(result.newPatches[0]?.isAutoCrawled).toBe(true);
    expect(result.dispatchedNotificationsCount).toBeGreaterThanOrEqual(1);

    // Calling again for the same game should deduplicate (UP_TO_DATE)
    const secondRun = await crawlerService.syncOfficialPatches({
      gameSlug: "league-of-legends",
    });
    expect(secondRun.newlyCrawledCount).toBe(0);
    expect(secondRun.logs[0]?.status).toBe("UP_TO_DATE");
  });
});
