import { describe, expect, it } from "vitest";
import {
  createPatchSchema,
  patchFilterSchema,
  updateNotificationChannelSchema,
  upsertSubscriptionSchema,
} from "@/domain/schemas/patch-radar.schema";

describe("PatchRadar Domain Zod Schemas (T-03)", () => {
  describe("createPatchSchema", () => {
    it("accepts valid patch input with buff/nerf/bugfix changes", () => {
      const parsed = createPatchSchema.safeParse({
        gameSlug: "league-of-legends",
        version: "v14.21",
        title: "14.21 패치노트 — 미드 메이지 밸런스 조정",
        category: "balance",
        tldr: ["아리 Q 계수 상향", "요네 W 보호막 하향"],
        changes: [
          {
            type: "buff",
            target: "아리",
            summary: "현혹의 구슬(Q) 주문력 계수 0.45 → 0.50 상향",
          },
          {
            type: "nerf",
            target: "요네",
            summary: "영혼 가르기(W) 기본 보호막 수치 감소",
          },
        ],
        sourceUrl: "https://www.leagueoflegends.com/ko-kr/news/game-updates/",
      });

      expect(parsed.success).toBe(true);
    });

    it("rejects invalid change type or empty tldr", () => {
      const parsed = createPatchSchema.safeParse({
        gameSlug: "valorant",
        version: "9.09",
        title: "9.09 패치",
        category: "regular",
        tldr: [],
        changes: [
          {
            type: "invalid_type",
            target: "제트",
            summary: "변경 내역",
          },
        ],
        sourceUrl: "not-a-url",
      });

      expect(parsed.success).toBe(false);
    });
  });

  describe("upsertSubscriptionSchema", () => {
    it("validates subscription with custom keywords", () => {
      const parsed = upsertSubscriptionSchema.safeParse({
        gameSlug: "valorant",
        keywords: ["제트", "오퍼레이터"],
        notifyHotfixOnly: false,
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.keywords).toEqual(["제트", "오퍼레이터"]);
      }
    });

    it("rejects invalid gameSlug format", () => {
      const parsed = upsertSubscriptionSchema.safeParse({
        gameSlug: "INVALID SLUG!",
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe("updateNotificationChannelSchema", () => {
    it("accepts valid Discord webhook URL or empty string (converted to null)", () => {
      const valid = updateNotificationChannelSchema.safeParse({
        discordWebhookUrl:
          "https://discord.com/api/webhooks/123456789/demo_token_abc",
        emailEnabled: true,
        webPushEnabled: true,
        onlyKeywordMatch: true,
      });
      expect(valid.success).toBe(true);

      const empty = updateNotificationChannelSchema.safeParse({
        discordWebhookUrl: "",
      });
      expect(empty.success).toBe(true);
      if (empty.success) {
        expect(empty.data.discordWebhookUrl).toBeNull();
      }
    });

    it("rejects non-Discord webhook URLs", () => {
      const invalid = updateNotificationChannelSchema.safeParse({
        discordWebhookUrl: "https://example.com/webhook/123",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("patchFilterSchema", () => {
    it("applies default pagination values", () => {
      const parsed = patchFilterSchema.parse({
        gameSlug: "pubg",
        changeType: "buff",
      });
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(20);
      expect(parsed.changeType).toBe("buff");
    });
  });
});
