'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SettingsBackButtonProps {
  fallbackUrl?: string;
  className?: string;
}

export function SettingsBackButton({ fallbackUrl = '/home', className }: SettingsBackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push(fallbackUrl);
        }
      }}
      className={`animate-press flex items-center gap-1 text-stone-500 hover:text-stone-700 ${className}`}
    >
      <ChevronLeft size={20} />
      <span className="text-sm font-bold">戻る</span>
    </button>
  );
}
