'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActionResponse } from '@/types/actions';

import { updatePasswordAction } from '../actions';

export function ResetPasswordForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    async (_, formData) => {
      return await updatePasswordAction(formData);
    },
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000); // 2秒後に遷移（成功メッセージを見せるため）
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">新しいパスワードを設定</CardTitle>
        <CardDescription>
          新しいパスワードを入力してください。8文字以上で設定してください。
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              {state.error.message || 'エラーが発生しました。'}
            </div>
          )}
          {state?.success && (
            <div className="rounded-md bg-green-100 p-3 text-sm text-green-700">
              {state.message || 'パスワードを更新しました。'}
              <div className="mt-2">
                <Link href="/login" className="text-primary font-medium hover:underline">
                  ログイン画面へ
                </Link>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">新しいパスワード</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex w-full flex-col space-y-4">
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? '更新中...' : 'パスワードを更新'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
