import { beforeEach, describe, expect, it } from "vitest";
import { patchRadarRepository } from "@/repositories/patch-radar.repository";
import { gameService } from "@/services/game.service";
import { notificationService } from "@/services/notification.service";
import { patchService } from "@/services/patch.service";
import { subscriptionService } from "@/services/subscription.service";

describe("Domain Services Unit Tests (T-05)", () => {
  beforeEach(() => {
    patchRadarRepository.resetStore();
  });

  it("computes buff/nerf/bugfix change counts accurately in getPatchDetail()", async () => {
    const detail = await patchService.getPatchDetail("patch-lol-2619");
    expect(detail.patch.version).toBe("v26.19");
    expect(detail.changeCounts).toEqual({
      buff: 2,
      nerf: 2,
      adjusted: 0,
      bugfix: 1,
      new: 0,
    });
  });

  it("matches subscriber keywords and dispatches notifications when a new patch is registered", async () => {
    // Default user-gamer-1 subscribes to league-of-legends with keywords ["암베사", "크산테", "아리", "요네"]
    const result = await patchService.createPatchAndDispatch({
      gameSlug: "league-of-legends",
      version: "v26.20",
      title: "14.21 패치노트 — 아리 궁극기 쿨타임 상향",
      category: "balance",
      tldr: ["아리 혼령 질주(R) 재사용 대기시간 감소"],
      changes: [
        {
          type: "buff",
          target: "아리",
          summary: "혼령 질주(R) 쿨타임 130초 → 115초 감소",
        },
      ],
      sourceUrl: "https://www.leagueoflegends.com/ko-kr/news/game-updates/",
    });

    expect(result.dispatch.dispatchedCount).toBe(1);
    expect(result.dispatch.webhookTriggeredCount).toBe(1);
    expect(result.dispatch.notifications[0]?.matchedKeywords).toEqual(["아리"]);
  });

  it("respects notifyHotfixOnly filter when dispatching non-hotfix patches", async () => {
    await subscriptionService.subscribeOrUpdate("user-hotfix-fan", {
      gameSlug: "pubg",
      keywords: [],
      notifyHotfixOnly: true,
    });

    // Regular patch should not trigger notification for hotfix-only subscriber
    const regularResult = await patchService.createPatchAndDispatch({
      gameSlug: "pubg",
      version: "v32.2",
      title: "32.2 정기 패치",
      category: "regular",
      tldr: ["정기 무기 밸런스 조정"],
      changes: [{ type: "buff", target: "M416", summary: "재장전 속도 5% 향상" }],
      sourceUrl: "https://pubg.com/ko/news",
    });
    expect(regularResult.dispatch.dispatchedCount).toBe(0);

    // Hotfix patch SHOULD trigger notification
    const hotfixResult = await patchService.createPatchAndDispatch({
      gameSlug: "pubg",
      version: "v32.2-hotfix",
      title: "32.2 긴급 서버 크래시 핫픽스",
      category: "hotfix",
      tldr: ["사녹 맵 차량 탑승 시 크래시 현상 수정"],
      changes: [{ type: "bugfix", target: "차량", summary: "클라이언트 강제 종료 수정" }],
      sourceUrl: "https://pubg.com/ko/news",
    });
    expect(hotfixResult.dispatch.dispatchedCount).toBe(1);
  });

  it("sends test notification and simulates Discord webhook delivery", async () => {
    const testResult = await notificationService.sendTestNotification(
      "user-gamer-1",
      {
        gameSlug: "valorant",
        discordWebhookUrl:
          "https://discord.com/api/webhooks/1234567890/demo_token",
      }
    );

    expect(testResult.notification.gameSlug).toBe("valorant");
    expect(testResult.webhookResult?.delivered).toBe(true);
    expect(testResult.webhookResult?.mode).toBe("simulated");

    const userNotifs = await notificationService.listUserNotifications(
      "user-gamer-1"
    );
    expect(userNotifs.unreadCount).toBeGreaterThanOrEqual(3);
  });

  it("fetches game hub details with associated patches", async () => {
    const hub = await gameService.getGameHubDetail("valorant");
    expect(hub.game.name).toBe("발로란트");
    expect(hub.patches.length).toBeGreaterThanOrEqual(1);
  });
});
