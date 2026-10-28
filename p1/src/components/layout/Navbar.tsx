"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  microBadge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "통합 패치노트" },
  { href: "/games", label: "지원 게임" },
  { href: "/dashboard", label: "내 구독 · 알림함" },
  { href: "/settings/notifications", label: "웹훅 연동", microBadge: "무료" },
  { href: "/admin/patches", label: "자동 크롤링 모니터", microBadge: "AUTO" },
];

export function Navbar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let active = true;
    async function loadUnreadCount() {
      try {
        await fetch("/api/crawler/sync?auto=1", { cache: "no-store" });
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          success: boolean;
          meta?: { unreadCount?: number };
        };
        if (active && json.success && typeof json.meta?.unreadCount === "number") {
          setUnreadCount(json.meta.unreadCount);
        }
      } catch {
        // Ignore transient header badge fetch errors
      }
    }
    void loadUnreadCount();
    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E5E9] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[56px] max-w-[2400px] flex-wrap items-center justify-between gap-4 px-[16px] py-2 lg:h-[72px] lg:px-[32px] lg:py-0">
        {/* Left: Imweb-style Wordmark + 32px gap Navigation */}
        <div className="flex flex-wrap items-center gap-[24px] lg:gap-[40px]">
          <Link
            href="/"
            aria-label="PatchRadar 홈"
            className="flex items-center gap-1.5 text-[#15181E] no-underline"
          >
            <span className="text-[22px] font-extrabold tracking-tight text-[#15181E]">
              patchradar
            </span>
            <span
              className="inline-block h-2 w-2 rounded-full bg-[#00B9FF]"
              aria-hidden="true"
            />
          </Link>

          <nav aria-label="메인 네비게이션">
            <ul className="m-0 flex flex-wrap items-center gap-[16px] p-0 lg:gap-[32px]">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);

                return (
                  <li key={item.href} className="list-none">
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-[6px] py-[8px] text-[15px] leading-[24px] transition-colors lg:py-[24px] lg:text-[16px] ${
                        isActive
                          ? "font-semibold text-[#15181E]"
                          : "font-normal text-[#15181E] hover:text-[#717680]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.microBadge && (
                        <span
                          className="inline-block rounded-full px-[6px] py-[4px] text-[11px] font-semibold leading-[12px]"
                          style={{
                            color: "#FF52C4",
                            backgroundColor: "#FF52C41A",
                          }}
                        >
                          {item.microBadge}
                        </span>
                      )}
                      {item.href === "/dashboard" && unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center rounded-full bg-[#ED1515] px-[6px] py-[3px] text-[11px] font-semibold leading-[12px] text-white">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Right: Imweb Outlined Login + Primary Solid CTA */}
        <div className="flex items-center gap-[12px]">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-[8px] border border-[#DBDEE3] bg-white px-[14px] py-[8px] text-[14px] font-medium leading-[20px] text-[#15181E] transition hover:border-[#15181E] hover:bg-[#F8F9FB]"
          >
            로그인
          </Link>
          <Link
            href="/games"
            className="inline-flex items-center justify-center rounded-[8px] bg-[#15181E] px-[16px] py-[8px] text-[14px] font-semibold leading-[20px] text-white transition hover:bg-[#24282F]"
          >
            무료로 알림 시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}
