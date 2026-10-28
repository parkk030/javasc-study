"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type {
  Game,
  PatchCategory,
  PatchChangeType,
  Subscription,
} from "@/domain/types";
import {
  PatchCard,
  type PatchWithCounts,
} from "@/components/features/PatchCard";
import {
  EmptyState,
  ErrorBanner,
  LoadingSkeleton,
} from "@/components/ui/StateViews";

const CATEGORY_TABS: Array<{ value: "" | PatchCategory; label: string }> = [
  { value: "", label: "전체 유형" },
  { value: "regular", label: "정기 패치" },
  { value: "balance", label: "밸런스 조정" },
  { value: "hotfix", label: "긴급 핫픽스" },
  { value: "maintenance", label: "서버 점검" },
];

const CHANGE_TYPE_TABS: Array<{ value: "" | PatchChangeType; label: string }> = [
  { value: "", label: "전체 변경점" },
  { value: "buff", label: "🔺 상향 포함" },
  { value: "nerf", label: "🔻 하향 포함" },
  { value: "bugfix", label: "🛠️ 버그수정" },
  { value: "new", label: "🎉 신규 콘텐츠" },
];

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [patches, setPatches] = useState<PatchWithCounts[]>([]);
  const [subscribedSlugs, setSubscribedSlugs] = useState<Set<string>>(
    new Set()
  );

  const [selectedGame, setSelectedGame] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<"" | PatchCategory>(
    ""
  );
  const [selectedChangeType, setSelectedChangeType] = useState<
    "" | PatchChangeType
  >("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [crawling, setCrawling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchFeedData = useCallback(
    async (options?: { runAutoCrawl?: boolean }) => {
      setLoading(true);
      setError(null);

      try {
        if (options?.runAutoCrawl) {
          const syncRes = await fetch("/api/crawler/sync?auto=1", {
            cache: "no-store",
          });
          if (syncRes.ok) {
            const syncJson = (await syncRes.json()) as {
              data?: { newlyCrawledCount?: number };
            };
            const crawledCount = syncJson.data?.newlyCrawledCount ?? 0;
            if (crawledCount > 0) {
              setFeedbackMsg(
                `패치 완료 시각이 지난 게임 공식 홈페이지에서 최신 업데이트 ${crawledCount}건을 자동으로 크롤링하여 반영했습니다.`
              );
            }
          }
        }

        const params = new URLSearchParams();
        if (selectedGame) params.set("gameSlug", selectedGame);
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedChangeType) params.set("changeType", selectedChangeType);
        if (searchQuery.trim()) params.set("q", searchQuery.trim());

        const [gamesRes, patchesRes, subsRes] = await Promise.all([
          fetch("/api/games", { cache: "no-store" }),
          fetch(`/api/patches?${params.toString()}`, { cache: "no-store" }),
          fetch("/api/subscriptions", { cache: "no-store" }),
        ]);

        if (!gamesRes.ok || !patchesRes.ok) {
          throw new Error("패치노트 피드를 불러오는 중 오류가 발생했습니다.");
        }

        const gamesJson = (await gamesRes.json()) as { data: Game[] };
        const patchesJson = (await patchesRes.json()) as {
          data: PatchWithCounts[];
        };

        setGames(gamesJson.data ?? []);
        setPatches(patchesJson.data ?? []);

        if (subsRes.ok) {
          const subsJson = (await subsRes.json()) as { data: Subscription[] };
          setSubscribedSlugs(
            new Set((subsJson.data ?? []).map((s) => s.gameSlug))
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "데이터를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedGame, selectedCategory, selectedChangeType, searchQuery]
  );

  useEffect(() => {
    void fetchFeedData({ runAutoCrawl: true });
  }, [fetchFeedData]);

  async function handleCrawlNow() {
    setCrawling(true);
    try {
      const res = await fetch("/api/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug: selectedGame || undefined,
          force: true,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          data?: { newlyCrawledCount?: number };
        };
        const count = json.data?.newlyCrawledCount ?? 0;
        setFeedbackMsg(
          count > 0
            ? `공식 홈페이지 크롤링 완료! 신규 패치노트 ${count}건이 자동으로 추가되었습니다.`
            : "모든 게임이 이미 공식 홈페이지 최신 패치 버전과 동기화되어 있습니다."
        );
        await fetchFeedData({ runAutoCrawl: false });
      }
    } finally {
      setCrawling(false);
    }
  }

  async function handleToggleSubscribe(gameSlug: string) {
    const currentlySubscribed = subscribedSlugs.has(gameSlug);
    try {
      if (currentlySubscribed) {
        const res = await fetch(
          `/api/subscriptions?gameSlug=${encodeURIComponent(gameSlug)}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("구독 해제에 실패했습니다.");
        setSubscribedSlugs((prev) => {
          const next = new Set(prev);
          next.delete(gameSlug);
          return next;
        });
        setFeedbackMsg(`'${gameSlug}' 알림 구독이 해제되었습니다.`);
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
        if (!res.ok) throw new Error("구독 등록에 실패했습니다.");
        setSubscribedSlugs((prev) => new Set(prev).add(gameSlug));
        setFeedbackMsg(`'${gameSlug}' 패치노트 알림 구독이 시작되었습니다!`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "구독 처리 실패");
    }
  }

  return (
    <main className="bg-white">
      {/* Section 1: Imweb Hero + Floating AI Prompt Search Dock */}
      <section
        aria-label="PatchRadar Hero"
        className="w-full border-b border-[#E2E5E9] bg-gradient-to-b from-white via-[#F8F9FB]/70 to-white px-[20px] pt-[64px] pb-[72px] lg:pt-[88px] lg:pb-[88px]"
      >
        <div className="mx-auto flex max-w-[1040px] flex-col items-center text-center">
          {/* Oversized Imweb 80px Display Typography */}
          <h1 className="m-0 text-[36px] font-bold leading-[44px] tracking-[-0.03em] text-[#15181E] sm:text-[60px] sm:leading-[64px] lg:text-[76px] lg:leading-[80px]">
            패치 확인이 쉬운 사이트
          </h1>
          <p className="mt-[20px] max-w-[640px] text-[16px] font-normal leading-[26px] text-[#717680] sm:text-[20px] sm:leading-[28px]">
            단 한 줄 검색으로 내 주력 챔피언·무기의 버프·너프를 실시간으로 받아보세요
          </p>

          {/* Imweb AI Prompt Box Clone */}
          <div className="shadow-clay-layer relative mt-[44px] flex w-full max-w-[780px] flex-col rounded-[16px] bg-white p-[20px] text-left outline outline-1 outline-[#BCC0C6] transition-all duration-200 focus-within:outline-2 focus-within:outline-[#4B515B] hover:outline-[#4B515B]">
            <div className="mb-[12px] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-[6px]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ECF9FF] text-[12px] font-bold text-[#0090D4]">
                  ✦
                </span>
                <span className="text-[14px] font-semibold leading-[20px] text-[#15181E]">
                  patchradar AI 필터
                </span>
                <span
                  className="rounded-full px-[6px] py-[2px] text-[11px] font-semibold leading-[12px]"
                  style={{ color: "#A500E6", backgroundColor: "#F9E2FF" }}
                >
                  beta
                </span>
              </div>

              <Link
                href="/settings/notifications"
                className="inline-flex items-center gap-1 rounded-[8px] bg-[#ECF9FF] px-[12px] py-[6px] text-[13px] font-semibold text-[#0090D4] transition hover:bg-[#DEF3FF]"
              >
                <span>⚡ Discord 실시간 웹훅 연동</span>
              </Link>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="궁금한 챔피언, 무기, 직업 이름을 입력해보세요 (예: 아리, 제트, 오퍼레이터, 블레이드)"
                className="w-full rounded-[8px] border border-[#E2E5E9] bg-[#F8F9FB] px-[14px] py-[12px] text-[15px] text-[#15181E] placeholder-[#9FA3AB] transition focus:border-[#15181E] focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="shrink-0 cursor-pointer rounded-[8px] border border-[#DBDEE3] bg-white px-[14px] py-[12px] text-[13px] font-semibold text-[#4B515B] hover:bg-[#F8F9FB]"
                >
                  초기화
                </button>
              )}
            </div>

            {/* Prompt Box Bottom Quick Filter Chips */}
            <div className="mt-[14px] flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E5E9] pt-[12px]">
              <div className="flex flex-wrap items-center gap-[6px]">
                {CHANGE_TYPE_TABS.map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setSelectedChangeType(tab.value)}
                    className={`cursor-pointer rounded-[8px] px-[10px] py-[5px] text-[12px] font-semibold transition ${
                      selectedChangeType === tab.value
                        ? "bg-[#15181E] text-white"
                        : "bg-[#F8F9FB] text-[#4B515B] hover:bg-[#E2E5E9]/70"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-[6px]">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setSelectedCategory(tab.value)}
                    className={`cursor-pointer rounded-[8px] px-[10px] py-[5px] text-[12px] font-medium transition ${
                      selectedCategory === tab.value
                        ? "bg-[#ECF9FF] font-semibold text-[#0090D4]"
                        : "text-[#717680] hover:bg-[#F8F9FB] hover:text-[#15181E]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Game Selector Pills */}
          <div className="mt-[28px] flex flex-wrap items-center justify-center gap-[8px]">
            <button
              type="button"
              onClick={() => setSelectedGame("")}
              className={`cursor-pointer rounded-full px-[16px] py-[8px] text-[14px] font-semibold transition ${
                selectedGame === ""
                  ? "bg-[#15181E] text-white"
                  : "border border-[#E2E5E9] bg-white text-[#4B515B] hover:border-[#BCC0C6] hover:bg-[#F8F9FB]"
              }`}
            >
              전체 게임 ({games.length})
            </button>
            {games.map((game) => (
              <button
                key={game.slug}
                type="button"
                onClick={() => setSelectedGame(game.slug)}
                className={`inline-flex cursor-pointer items-center gap-[6px] rounded-full px-[16px] py-[8px] text-[14px] font-semibold transition ${
                  selectedGame === game.slug
                    ? "bg-[#15181E] text-white"
                    : "border border-[#E2E5E9] bg-white text-[#15181E] hover:border-[#BCC0C6] hover:bg-[#F8F9FB]"
                }`}
              >
                <span>{game.iconUrl}</span>
                <span>{game.name}</span>
                <span
                  className={`rounded-full px-[6px] py-[1px] font-mono text-[11px] ${
                    selectedGame === game.slug
                      ? "bg-white/20 text-white"
                      : "bg-[#F8F9FB] text-[#717680]"
                  }`}
                >
                  {game.currentVersion}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Patch Timeline Content Container */}
      <section className="mx-auto max-w-[1280px] px-[20px] pt-[56px] pb-[80px] lg:px-[32px]">
        {feedbackMsg && (
          <div className="mb-6 flex items-center justify-between rounded-[12px] border border-[#9AFF92] bg-[#E8FFE4] px-[16px] py-[12px] text-[14px] font-medium text-[#028907]">
            <span>✓ {feedbackMsg}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="cursor-pointer text-[12px] font-semibold underline"
            >
              닫기
            </button>
          </div>
        )}

        <div className="mb-[24px] flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-semibold text-[#0090D4]">
                LIVE AUTO-CRAWLED PATCH STREAM
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8FFE4] px-[8px] py-[2px] text-[11px] font-semibold text-[#028907]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00B505]" />
                패치 완료 시간 기준 홈페이지 자동 크롤링 활성
              </span>
            </div>
            <h2 className="mt-1 text-[24px] font-bold leading-[32px] text-[#15181E]">
              공식 홈페이지 자동 수집 업데이트 &amp; 패치노트 ({patches.length}건)
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={crawling}
              onClick={handleCrawlNow}
              className="cursor-pointer rounded-[8px] border border-[#DBDEE3] bg-white px-[14px] py-[8px] text-[13px] font-semibold text-[#15181E] transition hover:border-[#15181E] hover:bg-[#F8F9FB] disabled:opacity-50"
            >
              {crawling
                ? "공식 홈페이지 크롤링 중..."
                : "🔄 공식 홈페이지 즉시 크롤링 동기화"}
            </button>
            <Link
              href="/admin/patches"
              className="text-[13px] font-semibold text-[#0090D4] hover:underline"
            >
              크롤링 스케줄 모니터 →
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={fetchFeedData} />
        ) : patches.length === 0 ? (
          <EmptyState
            title="조건에 일치하는 패치노트가 없습니다"
            description="다른 게임을 선택하거나 검색 키워드 필터를 초기화해 보세요."
            actionLabel="필터 전체 초기화"
            onActionClick={() => {
              setSelectedGame("");
              setSelectedCategory("");
              setSelectedChangeType("");
              setSearchQuery("");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 lg:grid-cols-3">
            {patches.map((patch) => (
              <PatchCard
                key={patch.id}
                patch={patch}
                isSubscribed={subscribedSlugs.has(patch.gameSlug)}
                onToggleSubscribe={handleToggleSubscribe}
                highlightKeyword={searchQuery.trim() || undefined}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
