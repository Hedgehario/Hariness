"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-[#F8F8F0] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-white/50 backdrop-blur shadow-lg border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-stone-700">エラーが発生しました</h2>
            <p className="text-sm text-gray-500">
                予期せぬエラーが発生しました。<br/>
                もう一度お試しいただくか、時間を置いてアクセスしてください。
            </p>
        </div>

        <div className="flex flex-col gap-3">
            <Button 
                onClick={() => reset()}
                className="w-full rounded-full font-bold"
            >
                再読み込みする
            </Button>
            <Button
                variant="ghost"
                onClick={() => window.location.href = "/"}
                className="w-full rounded-full text-stone-500"
            >
                トップページへ戻る
            </Button>
        </div>
      </Card>
    </div>
  );
}
