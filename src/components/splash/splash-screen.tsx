'use client';

import { useEffect, useState } from 'react';

/**
 * スプラッシュスクリーンコンポーネント
 * アプリ起動時にブランドロゴとアプリ名を表示する
 */
export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ実行
    setIsClient(true);

    // セッション中に既に表示済みの場合はスキップ
    if (typeof window !== 'undefined' && sessionStorage.getItem('hariness_splash_shown')) {
      setIsVisible(false);
      return;
    }

    // 最小表示時間後にフェードアウト開始
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('hariness_splash_shown', 'true');
        }
      }, 300); // フェードアウト時間
    }, 1500); // 最小表示時間

    return () => clearTimeout(timer);
  }, []);

  // サーバーサイドレンダリング時はchildrenのみ返す
  if (!isClient) {
    return <>{children}</>;
  }

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <>
      {/* スプラッシュオーバーレイ */}
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8F8F0] transition-opacity duration-300 ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
        role="presentation"
      >
        {/* ロゴアイコン */}
        <div className="splash-fade-in mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/default-hedgehog.webp"
            alt=""
            width={120}
            height={120}
            className="h-28 w-28 rounded-full object-cover shadow-lg"
          />
        </div>

        {/* アプリ名 */}
        <h1
          className="splash-fade-in-delay font-zen-maru-gothic text-3xl font-bold text-[#5D5D5D]"
          style={{ fontFamily: 'Zen Maru Gothic, sans-serif' }}
        >
          Hariness
        </h1>

        {/* ローディングドット */}
        <div className="mt-8 flex gap-2">
          <span className="splash-dot h-2 w-2 rounded-full bg-[#FFB370]" />
          <span
            className="splash-dot h-2 w-2 rounded-full bg-[#FFB370]"
            style={{ animationDelay: '0.2s' }}
          />
          <span
            className="splash-dot h-2 w-2 rounded-full bg-[#FFB370]"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>

      {/* メインコンテンツ（バックグラウンドでレンダリング） */}
      {children}
    </>
  );
}
