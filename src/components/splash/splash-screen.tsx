'use client';

import { useEffect, useState } from 'react';

/**
 * スプラッシュスクリーンコンポーネント
 * アプリ起動時（リロード含む）にブランドロゴとアプリ名を1.5秒表示する
 */
export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // 1.5秒後にフェードアウト開始
    const timer = setTimeout(() => {
      setIsFading(true);
      // フェードアウト完了後にスプラッシュを非表示
      setTimeout(() => {
        setShowSplash(false);
        setShowContent(true);
      }, 300);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* スプラッシュオーバーレイ */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8F8F0] transition-opacity duration-300 ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
          role="presentation"
        >
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
      )}

      {/* メインコンテンツ: スプラッシュ表示中は非表示 */}
      <div suppressHydrationWarning className={showContent ? '' : 'opacity-0'}>
        {children}
      </div>
    </>
  );
}
