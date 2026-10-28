"use client";

import Link from "next/link";
import type { Game } from "@/domain/types";

export function GameCard({
  game,
  isSubscribed,
  keywords = [],
  onToggleSubscribe,
}: {
  game: Game;
  isSubscribed: boolean;
  keywords?: string[];
  onToggleSubscribe?: (gameSlug: string) => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-[16px] border border-[#E2E5E9] bg-white p-[24px] transition-all duration-200 hover:border-[#BCC0C6] hover:shadow-[10px_20px_30px_0px_rgba(75,81,91,0.08)]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#E2E5E9] bg-[#F8F9FB] text-2xl">
              {game.iconUrl}
            </span>
            <div>
              <span className="inline-block rounded-full bg-[#F8F9FB] px-[8px] py-[2px] text-[11px] font-semibold text-[#717680]">
                {game.genre}
              </span>
              <Link href={`/games/${game.slug}`}>
                <h3 className="mt-0.5 text-[18px] font-bold leading-[24px] text-[#15181E] hover:text-[#0090D4]">
                  {game.name}
                </h3>
              </Link>
            </div>
          </div>

          <span className="rounded-[6px] bg-[#ECF9FF] px-[8px] py-[4px] font-mono text-[12px] font-semibold text-[#0090D4]">
            {game.currentVersion}
          </span>
        </div>

        <p className="mt-3.5 text-[14px] leading-[22px] text-[#717680]">
          {game.description}
        </p>

        <div className="mt-4 rounded-[10px] bg-[#F8F9FB] p-[12px] text-[12px] leading-[20px] text-[#4B515B]">
          <p>🗓️ 패치 주기: {game.patchCycleLabel}</p>
          <p className="mt-0.5">
            👥 알림 구독자:{" "}
            <strong className="font-semibold text-[#15181E]">
              {game.subscriberCount.toLocaleString()}명
            </strong>
          </p>
        </div>

        {isSubscribed && keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-[#ECF9FF] px-[8px] py-[2px] text-[11px] font-semibold text-[#0090D4]"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#E2E5E9] pt-4">
        <Link
          href={`/games/${game.slug}`}
          className="text-[13px] font-semibold text-[#4B515B] hover:text-[#15181E]"
        >
          패치 허브 &amp; 키워드 설정 →
        </Link>

        {onToggleSubscribe && (
          <button
            type="button"
            onClick={() => onToggleSubscribe(game.slug)}
            className={`cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-semibold transition ${
              isSubscribed
                ? "border border-[#9AFF92] bg-[#E8FFE4] text-[#00B505] hover:bg-[#CBFFC5]"
                : "bg-[#15181E] text-white hover:bg-[#24282F]"
            }`}
          >
            {isSubscribed ? "✓ 구독 중" : "+ 알림 구독"}
          </button>
        )}
      </div>
    </div>
  );
}
