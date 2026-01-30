import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "日本新品追蹤系統",
  description: "追蹤日本連鎖餐飲與超商的最新商品資訊，提供即時的新品發售通知與詳盡的產品資料。",
  keywords: "日本, 新品, 追蹤, 連鎖餐廳, 超商, 商品, 美食",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifJP.variable} ${notoSansJP.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
