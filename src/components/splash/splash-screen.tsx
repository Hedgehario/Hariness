'use client';

import { useEffect, useState } from 'react';

/**
 * スプラッシュスクリーンコンポーネント
 * アプリ起動時にブランドロゴとアプリ名を表示する
 */
export function SplashScreen({ children }: { children: React.ReactNode }) {
  // 初期状態をlazy initializationで設定（sessionStorageチェック）
  const [showSplash, setShowSplash] = useState(() => {
    // SSR時はtrue、クライアント側でsessionStorageをチェック
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem('hariness_splash_shown');
  });
  const [isFading, setIsFading] = useState(false);
  const [showContent, setShowContent] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem('hariness_splash_shown');
  });

  useEffect(() => {
    // 既に表示済みの場合は何もしない
    if (!showSplash) return;

    // 最小表示時間後にフェードアウト開始
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setShowSplash(false);
        setShowContent(true);
        sessionStorage.setItem('hariness_splash_shown', 'true');
      }, 300); // フェードアウト時間
    }, 1500); // 最小表示時間

    return () => clearTimeout(timer);
  }, [showSplash]);

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
          {/* ロゴアイコン */}
          <div className="splash-fade-in mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/splash-character.webp"
              alt=""
              width={120}
              height={120}
              className="h-28 w-28 object-contain"
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
      )}

      {/* メインコンテンツ: スプラッシュ表示中は非表示 */}
      <div className={showContent ? 'opacity-100' : 'opacity-0'}>{children}</div>
    </>
  );
}
