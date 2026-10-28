"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  Patch,
  PatchChangeCounts,
  PatchChangeType,
} from "@/domain/types";
import {
  CategoryBadge,
  ChangeTypeBadge,
  EmptyState,
  ErrorBanner,
  LoadingSkeleton,
} from "@/components/ui/StateViews";

const SECTION_TABS: Array<{ value: "all" | PatchChangeType; label: string }> = [
  { value: "all", label: "전체 변경점" },
  { value: "buff", label: "🔺 상향 (Buff)" },
  { value: "nerf", label: "🔻 하향 (Nerf)" },
  { value: "adjusted", label: "🔄 조정 (Adjusted)" },
  { value: "bugfix", label: "🛠️ 버그 수정" },
  { value: "new", label: "🎉 신규 콘텐츠" },
];

export default function PatchDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [patch, setPatch] = useState<Patch | null>(null);
  const [counts, setCounts] = useState<PatchChangeCounts | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | PatchChangeType>("all");
  const [targetSearch, setTargetSearch] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/patches/${encodeURIComponent(id)}`);
      if (!res.ok) {
        throw new Error("요청한 패치노트 상세 정보를 찾을 수 없습니다.");
      }
      const json = (await res.json()) as {
        data: { patch: Patch; changeCounts: PatchChangeCounts };
      };
      setPatch(json.data.patch);
      setCounts(json.data.changeCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "패치노트 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadPatchDetail();
  }, [loadPatchDetail]);

  if (loading) {
    return (
      <main className="mx-auto max-w-[1040px] px-[24px] py-[56px]">
        <LoadingSkeleton count={2} />
      </main>
    );
  }

  if (error || !patch) {
    return (
      <main className="mx-auto max-w-[1040px] px-[24px] py-[56px]">
        <ErrorBanner
          message={error ?? "패치노트를 찾을 수 없습니다."}
          onRetry={loadPatchDetail}
        />
        <Link
          href="/"
          className="mt-4 inline-block text-[14px] font-semibold text-[#0090D4]"
        >
          ← 통합 패치 피드로 돌아가기
        </Link>
      </main>
    );
  }

  const filteredChanges = patch.changes.filter((change) => {
    if (activeTab !== "all" && change.type !== activeTab) {
      return false;
    }
    if (targetSearch.trim()) {
      const q = targetSearch.toLowerCase();
      return (
        change.target.toLowerCase().includes(q) ||
        change.summary.toLowerCase().includes(q) ||
        (change.details?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  return (
    <main className="mx-auto max-w-[1040px] px-[20px] py-[48px] lg:px-[32px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/games/${patch.gameSlug}`}
          className="text-[14px] font-medium text-[#717680] hover:text-[#15181E]"
        >
          ← {patch.gameName} 패치 허브로 돌아가기
        </Link>
        <a
          href={patch.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-[8px] border border-[#DBDEE3] bg-white px-[14px] py-[8px] text-[13px] font-semibold text-[#15181E] transition hover:border-[#15181E] hover:bg-[#F8F9FB]"
        >
          공식 패치노트 원문 보기 ↗
        </a>
      </div>

      {/* Patch Header Card */}
      <section className="mt-4 rounded-[16px] border border-[#E2E5E9] bg-white p-[28px] shadow-xs sm:p-[36px]">
        <div className="flex flex-wrap items-center gap-[8px]">
          <Link
            href={`/games/${patch.gameSlug}`}
            className="rounded-[8px] bg-[#F8F9FB] px-[10px] py-[4px] text-[13px] font-bold text-[#15181E]"
          >
            {patch.gameName}
          </Link>
          <span className="rounded-[6px] bg-[#ECF9FF] px-[10px] py-[3px] font-mono text-[13px] font-bold text-[#0090D4]">
            {patch.version}
          </span>
          <CategoryBadge category={patch.category} />
          <span className="text-[13px] text-[#9FA3AB]">
            배포 일시: {new Date(patch.publishedAt).toLocaleString("ko-KR")}
          </span>
        </div>

        <h1 className="mt-4 text-[26px] font-bold leading-[34px] tracking-[-0.02em] text-[#15181E] sm:text-[32px] sm:leading-[42px]">
          {patch.title}
        </h1>

        {patch.maintenanceWindow && (
          <div className="mt-4 rounded-[10px] border border-[#FFEE85] bg-[#FFFBD8] px-[14px] py-[10px] text-[13px] font-semibold text-[#E28100]">
            ⏰ 서버 점검 안내: {patch.maintenanceWindow}
          </div>
        )}

        {/* Imweb AI TL;DR Box */}
        <div className="mt-6 rounded-[12px] border border-[#E2E5E9] bg-[#F8F9FB] p-[20px]">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#00B9FF]" />
            <h2 className="text-[13px] font-bold text-[#15181E]">
              패치레이더 AI 3줄 핵심 요약
            </h2>
            <span
              className="rounded-full px-[6px] py-[2px] text-[10px] font-semibold"
              style={{ color: "#A500E6", backgroundColor: "#F9E2FF" }}
            >
              TL;DR
            </span>
          </div>
          <ul className="mt-3 space-y-2 text-[15px] leading-[24px] text-[#4B515B]">
            {patch.tldr.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="font-bold text-[#0090D4]">{idx + 1}.</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clay Semantic Summary Counters */}
        {counts && (
          <div className="mt-5 grid grid-cols-2 gap-[12px] sm:grid-cols-5">
            <div className="rounded-[12px] border border-[#9AFF92] bg-[#E8FFE4] p-[14px] text-center">
              <p className="text-[12px] font-semibold text-[#028907]">
                🔺 상향 (Buff)
              </p>
              <p className="mt-1 text-[22px] font-bold text-[#00B505]">
                {counts.buff}
              </p>
            </div>
            <div className="rounded-[12px] border border-[#FFC5C5] bg-[#FFEEEE] p-[14px] text-center">
              <p className="text-[12px] font-semibold text-[#C80D0D]">
                🔻 하향 (Nerf)
              </p>
              <p className="mt-1 text-[22px] font-bold text-[#ED1515]">
                {counts.nerf}
              </p>
            </div>
            <div className="rounded-[12px] border border-[#FFEE85] bg-[#FFFBD8] p-[14px] text-center">
              <p className="text-[12px] font-semibold text-[#BB5902]">🔄 조정</p>
              <p className="mt-1 text-[22px] font-bold text-[#E28100]">
                {counts.adjusted}
              </p>
            </div>
            <div className="rounded-[12px] border border-[#B6EAFF] bg-[#ECF9FF] p-[14px] text-center">
              <p className="text-[12px] font-semibold text-[#0072AB]">
                🛠️ 버그수정
              </p>
              <p className="mt-1 text-[22px] font-bold text-[#0090D4]">
                {counts.bugfix}
              </p>
            </div>
            <div className="rounded-[12px] border border-[#F2CCFF] bg-[#F9E2FF] p-[14px] text-center">
              <p className="text-[12px] font-semibold text-[#810F99]">🎉 신규</p>
              <p className="mt-1 text-[22px] font-bold text-[#A500E6]">
                {counts.new}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Real-time Target Filter & Buff/Nerf Section Tabs */}
      <section className="mt-8">
        <div className="flex flex-col justify-between gap-4 rounded-[12px] border border-[#E2E5E9] bg-[#F8F9FB] p-[14px] sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-[6px]">
            {SECTION_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`cursor-pointer rounded-[8px] px-[12px] py-[7px] text-[13px] font-semibold transition ${
                  activeTab === tab.value
                    ? "bg-[#15181E] text-white"
                    : "text-[#4B515B] hover:bg-white hover:text-[#15181E]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={targetSearch}
            onChange={(e) => setTargetSearch(e.target.value)}
            placeholder="본문 내 챔피언/무기 검색..."
            className="rounded-[8px] border border-[#DBDEE3] bg-white px-[12px] py-[8px] text-[13px] text-[#15181E] placeholder-[#9FA3AB] focus:border-[#15181E] focus:outline-none sm:w-64"
          />
        </div>

        <div className="mt-5 space-y-3">
          {filteredChanges.length === 0 ? (
            <EmptyState
              title="해당 조건의 변경 내역이 없습니다"
              description="탭 필터나 본문 검색어를 변경해 보세요."
              actionLabel="전체 변경점 보기"
              onActionClick={() => {
                setActiveTab("all");
                setTargetSearch("");
              }}
            />
          ) : (
            filteredChanges.map((change, idx) => (
              <div
                key={`${change.target}-${idx}`}
                className="rounded-[16px] border border-[#E2E5E9] bg-white p-[20px] transition hover:border-[#BCC0C6]"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <ChangeTypeBadge type={change.type} />
                  <h3 className="text-[17px] font-bold text-[#15181E]">
                    {change.target}
                  </h3>
                </div>
                <p className="mt-2 text-[15px] font-medium leading-[24px] text-[#24282F]">
                  {change.summary}
                </p>
                {change.details && (
                  <p className="mt-1.5 text-[13px] leading-[20px] text-[#717680]">
                    💡 개발자 코멘트: {change.details}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
