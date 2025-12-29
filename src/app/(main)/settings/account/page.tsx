import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteAccount } from "@/app/(auth)/actions";

const TERMS_URL = "https://example.com/terms"; // 利用規約
const PRIVACY_URL = "https://example.com/privacy"; // プライバシーポリシー

export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center gap-3 safe-area-top">
        <Link href="/settings">
             <Button variant="ghost" size="icon" className="-ml-2">
                 <ArrowLeft className="w-5 h-5 text-stone-600" />
             </Button>
        </Link>
        <h1 className="font-bold text-lg text-stone-700">アカウント・規約</h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        
        {/* Links */}
        <div className="space-y-3">
             <p className="text-xs text-gray-500 ml-1">規約・ポリシー</p>
             <a href={TERMS_URL} target="_blank" rel="noreferrer">
                <Card className="p-4 flex items-center justify-between hover:bg-stone-50 mb-3 border-none shadow-sm">
                    <span className="text-sm font-medium text-stone-700">利用規約</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                </Card>
             </a>
             <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
                <Card className="p-4 flex items-center justify-between hover:bg-stone-50 border-none shadow-sm">
                    <span className="text-sm font-medium text-stone-700">プライバシーポリシー</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                </Card>
             </a>
        </div>

        {/* Delete Account */}
        <div className="pt-8">
            <p className="text-xs text-gray-500 ml-1 mb-2">危険なエリア</p>
            <Card className="p-4 border-red-100 bg-red-50/50 shadow-sm">
                <h3 className="font-bold text-red-600 text-sm mb-2">アカウントの削除</h3>
                <p className="text-xs text-red-500 mb-4 leading-relaxed">
                    一度削除すると、登録したハリネズミのデータや記録など、すべての情報が完全に削除されます。<br/>
                    この操作は取り消すことができません。
                </p>
                <form action={deleteAccount}>
                    <Button 
                        variant="destructive" 
                        className="w-full bg-red-500 hover:bg-red-600"
                        // Note: ブラウザ標準のconfirmを使用するにはクライアントコンポーネント化が必要ですが、
                        // ここでは簡易的にサーバーアクションを直接呼ぶ形にします。
                        // 本番では <AlertDialog> 等の使用を推奨。
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        退会する
                    </Button>
                </form>
            </Card>
        </div>

      </div>
    </div>
  );
}
