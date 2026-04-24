import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 検索用メタデータ
export const metadata: Metadata = {
  title: "D-Forma+ | 無料のアイドル・ダンスフォーメーション作成ツール",
  description:
    "ブラウザで動く無料のアイドル・ダンスフォーメーションシミュレーター。専用コードを書くだけで、ステージの立ち位置や移動の軌跡を直感的に作成・プレビューできます。",
  keywords: [
    "フォーメーション",
    "アイドル",
    "ダンス",
    "立ち位置",
    "シミュレーター",
    "作成ツール",
    "無料",
    "エディタ",
  ],

  // Googlr Search Consoleの所有権確認
  verification: {
    google: "cN-sLcDfm2pR7S-ayR1EKNcLWU4nO5gFx1pO6vX0mgk",
  },

  // URLをSNSでシェアした時の見栄えを設定
  openGraph: {
    title: "D-Forma+ | アイドルフォーメーション作成エディタ",
    description:
      "ブラウザ上で動く無料のフォーメーションシミュレーター。立ち位置や移動を直感的にプレビュー！",
    url: "https://d-forma-plus.vercel.app",
    siteName: "D-Forma+",
    locale: "ja_JP",
    type: "website",
  },

  // Xでシェアした時のカード設定
  twitter: {
    card: "summary_large_image",
    title: "D-Forma+ | アイドルフォーメーション作成エディタ",
    description:
      "ブラウザ上で動く無料のフォーメーションシミュレーター。立ち位置や移動を直感的にプレビュー！",
  },
};

// HTMLの骨組み
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
