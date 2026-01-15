'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

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

import { resetPasswordAction } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? '送信中...' : 'リセットメールを送信'}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    setError(null);
    setMessage(null);
    const result = await resetPasswordAction(formData);
    if (result.success) {
      setMessage(result.message || 'メールを送信しました。');
    } else {
      setError(result.error?.message || 'エラーが発生しました。');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">パスワードをお忘れの方</CardTitle>
        <CardDescription>
          登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
        </CardDescription>
      </CardHeader>
      <form action={clientAction}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">{error}</div>
          )}
          {message && (
            <div className="bg-green-100 text-green-700 rounded-md p-3 text-sm">{message}</div>
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
          <SubmitButton />
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
