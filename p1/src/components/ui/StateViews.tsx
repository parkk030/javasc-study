import Link from "next/link";
import type { PatchCategory, PatchChangeType } from "@/domain/types";

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-[16px] md:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="데이터 로딩 중"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-[14px] border border-[#E2E5E9] bg-[#F8F9FB] p-[18px]"
        >
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded-[6px] bg-[#E2E5E9]" />
            <div className="h-4 w-14 rounded-[6px] bg-[#E2E5E9]" />
          </div>
          <div className="mt-3 h-5 w-3/4 rounded-[6px] bg-[#E2E5E9]" />
          <div className="mt-2.5 space-y-1.5">
            <div className="h-3.5 w-full rounded-[4px] bg-[#E2E5E9]/70" />
            <div className="h-3.5 w-5/6 rounded-[4px] bg-[#E2E5E9]/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}) {
  return (
    <div className="rounded-[16px] border border-[#E2E5E9] bg-[#F8F9FB] p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
        🔍
      </div>
      <h3 className="mt-4 text-[18px] font-bold leading-[24px] text-[#15181E]">
        {title}
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-[14px] leading-[24px] text-[#717680]">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center rounded-[8px] bg-[#15181E] px-[16px] py-[10px] text-[14px] font-semibold text-white transition hover:bg-[#24282F]"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onActionClick && !actionHref && (
        <button
          type="button"
          onClick={onActionClick}
          className="mt-5 inline-flex cursor-pointer items-center rounded-[8px] bg-[#15181E] px-[16px] py-[10px] text-[14px] font-semibold text-white transition hover:bg-[#24282F]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start justify-between gap-4 rounded-[12px] border border-[#FF4040]/40 bg-[#FFEEEE] p-5 text-[#15181E] sm:flex-row sm:items-center"
    >
      <div>
        <p className="text-[14px] font-bold text-[#ED1515]">⚠️ 요청 처리 오류</p>
        <p className="mt-1 text-[14px] leading-[22px] text-[#4B515B]">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-[8px] border border-[#ED1515]/30 bg-white px-[14px] py-[8px] text-[13px] font-semibold text-[#ED1515] transition hover:bg-[#FFDFDF]"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

export function CategoryBadge({ category }: { category: PatchCategory }) {
  const styles: Record<PatchCategory, { label: string; className: string }> = {
    regular: {
      label: "정기 패치",
      className: "bg-[#ECF9FF] text-[#0090D4] border-[#B6EAFF]",
    },
    balance: {
      label: "밸런스 조정",
      className: "bg-[#F9E2FF] text-[#A500E6] border-[#F2CCFF]",
    },
    hotfix: {
      label: "긴급 핫픽스",
      className: "bg-[#FFEEEE] text-[#ED1515] border-[#FFC5C5]",
    },
    maintenance: {
      label: "서버 점검",
      className: "bg-[#FFFBD8] text-[#E28100] border-[#FFEE85]",
    },
  };

  const config = styles[category];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-[10px] py-[2px] text-[12px] font-semibold leading-[18px] ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function ChangeTypeBadge({ type }: { type: PatchChangeType }) {
  const styles: Record<PatchChangeType, { label: string; className: string }> = {
    buff: {
      label: "🔺 상향 (Buff)",
      className: "bg-[#E8FFE4] text-[#00B505] border-[#9AFF92]",
    },
    nerf: {
      label: "🔻 하향 (Nerf)",
      className: "bg-[#FFEEEE] text-[#ED1515] border-[#FFC5C5]",
    },
    adjusted: {
      label: "🔄 조정 (Adjusted)",
      className: "bg-[#FFFBD8] text-[#E28100] border-[#FFEE85]",
    },
    bugfix: {
      label: "🛠️ 버그 수정",
      className: "bg-[#ECF9FF] text-[#0090D4] border-[#B6EAFF]",
    },
    new: {
      label: "🎉 신규 콘텐츠",
      className: "bg-[#F9E2FF] text-[#A500E6] border-[#F2CCFF]",
    },
  };

  const config = styles[type];
  return (
    <span
      className={`inline-flex items-center rounded-[6px] border px-[8px] py-[3px] text-[12px] font-semibold leading-[16px] ${config.className}`}
    >
      {config.label}
    </span>
  );
}
