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
    description: 'ハリネズミの健康を簡単に管理。体重、食事、排泄、通院記録をこれひとつで。',
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
      <head>
        {/* 初期スプラッシュ用インラインCSS - JSロード前から表示 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* 初期スプラッシュ（JSロード前に表示） */
              .initial-splash {
                position: fixed;
                inset: 0;
                z-index: 9998;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: #F8F8F0;
              }

              .initial-splash h1 {
                margin-top: 24px;
                font-size: 1.875rem;
                font-weight: 700;
                color: #5D5D5D;
                font-family: 'Zen Maru Gothic', sans-serif;
                animation: splash-fade-in 0.5s ease-out 0.2s backwards;
              }
              .initial-splash .dots {
                margin-top: 32px;
                display: flex;
                gap: 8px;
              }
              .initial-splash .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #FFB370;
                animation: splash-dot 1.4s ease-in-out infinite;
              }
              .initial-splash .dot:nth-child(2) { animation-delay: 0.2s; }
              .initial-splash .dot:nth-child(3) { animation-delay: 0.4s; }
              @keyframes splash-fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes splash-dot {
                0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                40% { opacity: 1; transform: scale(1); }
              }
              /* JSロード後に非表示 */
              .js-loaded .initial-splash {
                display: none;
              }
            `,
          }}
        />
      </head>
      <body
        className={`${zenMaruGothic.variable} bg-[var(--color-background)] font-sans text-stone-700 antialiased`}
      >
        {/* 初期スプラッシュ（JSロード前に表示、ロード後は非表示） */}
        <div className="initial-splash" aria-hidden="true">
          <h1>Hariness</h1>
          <div className="dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>

        <SplashScreen>{children}</SplashScreen>

        {/* JSロード完了時にhtmlにクラスを追加して初期スプラッシュを非表示 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js-loaded');`,
          }}
        />
      </body>
    </html>
  );
}
