"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Game, NotificationItem, Subscription } from "@/domain/types";
import {
  PatchCard,
  type PatchWithCounts,
} from "@/components/features/PatchCard";
import {
  EmptyState,
  ErrorBanner,
  LoadingSkeleton,
} from "@/components/ui/StateViews";

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [gamesMap, setGamesMap] = useState<Record<string, Game>>({});
  const [myPatches, setMyPatches] = useState<PatchWithCounts[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subsRes, gamesRes, patchesRes, notifRes] = await Promise.all([
        fetch("/api/subscriptions"),
        fetch("/api/games"),
        fetch("/api/patches"),
        fetch("/api/notifications"),
      ]);

      if (!subsRes.ok || !gamesRes.ok || !patchesRes.ok || !notifRes.ok) {
        throw new Error("대시보드 데이터를 불러오는 중 오류가 발생했습니다.");
      }

      const subsJson = (await subsRes.json()) as { data: Subscription[] };
      const gamesJson = (await gamesRes.json()) as { data: Game[] };
      const patchesJson = (await patchesRes.json()) as {
        data: PatchWithCounts[];
      };
      const notifJson = (await notifRes.json()) as {
        data: NotificationItem[];
        meta?: { unreadCount?: number };
      };

      const subs = subsJson.data ?? [];
      setSubscriptions(subs);

      const gMap: Record<string, Game> = {};
      for (const g of gamesJson.data ?? []) {
        gMap[g.slug] = g;
      }
      setGamesMap(gMap);

      const subscribedSet = new Set(subs.map((s) => s.gameSlug));
      const filteredPatches = (patchesJson.data ?? []).filter((p) =>
        subscribedSet.has(p.gameSlug)
      );
      setMyPatches(filteredPatches);

      setNotifications(notifJson.data ?? []);
      setUnreadCount(notifJson.meta?.unreadCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "대시보드 로드 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) throw new Error("알림 읽음 처리에 실패했습니다.");
      setToast("모든 알림을 읽음으로 표시했습니다.");
      void loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알림 처리 실패");
    }
  }

  async function handleMarkSingleRead(notificationId: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, markAll: false }),
      });
      void loadDashboard();
    } catch {
      // Ignore single read error
    }
  }

  async function handleUnsubscribe(gameSlug: string) {
    try {
      const res = await fetch(
        `/api/subscriptions?gameSlug=${encodeURIComponent(gameSlug)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("구독 해제에 실패했습니다.");
      setToast(`'${gameSlug}' 구독이 해제되었습니다.`);
      void loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "구독 해제 오류");
    }
  }

  return (
    <main className="mx-auto max-w-[1280px] px-[20px] py-[56px] lg:px-[32px]">
      <div className="flex flex-col justify-between gap-4 border-b border-[#E2E5E9] pb-[28px] sm:flex-row sm:items-end">
        <div>
          <span className="inline-block rounded-full bg-[#ECF9FF] px-[10px] py-[4px] text-[12px] font-semibold text-[#0090D4]">
            MY PATCH WORKSPACE
          </span>
          <h1 className="mt-3 text-[28px] font-bold leading-[36px] tracking-[-0.025em] text-[#15181E] sm:text-[36px] sm:leading-[44px]">
            내 구독 피드 &amp; 인앱 알림함
          </h1>
          <p className="mt-2 text-[16px] leading-[24px] text-[#717680]">
            내가 구독한 게임들의 신규 패치노트와 맞춤 키워드 알림 내역을 한곳에서 확인하세요.
          </p>
        </div>

        <div className="flex flex-wrap gap-[10px]">
          <Link
            href="/settings/notifications"
            className="rounded-[8px] border border-[#DBDEE3] bg-white px-[16px] py-[10px] text-[14px] font-medium text-[#15181E] transition hover:border-[#15181E] hover:bg-[#F8F9FB]"
          >
            ⚙️ Discord 웹훅 / 수신 채널 설정
          </Link>
          <Link
            href="/games"
            className="rounded-[8px] bg-[#15181E] px-[16px] py-[10px] text-[14px] font-semibold text-white transition hover:bg-[#24282F]"
          >
            + 관심 게임 추가 구독
          </Link>
        </div>
      </div>

      {toast && (
        <div className="mt-6 flex items-center justify-between rounded-[12px] border border-[#9AFF92] bg-[#E8FFE4] px-[16px] py-[12px] text-[14px] font-medium text-[#028907]">
          <span>✓ {toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="cursor-pointer text-[12px] font-semibold underline"
          >
            닫기
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingSkeleton count={3} />
        </div>
      ) : error ? (
        <div className="mt-8">
          <ErrorBanner message={error} onRetry={loadDashboard} />
        </div>
      ) : (
        <div className="mt-8 grid gap-[24px] lg:grid-cols-12">
          {/* Left 4 Columns: Sticky Notification Inbox & Subscribed Games */}
          <div className="space-y-[24px] lg:col-span-4">
            {/* Notification Inbox */}
            <section className="rounded-[16px] border border-[#E2E5E9] bg-[#F8F9FB] p-[20px]">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[17px] font-bold text-[#15181E]">
                  <span>🔔 인앱 알림함</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#ED1515] px-[8px] py-[2px] text-[11px] font-bold text-white">
                      {unreadCount} 미열람
                    </span>
                  )}
                </h2>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="cursor-pointer text-[13px] font-semibold text-[#0090D4] hover:underline"
                  >
                    전체 읽음 처리
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="mt-4 text-[13px] text-[#717680]">
                  아직 수신된 패치 알림이 없습니다.
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`rounded-[12px] border p-[14px] transition ${
                        notif.isRead
                          ? "border-[#E2E5E9] bg-white/70 text-[#717680]"
                          : "border-[#75DBFF] bg-white text-[#15181E] shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/patches/${notif.patchId}`}
                          className="text-[14px] font-bold text-[#15181E] hover:text-[#0090D4]"
                        >
                          {notif.title}
                        </Link>
                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkSingleRead(notif.id)}
                            className="shrink-0 cursor-pointer rounded-[6px] border border-[#DBDEE3] bg-[#F8F9FB] px-[8px] py-[2px] text-[11px] font-medium text-[#4B515B] hover:border-[#15181E] hover:text-[#15181E]"
                          >
                            읽음
                          </button>
                        )}
                      </div>
                      <p className="mt-1.5 text-[13px] leading-[20px]">
                        {notif.message}
                      </p>
                      {notif.matchedKeywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {notif.matchedKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="rounded-[6px] bg-[#FFFBD8] px-[6px] py-[2px] text-[11px] font-semibold text-[#E28100]"
                            >
                              🎯 #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Subscribed Games Widget */}
            <section className="rounded-[16px] border border-[#E2E5E9] bg-white p-[20px]">
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-[#15181E]">
                  🎮 내 구독 게임 ({subscriptions.length})
                </h2>
                <Link
                  href="/games"
                  className="text-[13px] font-semibold text-[#0090D4] hover:underline"
                >
                  추가/변경 →
                </Link>
              </div>

              {subscriptions.length === 0 ? (
                <p className="mt-4 text-[13px] text-[#717680]">
                  구독 중인 게임이 없습니다. 지원 게임 페이지에서 관심 게임을 등록해 보세요.
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {subscriptions.map((sub) => {
                    const game = gamesMap[sub.gameSlug];
                    return (
                      <li
                        key={sub.id}
                        className="rounded-[12px] border border-[#E2E5E9] bg-[#F8F9FB] p-[14px]"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/games/${sub.gameSlug}`}
                            className="text-[14px] font-bold text-[#15181E] hover:text-[#0090D4]"
                          >
                            {game?.iconUrl ?? "🎮"} {game?.name ?? sub.gameSlug}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleUnsubscribe(sub.gameSlug)}
                            className="cursor-pointer text-[12px] font-medium text-[#ED1515] hover:underline"
                          >
                            구독 해제
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {sub.keywords.length > 0 ? (
                            sub.keywords.map((kw) => (
                              <span
                                key={kw}
                                className="rounded-full bg-[#ECF9FF] px-[8px] py-[2px] text-[11px] font-semibold text-[#0090D4]"
                              >
                                #{kw}
                              </span>
                            ))
                          ) : (
                            <span className="text-[12px] text-[#717680]">
                              전체 패치 수신 중 (키워드 미지정)
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <Link
                            href={`/games/${sub.gameSlug}`}
                            className="text-[12px] font-semibold text-[#4B515B] hover:text-[#15181E] hover:underline"
                          >
                            키워드 편집 →
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Right 8 Columns: Subscribed Games Patch Stream */}
          <div className="lg:col-span-8">
            <h2 className="text-[22px] font-bold text-[#15181E]">
              내 관심 게임 최신 패치노트 ({myPatches.length}건)
            </h2>
            <div className="mt-4">
              {myPatches.length === 0 ? (
                <EmptyState
                  title="구독 중인 게임의 패치노트가 없습니다"
                  description="관심 있는 게임을 구독하면 해당 게임의 최신 패치노트만 이곳에 모아 보여드립니다."
                  actionLabel="지원 게임 둘러보기"
                  actionHref="/games"
                />
              ) : (
                <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2">
                  {myPatches.map((patch) => (
                    <PatchCard
                      key={patch.id}
                      patch={patch}
                      isSubscribed
                      onToggleSubscribe={handleUnsubscribe}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
