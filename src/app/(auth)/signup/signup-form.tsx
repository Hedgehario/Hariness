'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';

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

import { signup } from '../actions';

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    async (_, formData) => {
      return await signup(formData);
    },
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">新規登録</CardTitle>
        <CardDescription>必要な情報を入力してアカウントを作成してください。</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              {state.error.message || '登録処理中にエラーが発生しました'}
            </div>
          )}
          {state?.success && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {state.message || '確認メールを送信しました。'}
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
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
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
          {/* 利用規約・プライバシーポリシー同意チェックボックス */}
          <div className="flex items-start gap-3 px-2">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              required
              className="mt-1 h-4 w-4 rounded border-stone-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              onInvalid={(e) => {
                const target = e.target as HTMLInputElement;
                target.setCustomValidity('利用規約への同意が必要です');
              }}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.setCustomValidity('');
              }}
            />
            <label htmlFor="agreeToTerms" className="text-muted-foreground text-xs leading-relaxed">
              <Link href="/legal/terms" className="text-primary hover:underline" target="_blank">
                利用規約
              </Link>
              と
              <Link href="/legal/privacy" className="text-primary hover:underline" target="_blank">
                プライバシーポリシー
              </Link>
              に同意します
            </label>
          </div>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? '登録中...' : 'アカウント作成'}
          </Button>
          <div className="text-muted-foreground text-center text-sm">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
