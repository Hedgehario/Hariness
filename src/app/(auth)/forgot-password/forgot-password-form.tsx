'use client';

import Link from 'next/link';
import { useActionState } from 'react';

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

import { resetPasswordAction } from '../actions';

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    async (_, formData) => {
      return await resetPasswordAction(formData);
    },
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">パスワードをお忘れの方</CardTitle>
        <CardDescription>
          登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
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
              {state.message || 'メールを送信しました。'}
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
        </CardContent>
        <CardFooter className="flex w-full flex-col space-y-4">
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? '送信中...' : 'リセットメールを送信'}
          </Button>
          <div className="text-muted-foreground text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              ログイン画面に戻る
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
