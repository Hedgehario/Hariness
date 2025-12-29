'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F8F0] p-4">
      <Card className="w-full max-w-md space-y-6 border-red-100 bg-white/50 p-8 text-center shadow-lg backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-stone-700">エラーが発生しました</h2>
          <p className="text-sm text-gray-500">
            予期せぬエラーが発生しました。
            <br />
            もう一度お試しいただくか、時間を置いてアクセスしてください。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full rounded-full font-bold">
            再読み込みする
          </Button>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = '/')}
            className="w-full rounded-full text-stone-500"
          >
            トップページへ戻る
          </Button>
        </div>
      </Card>
    </div>
  );
}
