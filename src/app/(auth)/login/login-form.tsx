'use client';

import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  async function clientAction(formData: FormData) {
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error.message || 'ログインに失敗しました');
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
