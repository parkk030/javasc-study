import { beforeEach, describe, expect, it } from "vitest";
import { patchRadarRepository } from "@/repositories/patch-radar.repository";

describe("PatchRadarRepository Unit Tests (T-04)", () => {
  beforeEach(() => {
    patchRadarRepository.resetStore();
  });

  it("lists 6 seeded games and filters by genre or search query", async () => {
    const allGames = await patchRadarRepository.listGames();
    expect(allGames).toHaveLength(6);

    const fpsGames = await patchRadarRepository.listGames({ genre: "FPS" });
    expect(fpsGames.map((g) => g.slug)).toEqual(["valorant", "overwatch-2"]);

    const searched = await patchRadarRepository.listGames({ q: "로스트아크" });
    expect(searched).toHaveLength(1);
    expect(searched[0]?.slug).toBe("lost-ark");
  });

  it("filters patches by gameSlug, category, changeType, and keyword q", async () => {
    const lolPatches = await patchRadarRepository.listPatches({
      gameSlug: "league-of-legends",
      page: 1,
      limit: 10,
    });
    expect(lolPatches.total).toBe(1);
    expect(lolPatches.items[0]?.version).toBe("v26.19");

    const hotfixPatches = await patchRadarRepository.listPatches({
      category: "hotfix",
      page: 1,
      limit: 10,
    });
    expect(hotfixPatches.total).toBe(1);
    expect(hotfixPatches.items[0]?.gameSlug).toBe("lost-ark");

    const keywordMatches = await patchRadarRepository.listPatches({
      q: "오퍼레이터",
      page: 1,
      limit: 10,
    });
    expect(keywordMatches.total).toBe(1);
    expect(keywordMatches.items[0]?.gameSlug).toBe("valorant");
  });

  it("upserts and deletes user game subscriptions and updates subscriber count", async () => {
    const beforePubg = await patchRadarRepository.getGameBySlug("pubg");
    const initialCount = beforePubg?.subscriberCount ?? 0;

    // Create new subscription
    const sub = await patchRadarRepository.upsertSubscription("user-gamer-1", {
      gameSlug: "pubg",
      keywords: ["AUG", "베릴"],
      notifyHotfixOnly: false,
    });
    expect(sub.gameSlug).toBe("pubg");
    expect(sub.keywords).toEqual(["AUG", "베릴"]);

    const afterSubPubg = await patchRadarRepository.getGameBySlug("pubg");
    expect(afterSubPubg?.subscriberCount).toBe(initialCount + 1);

    // Upsert existing subscription (should not increment subscriberCount twice)
    const updatedSub = await patchRadarRepository.upsertSubscription(
      "user-gamer-1",
      {
        gameSlug: "pubg",
        keywords: ["AUG", "사녹"],
        notifyHotfixOnly: true,
      }
    );
    expect(updatedSub.keywords).toEqual(["AUG", "사녹"]);
    expect(updatedSub.notifyHotfixOnly).toBe(true);

    const afterUpsertPubg = await patchRadarRepository.getGameBySlug("pubg");
    expect(afterUpsertPubg?.subscriberCount).toBe(initialCount + 1);

    // Delete subscription
    const deleted = await patchRadarRepository.deleteSubscription(
      "user-gamer-1",
      "pubg"
    );
    expect(deleted).toBe(true);

    const afterDeletePubg = await patchRadarRepository.getGameBySlug("pubg");
    expect(afterDeletePubg?.subscriberCount).toBe(initialCount);
  });
});
