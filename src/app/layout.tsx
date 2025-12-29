import type { Metadata, Viewport } from "next";
import { Zen_Maru_Gothic } from "next/font/google"; // Correct font as per specs
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-maru-gothic",
});

export const metadata: Metadata = {
  title: {
    default: "Hariness | ハリネズミの健康管理アプリ",
    template: "%s | Hariness",
  },
  description: "ハリネズミの日々の体重、食事、排泄、通院記録を簡単に管理できるアプリ。かわいくて使いやすいデザインで、ハリちゃんの健康を見守ります。",
  icons: {
    icon: "/favicon.ico", // Placeholder for now
    apple: "/apple-touch-icon.png", // Placeholder
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FF8C42", // Primary Orange
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // App-like feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${zenMaruGothic.variable} font-sans antialiased text-stone-700 bg-[var(--color-background)]`}
      >
        {children}
      </body>
    </html>
  );
}
