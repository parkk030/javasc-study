"use client";

import Link from "next/link";
import type { Patch, PatchChangeCounts } from "@/domain/types";
import { CategoryBadge } from "@/components/ui/StateViews";

export interface PatchWithCounts extends Patch {
  changeCounts?: PatchChangeCounts;
}

export function PatchCard({
  patch,
  isSubscribed,
  onToggleSubscribe,
  highlightKeyword,
}: {
  patch: PatchWithCounts;
  isSubscribed?: boolean;
  onToggleSubscribe?: (gameSlug: string) => void;
  highlightKeyword?: string;
}) {
  const buffCount =
    patch.changeCounts?.buff ??
    patch.changes.filter((c) => c.type === "buff").length;
  const nerfCount =
    patch.changeCounts?.nerf ??
    patch.changes.filter((c) => c.type === "nerf").length;
  const bugfixCount =
    patch.changeCounts?.bugfix ??
    patch.changes.filter((c) => c.type === "bugfix").length;

  const formattedDate = new Date(patch.publishedAt).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const targetSummary = patch.changes
    .slice(0, 3)
    .map((c) => c.target)
    .join(", ");

  return (
    <article className="group flex h-full flex-col justify-between rounded-[14px] border border-[#E2E5E9] bg-white p-[18px] transition-all duration-200 hover:border-[#BCC0C6] hover:shadow-[8px_16px_24px_0px_rgba(75,81,91,0.08)]">
      <div>
        {/* Top Compact Row: Game + Version + Category on Left, Subscribe on Right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-[6px]">
            <Link
              href={`/games/${patch.gameSlug}`}
              className="inline-flex shrink-0 items-center rounded-[6px] bg-[#F8F9FB] px-[8px] py-[3px] text-[12px] font-bold text-[#15181E] transition hover:bg-[#E2E5E9]/60"
            >
              {patch.gameName}
            </Link>
            <span className="shrink-0 rounded-[6px] bg-[#ECF9FF] px-[7px] py-[2px] font-mono text-[11px] font-semibold text-[#0090D4]">
              {patch.version}
            </span>
            <CategoryBadge category={patch.category} />
            <span className="inline-flex shrink-0 items-center rounded-[5px] bg-[#E8FFE4] px-[6px] py-[2px] text-[10px] font-semibold text-[#028907]">
              ⚡ 자동수집
            </span>
          </div>

          {onToggleSubscribe && (
            <button
              type="button"
              onClick={() => onToggleSubscribe(patch.gameSlug)}
              className={`shrink-0 cursor-pointer rounded-[6px] px-[9px] py-[4px] text-[11px] font-semibold transition ${
                isSubscribed
                  ? "border border-[#9AFF92] bg-[#E8FFE4] text-[#00B505] hover:bg-[#CBFFC5]"
                  : "border border-[#DBDEE3] bg-white text-[#15181E] hover:border-[#15181E] hover:bg-[#F8F9FB]"
              }`}
            >
              {isSubscribed ? "✓ 구독 중" : "+ 알림 받기"}
            </button>
          )}
        </div>

        {/* Title & Single-line Maintenance Meta */}
        <Link href={`/patches/${patch.id}`} className="mt-2.5 block">
          <h2 className="line-clamp-1 text-[16px] font-bold leading-[22px] text-[#15181E] transition group-hover:text-[#0090D4]">
            {patch.title}
          </h2>
        </Link>

        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[#717680]">
          <span className="truncate">
            ⏰ {patch.maintenanceWindow ?? "정기 점검 종료 기준 자동 크롤링"}
          </span>
          <span className="shrink-0 text-[#9FA3AB]">{formattedDate}</span>
        </div>

        {/* Compact AI 3-Line Summary Box */}
        <div className="mt-2.5 rounded-[10px] border border-[#E2E5E9] bg-[#F8F9FB] px-[12px] py-[10px]">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00B9FF]" />
              <span className="text-[11px] font-bold text-[#15181E]">
                AI 핵심 요약
              </span>
              <span
                className="rounded-full px-[5px] py-[1px] text-[9px] font-semibold"
                style={{ color: "#A500E6", backgroundColor: "#F9E2FF" }}
              >
                TL;DR
              </span>
            </div>
            <a
              href={patch.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-[#717680] hover:text-[#0090D4] hover:underline"
            >
              공식 원문 ↗
            </a>
          </div>

          <ul className="mt-1.5 space-y-1 text-[12.5px] leading-[18px] text-[#4B515B]">
            {patch.tldr.slice(0, 2).map((line, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[11px] font-bold text-[#0090D4]">•</span>
                <span className="line-clamp-1">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Compact Horizontal Bar */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#F1F3F5] pt-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-[5px] text-[11px]">
          {buffCount > 0 && (
            <span className="rounded-[5px] bg-[#E8FFE4] px-[6px] py-[2px] font-semibold text-[#00B505]">
              🔺{buffCount}
            </span>
          )}
          {nerfCount > 0 && (
            <span className="rounded-[5px] bg-[#FFEEEE] px-[6px] py-[2px] font-semibold text-[#ED1515]">
              🔻{nerfCount}
            </span>
          )}
          {bugfixCount > 0 && (
            <span className="rounded-[5px] bg-[#ECF9FF] px-[6px] py-[2px] font-semibold text-[#0090D4]">
              🛠️{bugfixCount}
            </span>
          )}
          {targetSummary && (
            <span className="max-w-[150px] truncate text-[11px] text-[#717680]">
              대상: <strong className="font-medium text-[#15181E]">{targetSummary}</strong>
            </span>
          )}
          {highlightKeyword && (
            <span className="rounded-[5px] bg-[#FFFBD8] px-[6px] py-[2px] font-semibold text-[#E28100]">
              🎯 {highlightKeyword}
            </span>
          )}
        </div>

        <Link
          href={`/patches/${patch.id}`}
          className="shrink-0 text-[12px] font-semibold text-[#15181E] hover:text-[#0090D4]"
        >
          상세 보기 →
        </Link>
      </div>
    </article>
  );
}
