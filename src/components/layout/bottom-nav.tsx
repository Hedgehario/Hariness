'use client';

import { Calendar, ClipboardList, Home, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  // Hide Bottom Naivgation on Entry pages (Focus Mode)
  if (pathname.includes('/entry')) {
    return null;
  }

  const items = [
    { href: '/home', label: 'ホーム', icon: Home },
    { href: '/records', label: '記録履歴', icon: ClipboardList },
    { href: '/calendar', label: 'カレンダー', icon: Calendar },
    { href: '/map', label: 'マップ', icon: Map },
  ];

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-stone-100 bg-white">
      {/* Nav Content - fixed height for consistent design */}
      <ul className="flex items-center justify-between px-6 py-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg p-2 transition-colors',
                  isActive
                    ? 'bg-orange-50 text-[var(--color-primary)]'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <item.icon className={cn('h-6 w-6', isActive && 'fill-current')} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Safe area spacer for iPhone home indicator */}
      <div className="safe-area-bottom bg-white" />
    </nav>
  );
}
