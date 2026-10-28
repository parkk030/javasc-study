"use client";

import Link from "next/link";
import { useState } from "react";
import { DEMO_USERS } from "@/lib/auth";

export default function LoginPage() {
  const [selectedId, setSelectedId] = useState<string>("user-gamer-1");
  const users = Object.values(DEMO_USERS);

  return (
    <main className="mx-auto max-w-[540px] px-[20px] py-[72px]">
      <div className="shadow-clay-layer rounded-[16px] border border-[#E2E5E9] bg-white p-[32px]">
        <span className="inline-block rounded-full bg-[#ECF9FF] px-[10px] py-[4px] text-[12px] font-semibold text-[#0090D4]">
          PatchRadar Serverless Auth
        </span>
        <h1 className="mt-4 text-[26px] font-bold leading-[34px] text-[#15181E]">
          게이머 / 관리자 계정 전환
        </h1>
        <p className="mt-2 text-[14px] leading-[22px] text-[#717680]">
          로컬 하네스 및 데모 환경에서는 별도의 외부 OAuth 키 없이 즉시 게이머 구독 기능과 관리자 패치 발송 기능을 체험할 수 있습니다.
        </p>

        <div className="mt-6 space-y-3">
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedId(u.id)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-[12px] border p-[16px] text-left transition ${
                selectedId === u.id
                  ? "border-[#15181E] bg-[#F8F9FB]"
                  : "border-[#E2E5E9] bg-white hover:border-[#BCC0C6]"
              }`}
            >
              <div>
                <p className="text-[15px] font-bold text-[#15181E]">
                  {u.displayName}{" "}
                  <span className="ml-1.5 rounded-full bg-[#ECF9FF] px-[8px] py-[2px] text-[11px] font-semibold uppercase text-[#0090D4]">
                    {u.role}
                  </span>
                </p>
                <p className="mt-0.5 text-[13px] text-[#717680]">{u.email}</p>
              </div>
              <span className="text-[13px] font-semibold text-[#15181E]">
                {selectedId === u.id ? "✓ 활성 계정" : "선택"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="flex-1 rounded-[8px] bg-[#15181E] py-[12px] text-center text-[14px] font-semibold text-white transition hover:bg-[#24282F]"
          >
            내 구독 대시보드로 이동 →
          </Link>
          <Link
            href="/admin/patches"
            className="flex-1 rounded-[8px] border border-[#DBDEE3] bg-white py-[12px] text-center text-[14px] font-semibold text-[#15181E] transition hover:border-[#15181E] hover:bg-[#F8F9FB]"
          >
            관리자 패치 등록 페이지 →
          </Link>
        </div>
      </div>
    </main>
  );
}
