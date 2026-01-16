'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SettingsBackButtonProps {
  fallbackUrl?: string;
}

export function SettingsBackButton({ fallbackUrl = '/home' }: SettingsBackButtonProps) {
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
      className="flex items-center gap-1 rounded-full p-2 text-[#5D5D5D] hover:bg-stone-100"
    >
      <ChevronLeft size={20} />
      <span className="text-sm font-bold">戻る</span>
    </button>
  );
}
