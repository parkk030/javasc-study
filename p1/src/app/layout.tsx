import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PatchRadar — 패치 확인이 쉬운 사이트",
  description:
    "클릭 몇 번으로 내가 하는 게임의 패치노트 3줄 요약, 버프/너프 분석, Discord 실시간 알림까지. 게임 패치 관리는 패치레이더 하나면 충분해요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-clay-theme="light-only">
      <body className="flex min-h-screen flex-col bg-white text-[#15181E] antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
