"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/home")) return "ホーム";
    if (path.startsWith("/records")) return "健康管理";
    if (path.startsWith("/calendar")) return "カレンダー";
    if (path.startsWith("/map")) return "病院マップ";
    if (path.startsWith("/settings")) return "設定";
    if (path.startsWith("/hedgehogs/new")) return "個体登録";
    if (path.startsWith("/calendar")) return "カレンダー";
    if (path.startsWith("/reminders")) return "リマインダー";
    return "Hariness";
  };

  const title = getPageTitle(pathname);

  return (
    <header className="bg-stone-50/90 backdrop-blur-md px-4 h-14 shadow-sm flex justify-between items-center sticky top-0 z-40 border-b border-stone-100">
      <h1 className="font-bold text-lg text-stone-700">{title}</h1>
      
      <div className="flex gap-1">
         {/* Notification Icon (P1 - Placeholder link or modal) */}
         <Link href="/notifications">
            <Button variant="ghost" size="icon" className="text-stone-400 hover:text-[var(--color-primary)] hover:bg-orange-50">
                <Bell className="w-5 h-5" />
            </Button>
         </Link>

         {/* Settings Icon */}
         <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-stone-400 hover:text-[var(--color-primary)] hover:bg-orange-50">
                <Settings className="w-5 h-5" />
            </Button>
         </Link>
      </div>
    </header>
  );
}
