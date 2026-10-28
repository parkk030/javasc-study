import Link from "next/link";

export function Footer() {
  return (
    <footer
      id="io-footer-root"
      className="mt-20 border-t border-[#E2E5E9] bg-white py-[56px] pb-[48px] text-[#717680]"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-[32px] px-[24px] lg:flex-row lg:items-end lg:px-[32px]">
        <div>
          <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[6px] text-[14px] leading-[24px] text-[#717680]">
            <span className="font-semibold text-[#15181E]">
              PatchRadar (패치레이더)
            </span>
            <span
              className="inline-block h-[10px] w-px bg-[#E2E5E9]"
              aria-hidden="true"
            />
            <span>게임 패치노트 3줄 요약 &amp; 실시간 Discord 웹훅 알림</span>
            <span
              className="inline-block h-[10px] w-px bg-[#E2E5E9]"
              aria-hidden="true"
            />
            <span>Serverless Web Architecture</span>
          </div>

          <div className="mt-[8px] flex flex-wrap items-center gap-x-[8px] gap-y-[6px] text-[14px] leading-[24px] text-[#717680]">
            <Link href="/" className="hover:text-[#15181E]">
              통합 패치 피드
            </Link>
            <span
              className="inline-block h-[10px] w-px bg-[#E2E5E9]"
              aria-hidden="true"
            />
            <Link href="/games" className="hover:text-[#15181E]">
              지원 게임 디렉터리
            </Link>
            <span
              className="inline-block h-[10px] w-px bg-[#E2E5E9]"
              aria-hidden="true"
            />
            <Link
              href="/settings/notifications"
              className="font-bold text-[#717680] hover:text-[#15181E]"
            >
              Discord 웹훅 설정
            </Link>
            <span
              className="inline-block h-[10px] w-px bg-[#E2E5E9]"
              aria-hidden="true"
            />
            <Link href="/api/health" className="hover:text-[#15181E]">
              서버리스 상태(/api/health)
            </Link>
          </div>
        </div>

        {/* Imweb Signature Right Block */}
        <div className="flex min-w-[168px] flex-col items-start gap-[4px] lg:items-end">
          <p className="m-0 text-[18px] font-semibold leading-[24px] text-[#717680]">
            Start Your Game Life
          </p>
          <p className="m-0 flex items-center gap-[5px] text-[14px] font-normal leading-[24px] text-[#717680]">
            <svg
              width="13"
              height="12"
              viewBox="0 0 13 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.0268 1.32171C10.9481 0.320831 9.11005 0.181613 7.77483 1.02425C7.34784 1.29382 6.95902 1.62402 6.54101 1.93519C6.00175 1.56292 5.51767 1.15638 4.97215 0.864822C2.76073 -0.317114 0.292028 1.02992 0.0751643 3.50949C-0.050463 4.94576 0.648701 6.03823 1.59416 6.98688C3.01541 8.41286 4.48335 9.79251 5.93474 11.1886C6.46006 11.6939 6.57682 11.6952 7.09446 11.1984C8.47671 9.87169 9.87764 8.56307 11.2229 7.1996C11.7511 6.66436 12.235 6.04804 12.5914 5.38882C13.3245 4.0328 13.0329 2.25523 12.0268 1.32171Z"
                fill="#717680"
              />
            </svg>
            <span>PatchRadar Corp.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
