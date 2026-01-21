import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SettingsBackButton } from '@/components/ui/settings-back-button';
import { Switch } from '@/components/ui/switch';

export default function NotificationSettingsPage() {
  return (
    <div className="bg-[#F8F8F0]">
      {/* L2 Back Navigation */}
      <div className="flex items-center px-4 py-3">
        <SettingsBackButton fallbackUrl="/settings" />
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
