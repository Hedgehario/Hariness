"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Calendar, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/home", label: "ホーム", icon: Home },
    { href: "/records", label: "記録履歴", icon: ClipboardList },
    { href: "/hospital", label: "カレンダー", icon: Calendar },
    { href: "/map", label: "マップ", icon: Map },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 py-2 px-6 safe-area-bottom z-50">
      <ul className="flex justify-between items-center">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  isActive
                    ? "text-[var(--color-primary)] bg-orange-50"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
