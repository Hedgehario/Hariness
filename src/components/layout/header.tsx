'use client';

import { Bell, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function AppHeader() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.startsWith('/home')) return 'ホーム';
    if (path.startsWith('/records')) return '記録履歴';
    if (path.startsWith('/calendar')) return 'カレンダー';
    if (path.startsWith('/map')) return '病院マップ';
    if (path.startsWith('/settings')) return '設定';
    if (path.startsWith('/hedgehogs/new')) return '個体登録';
    if (path.startsWith('/calendar')) return 'カレンダー';
    if (path.startsWith('/reminders')) return 'お世話リマインダー';
    return 'Hariness';
  };

  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-stone-100 bg-stone-50/90 px-4 shadow-sm backdrop-blur-md">
      <h1 className="text-lg font-bold text-stone-700">{title}</h1>

      <div className="flex gap-1">
        {/* Notification Icon (P1 - Placeholder link or modal) */}
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="text-stone-400 hover:bg-orange-50 hover:text-[var(--color-primary)]"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </Link>

        {/* Settings Icon */}
        <Link href="/settings">
          <Button
            variant="ghost"
            size="icon"
            className="text-stone-400 hover:bg-orange-50 hover:text-[var(--color-primary)]"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
