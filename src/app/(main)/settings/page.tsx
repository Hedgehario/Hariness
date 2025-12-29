import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, User, Bell, ShieldAlert, LogOut, Settings as SettingsIcon } from "lucide-react";
import { logout } from "@/app/(auth)/actions";

export default function SettingsPage() {
  const menuItems = [
    {
      title: "プロフィール設定",
      description: "ニックネーム、居住地などの変更",
      href: "/settings/profile",
      icon: <User className="w-5 h-5 text-[var(--color-primary)]" />,
    },
    {
      title: "通知設定",
      description: "リマインダーや運営からのお知らせ",
      href: "/settings/notifications",
      icon: <Bell className="w-5 h-5 text-[var(--color-primary)]" />,
    },
    {
      title: "アカウント・規約",
      description: "利用規約、退会手続きなど",
      href: "/settings/account",
      icon: <ShieldAlert className="w-5 h-5 text-gray-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24">
       {/* Header */}
       <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between safe-area-top">
        <h1 className="font-bold text-lg text-stone-700 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[var(--color-primary)]" />
          設定
        </h1>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-xs text-gray-500 ml-1">全般</p>
        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors border-none shadow-sm mb-3">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-background)] rounded-full">
                        {item.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-stone-700 text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-gray-300" />
              </Card>
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-500 ml-1 mt-6">その他</p>
        <Card className="p-4 border-none shadow-sm">
            <h3 className="font-bold text-stone-700 text-sm mb-2">アプリについて</h3>
            <div className="text-xs text-gray-500 space-y-1">
                <p>バージョン: 1.0.0</p>
                <div className="pt-4">
                    <form action={logout}>
                        <Button variant="ghost" className="w-full text-red-500 text-sm hover:text-red-600 hover:bg-red-50">
                            <LogOut className="w-4 h-4 mr-2" />
                            ログアウト
                        </Button>
                    </form>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
