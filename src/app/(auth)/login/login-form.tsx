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

import { login } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? 'ログイン中...' : 'ログイン'}
    </Button>
  );
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">ログイン</CardTitle>
        <CardDescription>
          メールアドレスとパスワードを入力してログインしてください。
        </CardDescription>
      </CardHeader>
      <form action={clientAction}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">{error}</div>
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
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <SubmitButton />
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
