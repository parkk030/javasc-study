import { beforeEach, describe, expect, it } from "vitest";
import {
  DELETE as deleteSub,
  GET as getSubs,
  POST as upsertSub,
} from "@/app/api/subscriptions/route";
import {
  GET as getNotifications,
  PATCH as markRead,
} from "@/app/api/notifications/route";
import {
  GET as getChannels,
  PUT as putChannels,
} from "@/app/api/notifications/channels/route";
import { POST as sendTestNotif } from "@/app/api/notifications/test/route";
import { POST as createPatch } from "@/app/api/patches/route";
import { patchRadarRepository } from "@/repositories/patch-radar.repository";

describe("Subscriptions & Notifications Serverless API E2E Flow (T-07)", () => {
  beforeEach(() => {
    patchRadarRepository.resetStore();
  });

  it("handles full E2E flow: subscribe -> configure Discord webhook -> publish patch -> receive & read notification", async () => {
    const userId = "user-e2e-tester";

    // 1. Subscribe to Overwatch 2 with keyword "아나"
    const subRes = await upsertSub(
      new Request("http://localhost/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          gameSlug: "overwatch-2",
          keywords: ["아나", "라인하르트"],
          notifyHotfixOnly: false,
        }),
      })
    );
    expect(subRes.status).toBe(201);

    // 2. Verify subscription list
    const listSubRes = await getSubs(
      new Request("http://localhost/api/subscriptions", {
        headers: { "x-user-id": userId },
      })
    );
    const listSubBody = await listSubRes.json();
    expect(listSubBody.data).toHaveLength(1);
    expect(listSubBody.data[0].gameSlug).toBe("overwatch-2");

    // 3. Configure Discord Webhook channel
    const channelRes = await putChannels(
      new Request("http://localhost/api/notifications/channels", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          discordWebhookUrl:
            "https://discord.com/api/webhooks/123456789/demo_e2e_token",
          emailEnabled: true,
          webPushEnabled: true,
          onlyKeywordMatch: true,
        }),
      })
    );
    expect(channelRes.status).toBe(200);

    const getChannelRes = await getChannels(
      new Request("http://localhost/api/notifications/channels", {
        headers: { "x-user-id": userId },
      })
    );
    const getChannelBody = await getChannelRes.json();
    expect(getChannelBody.data.onlyKeywordMatch).toBe(true);

    // 4. Publish new Overwatch 2 patch containing "아나"
    const patchRes = await createPatch(
      new Request("http://localhost/api/patches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-admin-1",
        },
        body: JSON.stringify({
          gameSlug: "overwatch-2",
          version: "시즌 13.2",
          title: "시즌 13.2 핫픽스 — 아나 수면총 판정 개선",
          category: "hotfix",
          tldr: ["아나 수면총(Shift) 투사체 판정 개선"],
          changes: [
            {
              type: "buff",
              target: "아나",
              summary: "수면총 투사체 속도 10% 증가",
            },
          ],
          sourceUrl: "https://overwatch.blizzard.com/ko-kr/news/patch-notes/",
        }),
      })
    );
    expect(patchRes.status).toBe(201);

    // 5. Check user's notification inbox
    const notifRes = await getNotifications(
      new Request("http://localhost/api/notifications", {
        headers: { "x-user-id": userId },
      })
    );
    const notifBody = await notifRes.json();
    expect(notifBody.meta.unreadCount).toBe(1);
    expect(notifBody.data[0].matchedKeywords).toEqual(["아나"]);

    // 6. Mark all notifications as read
    const markRes = await markRead(
      new Request("http://localhost/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ markAll: true }),
      })
    );
    expect(markRes.status).toBe(200);

    const afterReadRes = await getNotifications(
      new Request("http://localhost/api/notifications", {
        headers: { "x-user-id": userId },
      })
    );
    const afterReadBody = await afterReadRes.json();
    expect(afterReadBody.meta.unreadCount).toBe(0);

    // 7. Send instant test notification
    const testNotifRes = await sendTestNotif(
      new Request("http://localhost/api/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ gameSlug: "overwatch-2" }),
      })
    );
    expect(testNotifRes.status).toBe(200);
    const testNotifBody = await testNotifRes.json();
    expect(testNotifBody.data.webhookResult.delivered).toBe(true);

    // 8. Unsubscribe from Overwatch 2
    const unsubRes = await deleteSub(
      new Request(
        "http://localhost/api/subscriptions?gameSlug=overwatch-2",
        {
          method: "DELETE",
          headers: { "x-user-id": userId },
        }
      )
    );
    expect(unsubRes.status).toBe(200);
  });
});
