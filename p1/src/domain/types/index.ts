export type GameGenre = "MOBA" | "FPS" | "MMORPG" | "BattleRoyale";

export type PatchCategory = "regular" | "hotfix" | "balance" | "maintenance";

export type PatchChangeType = "buff" | "nerf" | "adjusted" | "bugfix" | "new";

export interface Game {
  id: string;
  slug: string;
  name: string;
  genre: GameGenre;
  iconUrl: string;
  officialUrl: string;
  currentVersion: string;
  subscriberCount: number;
  lastPatchedAt: string;
  patchCycleLabel: string;
  description: string;
  maintenanceEndTimeLabel?: string;
  patchCompletionDayOfWeek?: number;
  patchCompletionHourKst?: number;
  lastCrawledAt?: string;
}

export interface PatchChangeItem {
  type: PatchChangeType;
  target: string;
  summary: string;
  details?: string;
}

export interface Patch {
  id: string;
  gameId: string;
  gameSlug: string;
  gameName: string;
  version: string;
  title: string;
  category: PatchCategory;
  tldr: string[];
  changes: PatchChangeItem[];
  sourceUrl: string;
  maintenanceWindow?: string;
  publishedAt: string;
  isAutoCrawled?: boolean;
  crawledAt?: string;
  patchCompletedAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  gameSlug: string;
  keywords: string[];
  notifyHotfixOnly: boolean;
  createdAt: string;
}

export interface NotificationChannel {
  userId: string;
  discordWebhookUrl: string | null;
  emailEnabled: boolean;
  webPushEnabled: boolean;
  onlyKeywordMatch: boolean;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  patchId: string;
  gameSlug: string;
  gameName: string;
  version: string;
  title: string;
  message: string;
  matchedKeywords: string[];
  isRead: boolean;
  createdAt: string;
}

export interface PatchChangeCounts {
  buff: number;
  nerf: number;
  adjusted: number;
  bugfix: number;
  new: number;
}

export type CrawlStatusType =
  | "NEW_PATCH_CRAWLED"
  | "UP_TO_DATE"
  | "SKIPPED_BEFORE_COMPLETION";

export interface CrawlLogItem {
  id: string;
  gameSlug: string;
  gameName: string;
  officialUrl: string;
  maintenanceEndTimeLabel: string;
  status: CrawlStatusType;
  detectedVersion: string;
  detectedTitle: string;
  httpStatus: number;
  patchId?: string;
  dispatchedNotifications: number;
  crawledAt: string;
}
