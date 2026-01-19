import { Sparkles } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { SettingsBackButton } from '@/components/ui/settings-back-button';

export default function NotificationsPage() {
  // TODO: 将来的にはサーバーから通知を取得
  const notifications = [
    {
      id: 'welcome',
      type: 'welcome',
      title: 'ようこそ Hariness へ！',
      message:
        'ハリネズミちゃんの健康管理を始めましょう。毎日の記録が、大切な家族を守る第一歩です。',
      icon: Sparkles,
      iconColor: 'text-[#FFB370]',
      bgColor: 'bg-[#FFB370]/10',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      {/* L2 Back Navigation */}
      <div className="flex items-center px-4 py-3">
        <SettingsBackButton fallbackUrl="/home" />
      </div>

      <div className="mx-auto max-w-lg space-y-4 p-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <p className="text-sm">現在通知はありません</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="flex gap-4 border-none p-4 shadow-sm">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${notification.bgColor}`}
              >
                <notification.icon className={`h-5 w-5 ${notification.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-700">{notification.title}</h3>
                <p className="mt-1 text-sm text-stone-500">{notification.message}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
