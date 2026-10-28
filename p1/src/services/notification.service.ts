import type {
  NotificationChannel,
  NotificationItem,
  Patch,
} from "@/domain/types";
import type {
  MarkNotificationsReadInput,
  TestNotificationInput,
  UpdateNotificationChannelInput,
} from "@/domain/schemas/patch-radar.schema";
import { Errors } from "@/lib/errors";
import {
  patchRadarRepository,
  type PatchRadarRepository,
} from "@/repositories/patch-radar.repository";

export interface DispatchSummary {
  dispatchedCount: number;
  webhookTriggeredCount: number;
  notifications: NotificationItem[];
}

export interface WebhookDeliveryResult {
  delivered: boolean;
  mode: "simulated" | "live";
  webhookUrl: string;
  message: string;
}

export class NotificationService {
  constructor(
    private readonly repo: PatchRadarRepository = patchRadarRepository
  ) {}

  /**
   * Matches subscriber's custom keywords against patch title, TL;DR lines, and change items.
   */
  public matchKeywords(patch: Patch, keywords: string[]): string[] {
    if (keywords.length === 0) {
      return [];
    }

    const corpus = [
      patch.title,
      ...patch.tldr,
      ...patch.changes.flatMap((c) => [c.target, c.summary, c.details ?? ""]),
    ]
      .join(" ")
      .toLowerCase();

    return keywords.filter((kw) => {
      const normalized = kw.trim().toLowerCase();
      return normalized.length > 0 && corpus.includes(normalized);
    });
  }

  /**
   * Sends Discord webhook payload with a strict 5-second timeout (Guardrail-03).
   * Uses safe simulation for demo/test URLs so local harness tests never depend on external internet.
   */
  public async deliverDiscordWebhook(
    webhookUrl: string,
    payload: { title: string; description: string; url?: string }
  ): Promise<WebhookDeliveryResult> {
    const isSimulated =
      process.env.NODE_ENV === "test" ||
      webhookUrl.includes("/demo") ||
      webhookUrl.includes("/123456789");

    if (isSimulated) {
      return {
        delivered: true,
        mode: "simulated",
        webhookUrl,
        message: `[Simulated Discord Webhook] ${payload.title}`,
      };
    }

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "PatchRadar Bot",
          embeds: [
            {
              title: payload.title,
              description: payload.description,
              url: payload.url,
              color: 0x6366f1,
            },
          ],
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw Errors.webhook(
          `Discord 웹훅 응답 오류 (HTTP ${res.status})`
        );
      }

      return {
        delivered: true,
        mode: "live",
        webhookUrl,
        message: "Discord 웹훅 채널로 알림이 전송되었습니다.",
      };
    } catch (err) {
      if (err instanceof Error && err.name === "AppError") {
        throw err;
      }
      throw Errors.webhook(
        "Discord 웹훅 전송 중 네트워크 또는 타임아웃 오류가 발생했습니다."
      );
    }
  }

  public async dispatchPatchNotifications(
    patch: Patch
  ): Promise<DispatchSummary> {
    const subscribers = await this.repo.listSubscribersByGame(patch.gameSlug);
    const createdNotifications: NotificationItem[] = [];
    let webhookTriggeredCount = 0;

    for (const sub of subscribers) {
      if (sub.notifyHotfixOnly && patch.category !== "hotfix") {
        continue;
      }

      const channel = await this.repo.getNotificationChannel(sub.userId);
      const matchedKeywords = this.matchKeywords(patch, sub.keywords);

      if (
        channel.onlyKeywordMatch &&
        sub.keywords.length > 0 &&
        matchedKeywords.length === 0
      ) {
        continue;
      }

      const keywordNote =
        matchedKeywords.length > 0
          ? `관심 키워드 [${matchedKeywords.join(", ")}] 변경 내역 포함 — `
          : "";

      const notif = await this.repo.createNotification({
        userId: sub.userId,
        patchId: patch.id,
        gameSlug: patch.gameSlug,
        gameName: patch.gameName,
        version: patch.version,
        title: `[${patch.gameName}] ${patch.version} 패치노트 등록`,
        message: `${keywordNote}${patch.tldr[0] ?? patch.title}`,
        matchedKeywords,
        isRead: false,
      });

      createdNotifications.push(notif);

      if (channel.discordWebhookUrl) {
        await this.deliverDiscordWebhook(channel.discordWebhookUrl, {
          title: notif.title,
          description: notif.message,
          url: patch.sourceUrl,
        });
        webhookTriggeredCount += 1;
      }
    }

    return {
      dispatchedCount: createdNotifications.length,
      webhookTriggeredCount,
      notifications: createdNotifications,
    };
  }

  public async listUserNotifications(userId: string): Promise<{
    items: NotificationItem[];
    unreadCount: number;
  }> {
    const items = await this.repo.listNotificationsByUser(userId);
    const unreadCount = items.filter((n) => !n.isRead).length;
    return { items, unreadCount };
  }

  public async markNotificationsRead(
    userId: string,
    input: MarkNotificationsReadInput
  ): Promise<{ updatedCount: number }> {
    const updatedCount = await this.repo.markNotificationsRead(userId, {
      notificationId: input.notificationId,
      markAll: input.markAll,
    });
    return { updatedCount };
  }

  public async getChannel(userId: string): Promise<NotificationChannel> {
    return this.repo.getNotificationChannel(userId);
  }

  public async updateChannel(
    userId: string,
    input: UpdateNotificationChannelInput
  ): Promise<NotificationChannel> {
    return this.repo.updateNotificationChannel(userId, input);
  }

  public async sendTestNotification(
    userId: string,
    input: TestNotificationInput
  ): Promise<{
    notification: NotificationItem;
    webhookResult: WebhookDeliveryResult | null;
  }> {
    const game =
      (await this.repo.getGameBySlug(input.gameSlug)) ??
      (await this.repo.getGameBySlug("league-of-legends"));

    const channel = await this.repo.getNotificationChannel(userId);
    const targetWebhookUrl =
      input.discordWebhookUrl && input.discordWebhookUrl.length > 0
        ? input.discordWebhookUrl
        : channel.discordWebhookUrl;

    const gameName = game?.name ?? "리그 오브 레전드";
    const gameSlug = game?.slug ?? "league-of-legends";
    const version = game?.currentVersion ?? "v14.20";

    const notification = await this.repo.createNotification({
      userId,
      patchId: "patch-lol-1420",
      gameSlug,
      gameName,
      version,
      title: `⚡ [테스트 알림] ${gameName} (${version})`,
      message:
        "PatchRadar 알림 채널(인앱 & Discord 웹훅) 연동이 정상적으로 작동하고 있습니다!",
      matchedKeywords: ["테스트"],
      isRead: false,
    });

    let webhookResult: WebhookDeliveryResult | null = null;
    if (targetWebhookUrl) {
      webhookResult = await this.deliverDiscordWebhook(targetWebhookUrl, {
        title: notification.title,
        description: notification.message,
      });
    }

    return { notification, webhookResult };
  }
}

export const notificationService = new NotificationService();
