import type {
  CrawlLogItem,
  Game,
  NotificationChannel,
  NotificationItem,
  Patch,
  Subscription,
} from "@/domain/types";
import type {
  CreatePatchInput,
  GameFilterInput,
  PatchFilterInput,
  UpdateNotificationChannelInput,
  UpsertSubscriptionInput,
} from "@/domain/schemas/patch-radar.schema";
import {
  SEED_CRAWL_LOGS,
  SEED_GAMES,
  SEED_NOTIFICATION_CHANNELS,
  SEED_NOTIFICATIONS,
  SEED_PATCHES,
  SEED_SUBSCRIPTIONS,
} from "./seed-data";

export interface PatchListResult {
  items: Patch[];
  total: number;
  page: number;
  limit: number;
}

export interface PatchRadarRepository {
  listGames(filter?: GameFilterInput): Promise<Game[]>;
  getGameBySlug(slug: string): Promise<Game | null>;
  listPatches(filter?: PatchFilterInput): Promise<PatchListResult>;
  getPatchById(id: string): Promise<Patch | null>;
  createPatch(input: CreatePatchInput): Promise<Patch>;
  listSubscriptionsByUser(userId: string): Promise<Subscription[]>;
  listSubscribersByGame(gameSlug: string): Promise<Subscription[]>;
  upsertSubscription(
    userId: string,
    input: UpsertSubscriptionInput
  ): Promise<Subscription>;
  deleteSubscription(userId: string, gameSlug: string): Promise<boolean>;
  getNotificationChannel(userId: string): Promise<NotificationChannel>;
  updateNotificationChannel(
    userId: string,
    input: UpdateNotificationChannelInput
  ): Promise<NotificationChannel>;
  listNotificationsByUser(userId: string): Promise<NotificationItem[]>;
  createNotification(
    item: Omit<NotificationItem, "id" | "createdAt">
  ): Promise<NotificationItem>;
  markNotificationsRead(
    userId: string,
    options: { notificationId?: string; markAll?: boolean }
  ): Promise<number>;
  listCrawlLogs(limit?: number): Promise<CrawlLogItem[]>;
  addCrawlLog(
    item: Omit<CrawlLogItem, "id" | "crawledAt">
  ): Promise<CrawlLogItem>;
  updateGameCrawlMeta(slug: string, lastCrawledAt: string): Promise<void>;
  resetStore(): void;
}

const CURRENT_STORE_VERSION = "2026-10-16-live-v5";

interface InternalStore {
  storeVersion: string;
  games: Game[];
  patches: Patch[];
  subscriptions: Subscription[];
  channels: NotificationChannel[];
  notifications: NotificationItem[];
  crawlLogs: CrawlLogItem[];
}

declare global {
  var __patchRadarStore: InternalStore | undefined;
}

function createInitialStore(): InternalStore {
  return {
    storeVersion: CURRENT_STORE_VERSION,
    games: structuredClone(SEED_GAMES),
    patches: structuredClone(SEED_PATCHES),
    subscriptions: structuredClone(SEED_SUBSCRIPTIONS),
    channels: structuredClone(SEED_NOTIFICATION_CHANNELS),
    notifications: structuredClone(SEED_NOTIFICATIONS),
    crawlLogs: structuredClone(SEED_CRAWL_LOGS),
  };
}

function getStore(): InternalStore {
  if (
    !globalThis.__patchRadarStore ||
    globalThis.__patchRadarStore.storeVersion !== CURRENT_STORE_VERSION
  ) {
    globalThis.__patchRadarStore = createInitialStore();
  }
  return globalThis.__patchRadarStore;
}

export class InMemoryPatchRadarRepository implements PatchRadarRepository {
  public resetStore(): void {
    globalThis.__patchRadarStore = createInitialStore();
  }

  public async listGames(filter?: GameFilterInput): Promise<Game[]> {
    const store = getStore();
    let result = [...store.games];

    if (filter?.genre) {
      result = result.filter((g) => g.genre === filter.genre);
    }

    if (filter?.q) {
      const qLower = filter.q.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(qLower) ||
          g.slug.toLowerCase().includes(qLower) ||
          g.description.toLowerCase().includes(qLower)
      );
    }

    return result;
  }

  public async getGameBySlug(slug: string): Promise<Game | null> {
    const store = getStore();
    return store.games.find((g) => g.slug === slug) ?? null;
  }

  public async listPatches(filter?: PatchFilterInput): Promise<PatchListResult> {
    const store = getStore();
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;

    let filtered = [...store.patches].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    if (filter?.gameSlug) {
      filtered = filtered.filter((p) => p.gameSlug === filter.gameSlug);
    }

    if (filter?.category) {
      filtered = filtered.filter((p) => p.category === filter.category);
    }

    if (filter?.changeType) {
      filtered = filtered.filter((p) =>
        p.changes.some((c) => c.type === filter.changeType)
      );
    }

    if (filter?.q) {
      const qLower = filter.q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(qLower) ||
          p.version.toLowerCase().includes(qLower) ||
          p.gameName.toLowerCase().includes(qLower) ||
          p.tldr.some((line) => line.toLowerCase().includes(qLower)) ||
          p.changes.some(
            (c) =>
              c.target.toLowerCase().includes(qLower) ||
              c.summary.toLowerCase().includes(qLower)
          )
      );
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const items = filtered.slice(offset, offset + limit);

    return { items, total, page, limit };
  }

  public async getPatchById(id: string): Promise<Patch | null> {
    const store = getStore();
    return store.patches.find((p) => p.id === id) ?? null;
  }

  public async createPatch(input: CreatePatchInput): Promise<Patch> {
    const store = getStore();
    const game = store.games.find((g) => g.slug === input.gameSlug);
    const now = new Date().toISOString();

    const newPatch: Patch = {
      id: `patch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      gameId: game?.id ?? `game-${input.gameSlug}`,
      gameSlug: input.gameSlug,
      gameName: game?.name ?? input.gameSlug,
      version: input.version,
      title: input.title,
      category: input.category,
      tldr: input.tldr,
      changes: input.changes,
      sourceUrl: input.sourceUrl,
      maintenanceWindow: input.maintenanceWindow,
      publishedAt: now,
      isAutoCrawled: input.isAutoCrawled ?? true,
      crawledAt: input.crawledAt ?? now,
      patchCompletedAt: input.patchCompletedAt ?? now,
    };

    store.patches.unshift(newPatch);

    if (game) {
      game.currentVersion = input.version;
      game.lastPatchedAt = now;
      game.lastCrawledAt = now;
    }

    return newPatch;
  }

  public async listSubscriptionsByUser(userId: string): Promise<Subscription[]> {
    const store = getStore();
    return store.subscriptions.filter((s) => s.userId === userId);
  }

  public async listSubscribersByGame(gameSlug: string): Promise<Subscription[]> {
    const store = getStore();
    return store.subscriptions.filter((s) => s.gameSlug === gameSlug);
  }

  public async upsertSubscription(
    userId: string,
    input: UpsertSubscriptionInput
  ): Promise<Subscription> {
    const store = getStore();
    const existing = store.subscriptions.find(
      (s) => s.userId === userId && s.gameSlug === input.gameSlug
    );

    if (existing) {
      existing.keywords = Array.from(new Set(input.keywords));
      existing.notifyHotfixOnly = input.notifyHotfixOnly;
      return existing;
    }

    const created: Subscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      gameSlug: input.gameSlug,
      keywords: Array.from(new Set(input.keywords)),
      notifyHotfixOnly: input.notifyHotfixOnly,
      createdAt: new Date().toISOString(),
    };

    store.subscriptions.push(created);

    const game = store.games.find((g) => g.slug === input.gameSlug);
    if (game) {
      game.subscriberCount += 1;
    }

    return created;
  }

  public async deleteSubscription(
    userId: string,
    gameSlug: string
  ): Promise<boolean> {
    const store = getStore();
    const idx = store.subscriptions.findIndex(
      (s) => s.userId === userId && s.gameSlug === gameSlug
    );
    if (idx === -1) {
      return false;
    }

    store.subscriptions.splice(idx, 1);

    const game = store.games.find((g) => g.slug === gameSlug);
    if (game && game.subscriberCount > 0) {
      game.subscriberCount -= 1;
    }

    return true;
  }

  public async getNotificationChannel(
    userId: string
  ): Promise<NotificationChannel> {
    const store = getStore();
    const existing = store.channels.find((c) => c.userId === userId);
    if (existing) {
      return existing;
    }

    const defaultChannel: NotificationChannel = {
      userId,
      discordWebhookUrl: null,
      emailEnabled: true,
      webPushEnabled: true,
      onlyKeywordMatch: false,
      updatedAt: new Date().toISOString(),
    };
    store.channels.push(defaultChannel);
    return defaultChannel;
  }

  public async updateNotificationChannel(
    userId: string,
    input: UpdateNotificationChannelInput
  ): Promise<NotificationChannel> {
    const existing = await this.getNotificationChannel(userId);
    existing.discordWebhookUrl = input.discordWebhookUrl;
    existing.emailEnabled = input.emailEnabled;
    existing.webPushEnabled = input.webPushEnabled;
    existing.onlyKeywordMatch = input.onlyKeywordMatch;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }

  public async listNotificationsByUser(
    userId: string
  ): Promise<NotificationItem[]> {
    const store = getStore();
    return store.notifications
      .filter((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  public async createNotification(
    item: Omit<NotificationItem, "id" | "createdAt">
  ): Promise<NotificationItem> {
    const store = getStore();
    const created: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    store.notifications.unshift(created);
    return created;
  }

  public async markNotificationsRead(
    userId: string,
    options: { notificationId?: string; markAll?: boolean }
  ): Promise<number> {
    const store = getStore();
    let updatedCount = 0;

    for (const notif of store.notifications) {
      if (notif.userId !== userId || notif.isRead) {
        continue;
      }
      if (options.markAll || notif.id === options.notificationId) {
        notif.isRead = true;
        updatedCount += 1;
      }
    }

    return updatedCount;
  }

  public async listCrawlLogs(limit = 20): Promise<CrawlLogItem[]> {
    const store = getStore();
    return [...store.crawlLogs]
      .sort(
        (a, b) =>
          new Date(b.crawledAt).getTime() - new Date(a.crawledAt).getTime()
      )
      .slice(0, limit);
  }

  public async addCrawlLog(
    item: Omit<CrawlLogItem, "id" | "crawledAt">
  ): Promise<CrawlLogItem> {
    const store = getStore();
    const created: CrawlLogItem = {
      ...item,
      id: `crawl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      crawledAt: new Date().toISOString(),
    };
    store.crawlLogs.unshift(created);
    return created;
  }

  public async updateGameCrawlMeta(
    slug: string,
    lastCrawledAt: string
  ): Promise<void> {
    const store = getStore();
    const game = store.games.find((g) => g.slug === slug);
    if (game) {
      game.lastCrawledAt = lastCrawledAt;
    }
  }
}

export const patchRadarRepository: PatchRadarRepository =
  new InMemoryPatchRadarRepository();
