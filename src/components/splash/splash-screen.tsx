'use client';

import { useEffect, useState } from 'react';

/**
 * スプラッシュスクリーンコンポーネント
 * アプリ起動時にブランドロゴとアプリ名を表示する
 */
export function SplashScreen({ children }: { children: React.ReactNode }) {
  // 初期状態: スプラッシュ表示中、コンテンツは非表示
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // セッション中に既に表示済みの場合はスキップ
    const alreadyShown = sessionStorage.getItem('hariness_splash_shown');
    if (alreadyShown) {
      setShowSplash(false);
      setShowContent(true);
      return;
    }

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
          {/* ロゴアイコン */}
          <div className="splash-fade-in mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/splash-character.webp"
              alt=""
              width={160}
              height={160}
              className="h-40 w-40 object-contain"
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
      <div className={showContent ? 'opacity-100' : 'opacity-0'}>
        {children}
      </div>
    </>
  );
}

