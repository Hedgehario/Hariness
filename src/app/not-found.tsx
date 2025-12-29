import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F8F0] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-white/50 backdrop-blur shadow-lg border-stone-100">
        <div className="text-6xl mb-4">🦔?</div>
        
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-stone-700">ページが見つかりません</h2>
            <p className="text-sm text-gray-500">
                お探しのページは移動または削除された可能性があります。
            </p>
        </div>

        <Link href="/home">
            <Button className="w-full rounded-full font-bold mt-4">
                ホームに戻る
            </Button>
        </Link>
      </Card>
    </div>
  );
}
