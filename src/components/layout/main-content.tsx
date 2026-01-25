'use client';

import { usePathname } from 'next/navigation';

import { isL3Page } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // L3 (入力フォーム) ページではフッターがないため、下部の余白(pb-20)を除去する
  const isFormPage = isL3Page(pathname);

  return (
    <main
      className={cn(
        'flex-1',
        isFormPage ? 'pb-0' : 'pb-20 lg:pb-8'
      )}
    >
      {children}
    </main>
  );
}
