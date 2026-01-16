'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  /** L3ページ用のテキスト付きスタイル（デフォルト: true） */
  showText?: boolean;
}

/**
 * L3専用ヘッダー用の戻るボタン
 * UIデザインガイドライン Section 6 に準拠
 */
export function BackButton({ className, showText = true }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "flex items-center gap-1 rounded-full p-2 text-[#5D5D5D]/60 transition-colors hover:bg-white",
        className
      )}
    >
      <ChevronLeft size={20} />
      {showText && <span className="text-sm font-bold">戻る</span>}
    </button>
  );
}
