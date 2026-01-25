'use client';

import { Calendar, ClipboardList, Home, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isL3Page } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  // Hide Bottom Navigation on L3 pages (Focus Mode)
  // Ref: Docs/Design/ui_design_guide.md Section 6
  if (isL3Page(pathname)) {
    return null;
  }

  const items = [
    { href: '/home', label: 'ホーム', icon: Home },
    { href: '/records', label: '記録履歴', icon: ClipboardList },
    { href: '/calendar', label: 'カレンダー', icon: Calendar },
    { href: '/map', label: 'マップ', icon: Map },
  ];

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-stone-200 bg-white">
      {/* Nav Content */}
      <ul className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1 transition-all active:scale-95',
                  isActive
                    ? 'text-[var(--color-primary)]' // Color only, no background
                    : 'text-stone-400 hover:text-stone-500'
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn('text-[10px]', isActive ? 'font-bold' : 'font-medium')}>
                  {item.label}
                </span>
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
