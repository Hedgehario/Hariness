import { Button } from "@/components/ui/button";
import { logout } from "@/app/(auth)/actions";

export default function SettingsPage() {
  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-bold mb-4">設定</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-lg shadow-sm">
             <h3 className="font-bold mb-2">アカウント</h3>
             <p className="text-sm text-gray-500 mb-4">プロフィール編集や通知設定は準備中です。</p>
             
             <form action={logout}>
                <Button variant="destructive" className="w-full">ログアウト</Button>
             </form>
        </div>
      </div>
    </div>
  );
}
