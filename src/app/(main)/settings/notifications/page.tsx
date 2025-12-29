import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24">
      {/* Header */}
      <div className="safe-area-top sticky top-0 z-10 flex items-center gap-3 border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="h-5 w-5 text-stone-600" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-stone-700">通知設定</h1>
      </div>

      <div className="mx-auto max-w-lg space-y-4 p-4">
        <Card className="space-y-6 border-none p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-stone-700">お世話リマインダー</Label>
              <p className="text-xs text-gray-500">ごはんや掃除の通知を受け取る</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-stone-700">アラート通知</Label>
              <p className="text-xs text-gray-500">体重減少などの警告通知</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-stone-700">運営からのお知らせ</Label>
              <p className="text-xs text-gray-500">新機能やメンテナンス情報</p>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>

        <p className="px-2 text-xs text-gray-400">
          ※現在、プッシュ通知機能は開発中です。設定は保存されますが、実際の通知はブラウザの設定にも依存します。
        </p>
      </div>
    </div>
  );
}
