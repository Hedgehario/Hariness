'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';

import { updateProfile } from '@/app/(auth)/actions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 初期状態の型定義
const initialState = {
  error: '',
  success: false as boolean | string,
};

export default function ProfileOnboardingPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    // FormDataから値を取り出し、オブジェクトに変換してからupdateProfileに渡す
    const data = {
      displayName: formData.get('displayName') as string,
      gender: (formData.get('gender') as 'male' | 'female' | 'unknown') || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ageGroup: (formData.get('ageGroup') as any) || undefined,
      prefecture: (formData.get('prefecture') as string) || undefined,
    };

    // Server Action呼び出し
    const result = await updateProfile(data);

    if (result.error) {
      return { ...prevState, error: result.error, success: false };
    }

    return { ...prevState, error: '', success: true };
  }, initialState);

  // 成功時の画面遷移
  useEffect(() => {
    if (state.success) {
      // 次のステップへ（ハリネズミ登録）
      router.push('/hedgehogs/new');
    }
  }, [state.success, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 p-3 text-3xl text-[var(--color-primary)]">
            👤
          </div>
          <CardTitle className="text-2xl font-bold text-[var(--color-foreground)]">
            プロフィール登録
          </CardTitle>
          <CardDescription>
            飼い主さんの情報を教えてください。
            <br />
            この情報は後から変更できます。
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">
                ニックネーム <span className="text-red-500">*</span>
              </Label>
              <Input
                id="displayName"
                name="displayName"
                placeholder="ハリ飼い太郎"
                required
                maxLength={50}
                className="bg-white"
              />
              <p className="text-xs text-stone-500">アプリ内で表示される名前です。</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">性別</Label>
              <Select name="gender">
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="unknown">回答しない</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageGroup">年代</Label>
              <Select name="ageGroup">
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10s">10代</SelectItem>
                  <SelectItem value="20s">20代</SelectItem>
                  <SelectItem value="30s">30代</SelectItem>
                  <SelectItem value="40s">40代</SelectItem>
                  <SelectItem value="50s">50代</SelectItem>
                  <SelectItem value="60_over">60代以上</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prefecture">居住地</Label>
              <Select name="prefecture">
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contents_unnecessary">今回は省略</SelectItem>
                  {/* 簡易的に主要な選択肢のみ実装、実際は47都道府県リストを入れるべき */}
                  <SelectItem value="tokyo">東京都</SelectItem>
                  <SelectItem value="osaka">大阪府</SelectItem>
                  <SelectItem value="others">その他</SelectItem>
                  <SelectItem value="overseas">海外</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {state.error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full rounded-full py-6 text-lg font-bold shadow-md transition-all hover:shadow-lg"
              disabled={isPending}
            >
              {isPending ? '保存中...' : '次へ進む (ハリネズミ登録)'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
