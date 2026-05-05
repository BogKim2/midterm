import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FridgeChef — 냉장고 재료로 오늘의 식단을",
  description: "보유 재료 기반 레시피 추천, 식단 생성, 장보기 목록 자동화. 로컬 SQLite 기반 무료 앱.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${cormorant.variable} antialiased`}>
      <body className="min-h-screen bg-[#faf9f5] text-[#141413] font-sans">
        {children}
      </body>
    </html>
  );
}
