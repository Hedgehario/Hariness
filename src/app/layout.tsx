import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Zen_Maru_Gothic } from 'next/font/google'; // Correct font as per specs

import { SplashScreen } from '@/components/splash/splash-screen';

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-zen-maru-gothic',
});

export const metadata: Metadata = {
  title: {
    default: 'Hariness | ハリネズミの健康管理アプリ',
    template: '%s | Hariness',
  },
  description:
    'ハリネズミの日々の体重、食事、排泄、通院記録を簡単に管理できるアプリ。かわいくて使いやすいデザインで、ハリちゃんの健康を見守ります。',
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  // OGP (Open Graph Protocol) - LINE, Facebook等で表示
  openGraph: {
    title: 'Hariness | ハリネズミの健康管理アプリ',
    description:
      'ハリネズミの日々の体重、食事、排泄、通院記録を簡単に管理。かわいくて使いやすいデザインで、ハリちゃんの健康を見守ります。',
    url: 'https://hariness.app',
    siteName: 'Hariness',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Hariness - ハリネズミ健康管理アプリ',
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: 'summary',
    title: 'Hariness | ハリネズミの健康管理アプリ',
    description:
      'ハリネズミの健康を簡単に管理。体重、食事、排泄、通院記録をこれひとつで。',
    images: ['/icon-512x512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#F8F8F0', // Background color for clean status bar (like LINE)
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // App-like feel
  viewportFit: 'cover', // Enable safe area insets on iOS
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${zenMaruGothic.variable} bg-[var(--color-background)] font-sans text-stone-700 antialiased`}
      >
        <SplashScreen>{children}</SplashScreen>
      </body>
    </html>
  );
}

