"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "../actions";

// Submit Button Component to handle pending state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "ログイン中..." : "ログイン"}
    </Button>
  );
}

const initialState = {
  error: "",
};

export default function LoginPage() {
  // useActionState is the new hook for Server Actions in React 19 / Next.js 15+
  // But wait, the user is on Next.js 16.1.1 which uses React 19 RC.
  // Note: standard hook is `useActionState` (formerly useFormState)
  // Let's implement robustly.
  
  // Wrapper to match useActionState signature expected by Next.js 16
  // But for simple cases, we can try-catch in handle submit or use simple form action if returning structured data.
  // Let's use a simple client wrapper for better control over error handling.
  
  async function clientAction(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
       alert(result.error); // Simple alert for now, or state based error
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
          <div className="text-sm text-center text-muted-foreground">
            アカウントをお持ちでない方は{" "}
            <Link href="/signup" className="text-primary hover:underline">
              新規登録
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
