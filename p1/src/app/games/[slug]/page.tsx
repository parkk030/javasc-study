"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Game, Patch, Subscription } from "@/domain/types";
import { PatchCard } from "@/components/features/PatchCard";
import {
  EmptyState,
  ErrorBanner,
  LoadingSkeleton,
} from "@/components/ui/StateViews";

export default function GameHubPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [game, setGame] = useState<Game | null>(null);
  const [patches, setPatches] = useState<Patch[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [keywordInput, setKeywordInput] = useState<string>("");
  const [notifyHotfixOnly, setNotifyHotfixOnly] = useState<boolean>(false);
  const [filterKeyword, setFilterKeyword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [crawling, setCrawling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const loadGameHub = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    try {
      await fetch("/api/crawler/sync?auto=1", { cache: "no-store" });

      const [hubRes, subsRes] = await Promise.all([
        fetch(`/api/games/${encodeURIComponent(slug)}`, { cache: "no-store" }),
        fetch("/api/subscriptions", { cache: "no-store" }),
      ]);

      if (!hubRes.ok) {
        throw new Error("해당 게임 정보를 찾을 수 없습니다.");
      }

      const hubJson = (await hubRes.json()) as {
        data: { game: Game; patches: Patch[] };
      };
      setGame(hubJson.data.game);
      setPatches(hubJson.data.patches);

      if (subsRes.ok) {
        const subsJson = (await subsRes.json()) as { data: Subscription[] };
        const matched = (subsJson.data ?? []).find((s) => s.gameSlug === slug);
        setSubscription(matched ?? null);
        if (matched) {
          setKeywordInput(matched.keywords.join(", "));
          setNotifyHotfixOnly(matched.notifyHotfixOnly);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "게임 허브 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadGameHub();
  }, [loadGameHub]);

  async function handleCrawlGameHomepage() {
    if (!slug) return;
    setCrawling(true);
    try {
      const res = await fetch("/api/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug: slug, force: true }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          data?: { newlyCrawledCount?: number };
        };
        const count = json.data?.newlyCrawledCount ?? 0;
        setSavedNotice(
          count > 0
            ? `공식 홈페이지에서 신규 업데이트 ${count}건을 자동 크롤링하여 반영했습니다!`
            : "공식 홈페이지 확인 완료: 현재 표시된 패치노트가 최신 버전입니다."
        );
        await loadGameHub();
      }
    } finally {
      setCrawling(false);
    }
  }

  async function handleSaveSubscription(e: React.FormEvent) {
    e.preventDefault();
    const keywords = keywordInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug: slug,
          keywords,
          notifyHotfixOnly,
        }),
      });
      if (!res.ok) throw new Error("구독 및 키워드 저장에 실패했습니다.");
      const json = (await res.json()) as { data: Subscription };
      setSubscription(json.data);
      setSavedNotice(
        keywords.length > 0
          ? `구독 및 관심 키워드 [${keywords.join(", ")}] 설정이 저장되었습니다!`
          : "이 게임의 모든 패치노트 알림 구독이 저장되었습니다!"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류 발생");
    }
  }

  const filteredPatches = filterKeyword.trim()
    ? patches.filter((p) => {
        const q = filterKeyword.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.tldr.some((t) => t.toLowerCase().includes(q)) ||
          p.changes.some(
            (c) =>
              c.target.toLowerCase().includes(q) ||
              c.summary.toLowerCase().includes(q)
          )
        );
      })
    : patches;

  if (loading) {
    return (
      <main className="mx-auto max-w-[1280px] px-[24px] py-[56px]">
        <LoadingSkeleton count={3} />
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="mx-auto max-w-[1280px] px-[24px] py-[56px]">
        <ErrorBanner
          message={error ?? "게임을 찾을 수 없습니다."}
          onRetry={loadGameHub}
        />
        <Link
          href="/games"
          className="mt-4 inline-block text-[14px] font-semibold text-[#0090D4]"
        >
          ← 전체 게임 목록으로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1280px] px-[20px] py-[48px] lg:px-[32px]">
      <Link
        href="/games"
        className="text-[14px] font-medium text-[#717680] hover:text-[#15181E]"
      >
        ← 지원 게임 디렉터리로 돌아가기
      </Link>

      {/* Game Hub Header Card */}
      <section className="mt-4 rounded-[16px] border border-[#E2E5E9] bg-[#F8F9FB] p-[28px] sm:p-[36px]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-[16px] border border-[#E2E5E9] bg-white text-4xl shadow-sm">
              {game.iconUrl}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-[10px] py-[3px] text-[12px] font-semibold text-[#15181E] shadow-2xs">
                  {game.genre}
                </span>
                <span className="rounded-[6px] bg-[#ECF9FF] px-[8px] py-[3px] font-mono text-[12px] font-semibold text-[#0090D4]">
                  현재 버전: {game.currentVersion}
                </span>
                <span className="text-[13px] text-[#717680]">
                  구독자 {game.subscriberCount.toLocaleString()}명
                </span>
              </div>
              <h1 className="mt-2 text-[28px] font-bold leading-[36px] text-[#15181E] sm:text-[36px] sm:leading-[44px]">
                {game.name} 패치 허브
              </h1>
              <p className="mt-1.5 text-[15px] leading-[24px] text-[#4B515B]">
                {game.description}
              </p>
              <p className="mt-2 text-[13px] text-[#717680]">
                🗓️ {game.patchCycleLabel} · ⏰ 기준 시각:{" "}
                <strong className="font-semibold text-[#15181E]">
                  {game.maintenanceEndTimeLabel ?? "정기 점검 종료 직후 자동 크롤링"}
                </strong>{" "}
                ·{" "}
                <a
                  href={game.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#0090D4] underline hover:text-[#0072AB]"
                >
                  공식 패치노트 원문 게시판 ↗
                </a>
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={crawling}
            onClick={handleCrawlGameHomepage}
            className="shrink-0 cursor-pointer rounded-[10px] border border-[#DBDEE3] bg-white px-[16px] py-[10px] text-[13px] font-semibold text-[#15181E] transition hover:border-[#15181E] hover:bg-[#F8F9FB] disabled:opacity-50"
          >
            {crawling
              ? "홈페이지 크롤링 중..."
              : "🔄 공식 홈페이지 즉시 크롤링"}
          </button>
        </div>

        {/* Custom Keyword Subscription Prompt Box */}
        <form
          onSubmit={handleSaveSubscription}
          className="shadow-clay-layer mt-6 rounded-[16px] border border-[#DBDEE3] bg-white p-[20px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-[#15181E]">
                🔔 {game.name} 맞춤 키워드 알림 설정
              </span>
              {subscription && (
                <span className="rounded-full bg-[#E8FFE4] px-[8px] py-[2px] text-[11px] font-semibold text-[#00B505]">
                  구독 중 ✓
                </span>
              )}
            </div>
          </div>
          <p className="mt-1 text-[13px] text-[#717680]">
            내가 플레이하는 캐릭터·무기·직업 이름을 쉼표(,)로 구분해 등록하면 해당 키워드가 패치될 때 강조 알림을 받습니다.
          </p>

          <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="예: 아리, 요네, 제트, 오퍼레이터, 블레이드"
              className="flex-1 rounded-[8px] border border-[#DBDEE3] bg-[#F8F9FB] px-[14px] py-[10px] text-[14px] text-[#15181E] placeholder-[#9FA3AB] focus:border-[#15181E] focus:bg-white focus:outline-none"
            />
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#4B515B]">
              <input
                type="checkbox"
                checked={notifyHotfixOnly}
                onChange={(e) => setNotifyHotfixOnly(e.target.checked)}
                className="h-4 w-4 rounded border-[#DBDEE3] text-[#15181E]"
              />
              긴급 핫픽스만 알림 받기
            </label>
            <button
              type="submit"
              className="cursor-pointer rounded-[8px] bg-[#15181E] px-[18px] py-[10px] text-[14px] font-semibold text-white transition hover:bg-[#24282F]"
            >
              {subscription ? "구독 설정 업데이트" : "+ 알림 구독 시작"}
            </button>
          </div>

          {savedNotice && (
            <p className="mt-3 text-[13px] font-semibold text-[#00B505]">
              ✓ {savedNotice}
            </p>
          )}
        </form>
      </section>

      {/* Patch History Timeline */}
      <section className="mt-10">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-[22px] font-bold text-[#15181E]">
            역대 패치노트 히스토리 ({filteredPatches.length}건)
          </h2>
          <input
            type="search"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            placeholder="이 게임 패치 내역에서 키워드 검색..."
            className="rounded-[8px] border border-[#DBDEE3] bg-white px-[14px] py-[9px] text-[14px] text-[#15181E] placeholder-[#9FA3AB] focus:border-[#15181E] focus:outline-none sm:w-72"
          />
        </div>

        <div className="mt-5">
          {filteredPatches.length === 0 ? (
            <EmptyState
              title="일치하는 패치 내역이 없습니다"
              description="검색어를 변경하거나 초기화해 보세요."
              actionLabel="검색 초기화"
              onActionClick={() => setFilterKeyword("")}
            />
          ) : (
            <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 lg:grid-cols-3">
              {filteredPatches.map((patch) => (
                <PatchCard
                  key={patch.id}
                  patch={patch}
                  isSubscribed={Boolean(subscription)}
                  highlightKeyword={filterKeyword.trim() || undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
