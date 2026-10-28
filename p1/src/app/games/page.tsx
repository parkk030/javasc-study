"use client";

import { useCallback, useEffect, useState } from "react";
import type { Game, GameGenre, Subscription } from "@/domain/types";
import { GameCard } from "@/components/features/GameCard";
import {
  EmptyState,
  ErrorBanner,
  LoadingSkeleton,
} from "@/components/ui/StateViews";

const GENRE_TABS: Array<{ value: "" | GameGenre; label: string }> = [
  { value: "", label: "전체 장르" },
  { value: "MOBA", label: "MOBA / AOS" },
  { value: "FPS", label: "FPS / 슈팅" },
  { value: "BattleRoyale", label: "배틀로얄" },
  { value: "MMORPG", label: "MMORPG" },
];

export default function GamesDirectoryPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [subscriptions, setSubscriptions] = useState<
    Record<string, Subscription>
  >({});
  const [selectedGenre, setSelectedGenre] = useState<"" | GameGenre>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedGenre) params.set("genre", selectedGenre);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const [gamesRes, subsRes] = await Promise.all([
        fetch(`/api/games?${params.toString()}`),
        fetch("/api/subscriptions"),
      ]);

      if (!gamesRes.ok) {
        throw new Error("지원 게임 목록을 불러오지 못했습니다.");
      }

      const gamesJson = (await gamesRes.json()) as { data: Game[] };
      setGames(gamesJson.data ?? []);

      if (subsRes.ok) {
        const subsJson = (await subsRes.json()) as { data: Subscription[] };
        const map: Record<string, Subscription> = {};
        for (const sub of subsJson.data ?? []) {
          map[sub.gameSlug] = sub;
        }
        setSubscriptions(map);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "게임 디렉터리 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, searchQuery]);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  async function handleToggleSubscribe(gameSlug: string) {
    const existing = subscriptions[gameSlug];
    try {
      if (existing) {
        const res = await fetch(
          `/api/subscriptions?gameSlug=${encodeURIComponent(gameSlug)}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("구독 해제에 실패했습니다.");
        setSubscriptions((prev) => {
          const clone = { ...prev };
          delete clone[gameSlug];
          return clone;
        });
        setStatusMessage(`'${gameSlug}' 알림 구독을 해제했습니다.`);
      } else {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameSlug,
            keywords: [],
            notifyHotfixOnly: false,
          }),
        });
        if (!res.ok) throw new Error("구독 신청에 실패했습니다.");
        const json = (await res.json()) as { data: Subscription };
        setSubscriptions((prev) => ({ ...prev, [gameSlug]: json.data }));
        setStatusMessage(
          `'${gameSlug}' 알림 구독이 완료되었습니다! 새 패치 등록 시 즉시 알려드립니다.`
        );
      }
      void loadDirectory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "구독 변경 실패");
    }
  }

  return (
    <main className="mx-auto max-w-[1280px] px-[20px] py-[56px] lg:px-[32px]">
      <div className="border-b border-[#E2E5E9] pb-[28px]">
        <span className="inline-block rounded-full bg-[#ECF9FF] px-[10px] py-[4px] text-[12px] font-semibold text-[#0090D4]">
          SUPPORTED GAMES
        </span>
        <h1 className="mt-3 text-[28px] font-bold leading-[36px] tracking-[-0.025em] text-[#15181E] sm:text-[36px] sm:leading-[44px]">
          지원 게임 디렉터리 &amp; 원클릭 구독
        </h1>
        <p className="mt-2 text-[16px] leading-[24px] text-[#717680]">
          원하는 게임을 구독하고 캐릭터·무기·직업 키워드 맞춤 패치 알림을 설정하세요.
        </p>
      </div>

      {statusMessage && (
        <div className="mt-6 flex items-center justify-between rounded-[12px] border border-[#9AFF92] bg-[#E8FFE4] px-[16px] py-[12px] text-[14px] font-medium text-[#028907]">
          <span>🔔 {statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="cursor-pointer text-[12px] font-semibold underline"
          >
            닫기
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-[8px]">
          {GENRE_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setSelectedGenre(tab.value)}
              className={`cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[14px] font-semibold transition ${
                selectedGenre === tab.value
                  ? "bg-[#15181E] text-white"
                  : "border border-[#E2E5E9] bg-[#F8F9FB] text-[#4B515B] hover:border-[#BCC0C6] hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="게임명 검색 (예: 발로란트, 로스트아크)..."
          className="w-full rounded-[8px] border border-[#DBDEE3] bg-white px-[14px] py-[9px] text-[14px] text-[#15181E] placeholder-[#9FA3AB] focus:border-[#15181E] focus:outline-none sm:max-w-xs"
        />
      </div>

      <section className="mt-8">
        {loading ? (
          <LoadingSkeleton count={3} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={loadDirectory} />
        ) : games.length === 0 ? (
          <EmptyState
            title="검색된 게임이 없습니다"
            description="다른 장르 탭을 선택하거나 검색어를 지워보세요."
            actionLabel="전체 게임 보기"
            onActionClick={() => {
              setSelectedGenre("");
              setSearchQuery("");
            }}
          />
        ) : (
          <div className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const sub = subscriptions[game.slug];
              return (
                <GameCard
                  key={game.id}
                  game={game}
                  isSubscribed={Boolean(sub)}
                  keywords={sub?.keywords ?? []}
                  onToggleSubscribe={handleToggleSubscribe}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
