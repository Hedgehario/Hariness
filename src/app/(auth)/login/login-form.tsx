'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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

import { login } from '../actions';

export function LoginForm() {
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';
  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    async (_, formData) => {
      return await login(formData);
    },
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">ログイン</CardTitle>
        <CardDescription>
          メールアドレスとパスワードを入力してログインしてください。
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {/* メール認証完了メッセージ */}
          {isVerified && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              ✅ メール認証が完了しました！ログインしてください。
            </div>
          )}
          {state?.error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              {state.error.message || 'ログインに失敗しました'}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="hedgehog@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
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
        </CardContent>
        <CardFooter className="flex w-full flex-col space-y-4">
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? 'ログイン中...' : 'ログイン'}
          </Button>
          <div className="text-muted-foreground text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              パスワードを忘れた方
            </Link>
          </div>
          <div className="text-muted-foreground text-center text-sm">
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="text-primary hover:underline">
              新規登録
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
