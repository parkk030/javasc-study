"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { NotificationChannel } from "@/domain/types";
import { ErrorBanner, LoadingSkeleton } from "@/components/ui/StateViews";

export default function NotificationSettingsPage() {
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState<string>("");
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [webPushEnabled, setWebPushEnabled] = useState<boolean>(true);
  const [onlyKeywordMatch, setOnlyKeywordMatch] = useState<boolean>(false);
  const [testGameSlug, setTestGameSlug] = useState<string>("league-of-legends");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const loadChannelSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications/channels");
      if (!res.ok) throw new Error("알림 채널 설정을 불러오지 못했습니다.");
      const json = (await res.json()) as { data: NotificationChannel };
      const ch = json.data;
      setDiscordWebhookUrl(ch.discordWebhookUrl ?? "");
      setEmailEnabled(ch.emailEnabled);
      setWebPushEnabled(ch.webPushEnabled);
      setOnlyKeywordMatch(ch.onlyKeywordMatch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "설정 로드 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChannelSettings();
  }, [loadChannelSettings]);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setStatusBanner(null);

    try {
      const res = await fetch("/api/notifications/channels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordWebhookUrl: discordWebhookUrl.trim(),
          emailEnabled,
          webPushEnabled,
          onlyKeywordMatch,
        }),
      });

      const json = (await res.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ?? "알림 설정 저장 중 오류가 발생했습니다."
        );
      }

      setStatusBanner(
        "알림 수신 채널 및 조건 설정이 성공적으로 저장되었습니다!"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTestNotification() {
    setTesting(true);
    setError(null);
    setStatusBanner(null);

    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug: testGameSlug,
          discordWebhookUrl: discordWebhookUrl.trim() || undefined,
        }),
      });

      const json = (await res.json()) as {
        success: boolean;
        data?: {
          webhookResult?: {
            delivered: boolean;
            mode: string;
            message: string;
          } | null;
        };
        error?: { message?: string };
      };

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ?? "테스트 알림 발송에 실패했습니다."
        );
      }

      const webhookMsg = json.data?.webhookResult
        ? ` (Discord 웹훅 전송 완료: ${json.data.webhookResult.mode})`
        : " (인앱 알림함에 도착 완료)";
      setStatusBanner(
        `⚡ 테스트 패치노트 알림이 즉시 발송되었습니다!${webhookMsg}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "테스트 발송 실패");
    } finally {
      setTesting(false);
    }
  }

  return (
    <main className="mx-auto max-w-[920px] px-[20px] py-[56px] lg:px-[32px]">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2E5E9] pb-[28px]">
        <div>
          <span className="inline-block rounded-full bg-[#ECF9FF] px-[10px] py-[4px] text-[12px] font-semibold text-[#0090D4]">
            NOTIFICATION CHANNELS
          </span>
          <h1 className="mt-3 text-[28px] font-bold leading-[36px] tracking-[-0.025em] text-[#15181E] sm:text-[36px] sm:leading-[44px]">
            알림 채널 연동 &amp; 수신 조건 설정
          </h1>
          <p className="mt-2 text-[16px] leading-[24px] text-[#717680]">
            디스코드(Discord) 웹훅, 이메일, 인앱 푸시 알림 연동 및 키워드 매칭 조건을 설정하세요.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-[8px] border border-[#DBDEE3] bg-white px-[14px] py-[9px] text-[14px] font-medium text-[#15181E] hover:border-[#15181E] hover:bg-[#F8F9FB]"
        >
          ← 내 구독 대시보드로 이동
        </Link>
      </div>

      {statusBanner && (
        <div className="mt-6 rounded-[12px] border border-[#9AFF92] bg-[#E8FFE4] p-[16px] text-[14px] font-medium text-[#028907]">
          ✓ {statusBanner}
        </div>
      )}

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} onRetry={loadChannelSettings} />
        </div>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingSkeleton count={2} />
        </div>
      ) : (
        <div className="mt-8 space-y-[24px]">
          <form
            onSubmit={handleSaveSettings}
            className="space-y-6 rounded-[16px] border border-[#E2E5E9] bg-white p-[28px] shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-[#15181E]">
                  💬 채널 1: Discord 웹훅(Webhook) 연동
                </h2>
                <span
                  className="rounded-full px-[6px] py-[2px] text-[11px] font-semibold"
                  style={{ color: "#FF52C4", backgroundColor: "#FF52C41A" }}
                >
                  인기
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-[20px] text-[#717680]">
                디스코드 채널 설정 → 연동 → 웹후크에서 생성한 URL을 입력하면 새 패치노트 요약을 디스코드 임베드 카드로 즉시 전송합니다.
              </p>
              <input
                type="url"
                value={discordWebhookUrl}
                onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/1234567890/your_webhook_token"
                className="mt-3 w-full rounded-[8px] border border-[#DBDEE3] bg-[#F8F9FB] px-[14px] py-[11px] font-mono text-[13px] text-[#15181E] placeholder-[#9FA3AB] focus:border-[#15181E] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="border-t border-[#E2E5E9] pt-6">
              <h2 className="text-[18px] font-bold text-[#15181E]">
                📲 채널 2: 기본 알림 채널 &amp; 필터 조건
              </h2>
              <div className="mt-4 space-y-3 text-[14px] text-[#4B515B]">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={webPushEnabled}
                    onChange={(e) => setWebPushEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-[#DBDEE3] text-[#15181E]"
                  />
                  <span>
                    웹 푸시 및 인앱 알림함(Notification Inbox) 수신 활성화
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-[#DBDEE3] text-[#15181E]"
                  />
                  <span>이메일 패치노트 3줄 요약 뉴스레터 수신 활성화</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={onlyKeywordMatch}
                    onChange={(e) => setOnlyKeywordMatch(e.target.checked)}
                    className="h-4 w-4 rounded border-[#DBDEE3] text-[#15181E]"
                  />
                  <span>
                    내가 등록한{" "}
                    <strong className="font-semibold text-[#15181E]">
                      관심 키워드(챔피언/무기/직업)
                    </strong>
                    가 포함된 패치일 때만 알림 받기
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#E2E5E9] pt-6">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer rounded-[8px] bg-[#15181E] px-[20px] py-[11px] text-[14px] font-semibold text-white transition hover:bg-[#24282F] disabled:opacity-50"
              >
                {saving ? "저장 중..." : "알림 채널 설정 저장"}
              </button>
            </div>
          </form>

          {/* Instant Test Notification Card */}
          <section className="rounded-[16px] border border-[#B6EAFF] bg-[#ECF9FF] p-[28px]">
            <h2 className="text-[18px] font-bold text-[#15181E]">
              ⚡ 서버리스 실시간 알림 발송 테스트
            </h2>
            <p className="mt-1 text-[14px] text-[#4B515B]">
              연동된 Discord 웹훅과 인앱 알림함으로 즉시 샘플 패치노트 알림을 발송하여 정상 작동 여부를 검증합니다.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={testGameSlug}
                onChange={(e) => setTestGameSlug(e.target.value)}
                className="rounded-[8px] border border-[#DBDEE3] bg-white px-[14px] py-[10px] text-[14px] text-[#15181E]"
              >
                <option value="league-of-legends">
                  리그 오브 레전드 (v14.20)
                </option>
                <option value="valorant">발로란트 (v9.08)</option>
                <option value="lost-ark">로스트아크 (카제로스 2막)</option>
                <option value="pubg">배틀그라운드 (v32.1)</option>
                <option value="overwatch-2">오버워치 2 (시즌 13.1)</option>
                <option value="maplestory">메이플스토리 (v1.2.396)</option>
              </select>

              <button
                type="button"
                disabled={testing}
                onClick={handleSendTestNotification}
                className="cursor-pointer rounded-[8px] bg-[#0090D4] px-[18px] py-[10px] text-[14px] font-semibold text-white transition hover:bg-[#0072AB] disabled:opacity-50"
              >
                {testing ? "발송 중..." : "⚡ 지금 테스트 패치 알림 보내기"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
