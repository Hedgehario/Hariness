import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ChevronRight,
  User,
  Bell,
  ShieldAlert,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';
import { logout } from '@/app/(auth)/actions';

export default function SettingsPage() {
  const menuItems = [
    {
      title: 'プロフィール設定',
      description: 'ニックネーム、居住地などの変更',
      href: '/settings/profile',
      icon: <User className="h-5 w-5 text-[var(--color-primary)]" />,
    },
    {
      title: '通知設定',
      description: 'リマインダーや運営からのお知らせ',
      href: '/settings/notifications',
      icon: <Bell className="h-5 w-5 text-[var(--color-primary)]" />,
    },
    {
      title: 'アカウント・規約',
      description: '利用規約、退会手続きなど',
      href: '/settings/account',
      icon: <ShieldAlert className="h-5 w-5 text-gray-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24">
      {/* Header */}
      <div className="safe-area-top sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <h1 className="flex items-center gap-2 text-lg font-bold text-stone-700">
          <SettingsIcon className="h-5 w-5 text-[var(--color-primary)]" />
          設定
        </h1>
      </div>

      <div className="space-y-4 p-4">
        <p className="ml-1 text-xs text-gray-500">全般</p>
        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="mb-3 flex items-center justify-between border-none p-4 shadow-sm transition-colors hover:bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[var(--color-background)] p-2">{item.icon}</div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-700">{item.title}</h3>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-6 ml-1 text-xs text-gray-500">その他</p>
        <Card className="border-none p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-stone-700">アプリについて</h3>
          <div className="space-y-1 text-xs text-gray-500">
            <p>バージョン: 1.0.0</p>
            <div className="pt-4">
              <form action={logout}>
                <Button
                  variant="ghost"
                  className="w-full text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
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
