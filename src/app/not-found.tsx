import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F8F0] p-4">
      <Card className="w-full max-w-md space-y-6 border-stone-100 bg-white/50 p-8 text-center shadow-lg backdrop-blur">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-stone-700">ページが見つかりません</h2>
          <p className="text-sm text-gray-500">
            お探しのページは移動または削除された可能性があります。
          </p>
        </div>

        <Link href="/home">
          <Button className="mt-4 w-full rounded-full font-bold">ホームに戻る</Button>
        </Link>
      </Card>
    </div>
  );
}
