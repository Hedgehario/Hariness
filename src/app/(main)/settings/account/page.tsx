import { ChevronLeft, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { deleteAccount } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const TERMS_URL = 'https://example.com/terms'; // 利用規約
const PRIVACY_URL = 'https://example.com/privacy'; // プライバシーポリシー

export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      {/* L2 Back Navigation */}
      <div className="flex items-center px-4 py-3">
        <Link
          href="/settings"
          className="flex items-center gap-1 rounded-full p-2 text-[#5D5D5D] hover:bg-stone-100"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-bold">戻る</span>
        </Link>
      </div>

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Links */}
        <div className="space-y-3">
          <p className="ml-1 text-xs text-gray-500">規約・ポリシー</p>
          <a href={TERMS_URL} target="_blank" rel="noreferrer">
            <Card className="mb-3 flex items-center justify-between border-none p-4 shadow-sm hover:bg-stone-50">
              <span className="text-sm font-medium text-stone-700">利用規約</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Card>
          </a>
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
            <Card className="flex items-center justify-between border-none p-4 shadow-sm hover:bg-stone-50">
              <span className="text-sm font-medium text-stone-700">プライバシーポリシー</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Card>
          </a>
        </div>

        {/* Delete Account */}
        <div className="pt-8">
          <p className="mb-2 ml-1 text-xs text-gray-500">危険なエリア</p>
          <Card className="border-red-100 bg-red-50/50 p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-bold text-red-600">アカウントの削除</h3>
            <p className="mb-4 text-xs leading-relaxed text-red-500">
              一度削除すると、登録したハリネズミのデータや記録など、すべての情報が完全に削除されます。
              <br />
              この操作は取り消すことができません。
            </p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form action={deleteAccount as any}>
              <Button
                variant="destructive"
                className="w-full bg-red-500 hover:bg-red-600"
                // Note: ブラウザ標準のconfirmを使用するにはクライアントコンポーネント化が必要ですが、
                // ここでは簡易的にサーバーアクションを直接呼ぶ形にします。
                // 本番では <AlertDialog> 等の使用を推奨。
              >
                <Trash2 className="mr-2 h-4 w-4" />
                退会する
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
