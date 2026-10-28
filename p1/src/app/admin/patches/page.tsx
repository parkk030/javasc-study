"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CrawlLogItem, Patch } from "@/domain/types";
import type { GameCrawlScheduleItem } from "@/services/crawler.service";
import { ErrorBanner, LoadingSkeleton } from "@/components/ui/StateViews";

interface SyncApiPayload {
  syncedAt: string;
  totalChecked: number;
  newlyCrawledCount: number;
  dispatchedNotificationsCount: number;
  newPatches: Patch[];
  logs: CrawlLogItem[];
  schedules: GameCrawlScheduleItem[];
}

export default function AutoCrawlerMonitorPage() {
  const [schedules, setSchedules] = useState<GameCrawlScheduleItem[]>([]);
  const [logs, setLogs] = useState<CrawlLogItem[]>([]);
  const [recentCrawledPatches, setRecentCrawledPatches] = useState<Patch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingTarget, setSyncingTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const loadAndAutoSync = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Automatically crawl games whose patch completion window has arrived
      const res = await fetch("/api/crawler/sync?auto=1", {
        cache: "no-store",
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: SyncApiPayload;
        error?: { message?: string };
      };

      if (!res.ok || !json.success || !json.data) {
        throw new Error(
          json.error?.message ?? "자동 크롤링 스케줄 정보를 불러오지 못했습니다."
        );
      }

      setSchedules(json.data.schedules ?? []);
      setLogs(json.data.logs ?? []);

      if (json.data.newPatches && json.data.newPatches.length > 0) {
        setRecentCrawledPatches(json.data.newPatches);
        setBannerMsg(
          `패치 종료 시각이 도래한 게임 홈페이지에서 신규 업데이트 ${json.data.newlyCrawledCount}건을 자동 크롤링하고 구독자 알림 ${json.data.dispatchedNotificationsCount}건을 발송했습니다.`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "자동 크롤링 모니터 로드 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAndAutoSync();
  }, [loadAndAutoSync]);

  async function handleTriggerCrawl(gameSlug?: string) {
    setSyncingTarget(gameSlug ?? "ALL");
    setError(null);

    try {
      const res = await fetch("/api/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug,
          force: true,
        }),
      });

      const json = (await res.json()) as {
        success: boolean;
        data?: SyncApiPayload;
        error?: { message?: string };
      };

      if (!res.ok || !json.success || !json.data) {
        throw new Error(
          json.error?.message ?? "공식 홈페이지 크롤링 요청에 실패했습니다."
        );
      }

      setSchedules(json.data.schedules ?? []);
      setLogs(json.data.logs ?? []);

      if (json.data.newPatches.length > 0) {
        setRecentCrawledPatches((prev) => [
          ...json.data!.newPatches,
          ...prev,
        ]);
        setBannerMsg(
          `공식 홈페이지 크롤링 완료! 신규 패치노트 ${json.data.newlyCrawledCount}건 자동 반영 및 알림 ${json.data.dispatchedNotificationsCount}건 발송 완료.`
        );
      } else {
        setBannerMsg(
          "공식 홈페이지 확인 완료: 현재 수집된 패치노트가 이미 홈페이지 최신 업데이트 버전과 일치합니다."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "크롤링 동기화에 실패했습니다."
      );
    } finally {
      setSyncingTarget(null);
    }
  }

  return (
    <main className="mx-auto max-w-[1280px] px-[20px] py-[56px] lg:px-[32px]">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#E2E5E9] pb-[28px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8FFE4] px-[10px] py-[4px] text-[12px] font-semibold text-[#028907]">
              <span className="h-2 w-2 rounded-full bg-[#00B505]" />
              AUTO-CRAWLER ACTIVE
            </span>
            <span className="rounded-full bg-[#ECF9FF] px-[10px] py-[4px] font-mono text-[12px] font-semibold text-[#0090D4]">
              Cron: 0 * * * * (매시간 패치 종료 감시)
            </span>
          </div>
          <h1 className="mt-3 text-[28px] font-bold leading-[36px] tracking-[-0.025em] text-[#15181E] sm:text-[36px] sm:leading-[44px]">
            패치 종료 기준 공식 홈페이지 자동 크롤링 모니터
          </h1>
          <p className="mt-2 max-w-[780px] text-[16px] leading-[24px] text-[#717680]">
            패치노트를 직접 입력할 필요 없이, 각 게임의{" "}
            <strong className="font-semibold text-[#15181E]">
              정기 점검·패치가 끝나는 시각
            </strong>
            을 기준으로 공식 홈페이지 업데이트 게시판을 자동 크롤링하여 3줄 요약과 밸런스 변경점을 자동으로 보여줍니다.
          </p>
        </div>

        <button
          type="button"
          disabled={syncingTarget !== null}
          onClick={() => handleTriggerCrawl(undefined)}
          className="cursor-pointer rounded-[10px] bg-[#15181E] px-[20px] py-[12px] text-[14px] font-semibold text-white transition hover:bg-[#24282F] disabled:opacity-50"
        >
          {syncingTarget === "ALL"
            ? "전체 홈페이지 크롤링 중..."
            : "⚡ 전체 게임 공식 홈페이지 즉시 크롤링"}
        </button>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} onRetry={loadAndAutoSync} />
        </div>
      )}

      {bannerMsg && (
        <div className="mt-6 flex items-center justify-between rounded-[12px] border border-[#9AFF92] bg-[#E8FFE4] px-[18px] py-[14px] text-[14px] font-semibold text-[#028907]">
          <span>✓ {bannerMsg}</span>
          <button
            type="button"
            onClick={() => setBannerMsg(null)}
            className="cursor-pointer text-[12px] underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* Newly Crawled Patches Highlight Box */}
      {recentCrawledPatches.length > 0 && (
        <section className="mt-8 rounded-[16px] border border-[#75DBFF] bg-[#ECF9FF] p-[24px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="rounded-full bg-[#0090D4] px-[8px] py-[2px] text-[11px] font-semibold text-white">
                NEW AUTO-CRAWLED UPDATES
              </span>
              <h2 className="mt-2 text-[20px] font-bold text-[#15181E]">
                방금 공식 홈페이지에서 자동 크롤링된 신규 패치노트 ({recentCrawledPatches.length}건)
              </h2>
            </div>
            <Link
              href="/"
              className="rounded-[8px] bg-[#15181E] px-[14px] py-[8px] text-[13px] font-semibold text-white transition hover:bg-[#24282F]"
            >
              통합 패치 피드에서 보기 →
            </Link>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {recentCrawledPatches.map((patch) => (
              <div
                key={patch.id}
                className="rounded-[12px] border border-[#B6EAFF] bg-white p-[18px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-[#15181E]">
                    {patch.gameName}
                  </span>
                  <span className="rounded-[6px] bg-[#ECF9FF] px-[8px] py-[2px] font-mono text-[12px] font-semibold text-[#0090D4]">
                    {patch.version}
                  </span>
                </div>
                <p className="mt-2 text-[15px] font-bold text-[#15181E]">
                  {patch.title}
                </p>
                <p className="mt-1 text-[12px] text-[#717680]">
                  ⏰ {patch.maintenanceWindow}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <a
                    href={patch.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] font-medium text-[#717680] hover:text-[#15181E] hover:underline"
                  >
                    공식 홈페이지 원문 ↗
                  </a>
                  <Link
                    href={`/patches/${patch.id}`}
                    className="text-[13px] font-semibold text-[#0090D4] hover:underline"
                  >
                    자동 요약 상세 보기 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingSkeleton count={3} />
        </div>
      ) : (
        <>
          {/* Section 1: Game Patch Completion Schedule & Official Homepage Targets */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-bold text-[#15181E]">
                  게임별 패치 종료 기준 시각 &amp; 공식 홈페이지 크롤링 스케줄
                </h2>
                <p className="mt-1 text-[14px] text-[#717680]">
                  각 게임의 점검/패치 종료 시각이 도래하면 등록된 공식 홈페이지 업데이트 게시판을 자동으로 크롤링합니다.
                </p>
              </div>
            </div>

            <div className="grid gap-[20px] md:grid-cols-2 lg:grid-cols-3">
              {schedules.map((item) => {
                const isSyncingThis =
                  syncingTarget === item.gameSlug || syncingTarget === "ALL";
                const formattedLastCrawl = new Date(
                  item.lastCrawledAt
                ).toLocaleString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={item.gameSlug}
                    className="flex flex-col justify-between rounded-[16px] border border-[#E2E5E9] bg-white p-[24px] transition hover:border-[#BCC0C6] hover:shadow-clay-card"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F8F9FB] text-[20px]">
                            {item.iconUrl}
                          </span>
                          <div>
                            <h3 className="text-[17px] font-bold text-[#15181E]">
                              {item.gameName}
                            </h3>
                            <span className="font-mono text-[12px] font-semibold text-[#0090D4]">
                              현재 반영 버전: {item.currentVersion}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-[8px] py-[3px] text-[11px] font-semibold ${
                            item.hasPendingUpdate
                              ? "bg-[#FFFBD8] text-[#E28100]"
                              : "bg-[#E8FFE4] text-[#028907]"
                          }`}
                        >
                          {item.hasPendingUpdate
                            ? `신규 감지 (${item.latestAvailableVersion})`
                            : "최신 동기화 완료"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 rounded-[12px] border border-[#E2E5E9] bg-[#F8F9FB] p-[14px] text-[13px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-[#717680]">
                            ⏰ 패치 종료 기준
                          </span>
                          <span className="font-semibold text-[#15181E]">
                            {item.maintenanceEndTimeLabel}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-[#717680]">
                            🕒 최근 크롤링
                          </span>
                          <span className="font-mono text-[12px] text-[#4B515B]">
                            {formattedLastCrawl}
                          </span>
                        </div>
                        <div className="pt-1">
                          <span className="block text-[11px] font-semibold text-[#717680]">
                            🌐 공식 크롤링 타겟 URL
                          </span>
                          <a
                            href={item.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 block truncate font-mono text-[12px] text-[#0090D4] hover:underline"
                          >
                            {item.officialUrl}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 pt-2">
                      <Link
                        href={`/games/${item.gameSlug}`}
                        className="text-[13px] font-semibold text-[#717680] hover:text-[#15181E]"
                      >
                        게임 타임라인 보기 →
                      </Link>
                      <button
                        type="button"
                        disabled={isSyncingThis}
                        onClick={() => handleTriggerCrawl(item.gameSlug)}
                        className="cursor-pointer rounded-[8px] border border-[#DBDEE3] bg-white px-[12px] py-[7px] text-[13px] font-semibold text-[#15181E] transition hover:border-[#15181E] hover:bg-[#F8F9FB] disabled:opacity-50"
                      >
                        {isSyncingThis ? "크롤링 중..." : "🔄 홈페이지 크롤링"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Crawl Execution History Log */}
          <section className="mt-12">
            <div className="mb-4">
              <h2 className="text-[20px] font-bold text-[#15181E]">
                실시간 공식 홈페이지 크롤링 &amp; 자동 알림 디스패치 로그
              </h2>
              <p className="mt-1 text-[14px] text-[#717680]">
                패치 완료 시각 기준으로 각 게임 홈페이지에서 수집된 업데이트 내역과 구독자 알림 발송 기록입니다.
              </p>
            </div>

            <div className="space-y-3">
              {logs.map((log) => {
                const logTime = new Date(log.crawledAt).toLocaleString(
                  "ko-KR",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                );

                return (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-[#E2E5E9] bg-white p-[18px]"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-[8px] py-[2px] text-[11px] font-semibold ${
                            log.status === "NEW_PATCH_CRAWLED"
                              ? "bg-[#E8FFE4] text-[#028907]"
                              : log.status === "UP_TO_DATE"
                                ? "bg-[#ECF9FF] text-[#0090D4]"
                                : "bg-[#F8F9FB] text-[#717680]"
                          }`}
                        >
                          {log.status === "NEW_PATCH_CRAWLED"
                            ? "신규 패치 자동 수집"
                            : log.status === "UP_TO_DATE"
                              ? "최신 상태 유지"
                              : "패치 종료 시각 대기"}
                        </span>
                        <span className="text-[14px] font-bold text-[#15181E]">
                          {log.gameName}
                        </span>
                        <span className="rounded-[6px] bg-[#F8F9FB] px-[7px] py-[1px] font-mono text-[12px] font-semibold text-[#0090D4]">
                          {log.detectedVersion}
                        </span>
                        <span className="font-mono text-[11px] text-[#9FA3AB]">
                          HTTP {log.httpStatus} · {logTime}
                        </span>
                      </div>

                      <p className="text-[14px] font-medium text-[#24282F]">
                        {log.detectedTitle}
                      </p>
                      <p className="text-[12px] text-[#717680]">
                        기준 스케줄: {log.maintenanceEndTimeLabel} · 출처:{" "}
                        <a
                          href={log.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0090D4] hover:underline"
                        >
                          {log.officialUrl}
                        </a>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {log.dispatchedNotifications > 0 && (
                        <span className="rounded-[8px] bg-[#F9E2FF] px-[10px] py-[5px] text-[12px] font-semibold text-[#A500E6]">
                          🔔 구독자 알림 {log.dispatchedNotifications}건 발송
                        </span>
                      )}
                      {log.patchId && (
                        <Link
                          href={`/patches/${log.patchId}`}
                          className="rounded-[8px] border border-[#DBDEE3] bg-white px-[12px] py-[6px] text-[13px] font-semibold text-[#15181E] transition hover:border-[#15181E] hover:bg-[#F8F9FB]"
                        >
                          패치노트 보기 →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
