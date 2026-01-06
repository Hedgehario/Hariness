'use client';

import { Calendar, ClipboardList, Home, Map, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

export function SideNav() {
  const pathname = usePathname();

  const items = [
    { href: '/home', label: 'ホーム', icon: Home },
    { href: '/records', label: '記録履歴', icon: ClipboardList },
    { href: '/calendar', label: 'カレンダー', icon: Calendar },
    { href: '/map', label: 'マップ', icon: Map },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-stone-100 bg-white p-4 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
          <span className="text-lg font-bold">H</span>
        </div>
        <span className="text-xl font-bold text-stone-700">Hariness</span>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-50 text-[var(--color-primary)]'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'fill-current')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-stone-100 pt-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
        >
          <Settings className="h-5 w-5" />
          設定
        </Link>
      </div>
    </aside>
  );
}
