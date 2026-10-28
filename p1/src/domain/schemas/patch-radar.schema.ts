import { z } from "zod";

export const gameGenreSchema = z.enum([
  "MOBA",
  "FPS",
  "MMORPG",
  "BattleRoyale",
]);

export const patchCategorySchema = z.enum([
  "regular",
  "hotfix",
  "balance",
  "maintenance",
]);

export const patchChangeTypeSchema = z.enum([
  "buff",
  "nerf",
  "adjusted",
  "bugfix",
  "new",
]);

export const patchChangeItemSchema = z.object({
  type: patchChangeTypeSchema,
  target: z
    .string()
    .trim()
    .min(1, "변경 대상(챔피언/무기/시스템명)을 입력해주세요.")
    .max(80, "변경 대상 이름은 80자 이하여야 합니다."),
  summary: z
    .string()
    .trim()
    .min(2, "변경 요약을 2자 이상 입력해주세요.")
    .max(300, "변경 요약은 300자 이하여야 합니다."),
  details: z
    .string()
    .trim()
    .max(1000, "상세 설명은 1000자 이하여야 합니다.")
    .optional(),
});

export const createPatchSchema = z.object({
  gameSlug: z
    .string()
    .trim()
    .min(2, "대상 게임 슬러그를 선택해주세요.")
    .regex(/^[a-z0-9-]+$/, "유효한 게임 슬러그 형식이 아닙니다."),
  version: z
    .string()
    .trim()
    .min(1, "패치 버전을 입력해주세요. (예: v14.20)")
    .max(30, "버전명은 30자 이하여야 합니다."),
  title: z
    .string()
    .trim()
    .min(2, "패치노트 제목은 2자 이상이어야 합니다.")
    .max(120, "패치노트 제목은 120자 이하여야 합니다."),
  category: patchCategorySchema,
  tldr: z
    .array(
      z
        .string()
        .trim()
        .min(2, "핵심 요약 항목은 2자 이상이어야 합니다.")
        .max(200, "핵심 요약 항목은 200자 이하여야 합니다.")
    )
    .min(1, "최소 1개 이상의 핵심 요약(TL;DR)을 입력해주세요.")
    .max(5, "핵심 요약(TL;DR)은 최대 5줄까지 입력할 수 있습니다."),
  changes: z
    .array(patchChangeItemSchema)
    .min(1, "최소 1개 이상의 패치 변경 내역을 입력해주세요."),
  sourceUrl: z.string().url("유효한 공식 패치노트 원문 URL을 입력해주세요."),
  maintenanceWindow: z.string().trim().max(100).optional(),
  isAutoCrawled: z.boolean().optional(),
  crawledAt: z.string().optional(),
  patchCompletedAt: z.string().optional(),
});

export const patchFilterSchema = z.object({
  gameSlug: z.string().trim().optional(),
  category: patchCategorySchema.optional(),
  changeType: patchChangeTypeSchema.optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const gameFilterSchema = z.object({
  genre: gameGenreSchema.optional(),
  q: z.string().trim().optional(),
});

export const upsertSubscriptionSchema = z.object({
  gameSlug: z
    .string()
    .trim()
    .min(2, "구독할 게임을 선택해주세요.")
    .regex(/^[a-z0-9-]+$/, "유효한 게임 슬러그 형식이 아닙니다."),
  keywords: z
    .array(
      z
        .string()
        .trim()
        .min(1, "키워드는 최소 1자 이상이어야 합니다.")
        .max(30, "키워드는 30자 이하여야 합니다.")
    )
    .max(15, "관심 키워드는 게임당 최대 15개까지 등록할 수 있습니다.")
    .default([]),
  notifyHotfixOnly: z.boolean().default(false),
});

const discordWebhookRegex =
  /^https:\/\/(ptb\.|canary\.)?discord(app)?\.com\/api\/webhooks\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/;

export const updateNotificationChannelSchema = z.object({
  discordWebhookUrl: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || discordWebhookRegex.test(val),
      "유효한 Discord Webhook URL 형식이 아닙니다. (예: https://discord.com/api/webhooks/...)"
    )
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  emailEnabled: z.boolean().default(true),
  webPushEnabled: z.boolean().default(true),
  onlyKeywordMatch: z.boolean().default(false),
});

export const markNotificationsReadSchema = z.object({
  notificationId: z.string().trim().optional(),
  markAll: z.boolean().default(false),
});

export const testNotificationSchema = z.object({
  gameSlug: z.string().trim().default("league-of-legends"),
  discordWebhookUrl: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || discordWebhookRegex.test(val),
      "유효한 Discord Webhook URL을 입력해주세요."
    )
    .optional(),
});

export const triggerCrawlSchema = z.object({
  gameSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "유효한 게임 슬러그 형식이 아닙니다.")
    .optional(),
  force: z.boolean().default(false),
});

export type CreatePatchInput = z.infer<typeof createPatchSchema>;
export type PatchFilterInput = z.infer<typeof patchFilterSchema>;
export type GameFilterInput = z.infer<typeof gameFilterSchema>;
export type UpsertSubscriptionInput = z.infer<typeof upsertSubscriptionSchema>;
export type UpdateNotificationChannelInput = z.infer<
  typeof updateNotificationChannelSchema
>;
export type MarkNotificationsReadInput = z.infer<
  typeof markNotificationsReadSchema
>;
export type TestNotificationInput = z.infer<typeof testNotificationSchema>;
export type TriggerCrawlInput = z.infer<typeof triggerCrawlSchema>;
