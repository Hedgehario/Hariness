'use client';

import { Camera, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useTransition } from 'react';

import { deleteHedgehog } from '@/app/(main)/hedgehogs/actions';
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
import { Textarea } from '@/components/ui/textarea';
import { ActionResponse } from '@/types/actions';

type HedgehogFormProps = {
  initialData?: {
    id: string;
    name: string;
    gender?: 'male' | 'female' | 'unknown';
    birth_date?: string | null;
    welcome_date?: string | null;
    features?: string | null;
    insurance_number?: string | null;
    image_url?: string | null;
  };
  action: (prevState: ActionResponse | undefined, formData: FormData) => Promise<ActionResponse>;
  title: string;
  description: string;
  submitLabel: string;
  // 画像アップロード用（オプション）
  imageUploadSlot?: React.ReactNode;
};

const initialState: ActionResponse = {
  success: false,
  error: undefined,
};

export function HedgehogForm({
  initialData,
  action: serverAction,
  title,
  description,
  submitLabel,
  imageUploadSlot,
}: HedgehogFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(serverAction, initialState);
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (state.success) {
      router.push('/home');
      router.refresh();
    }
    // Handle error logging if needed
    if (!state.success && state.error) {
      console.error(state.error);
    }
  }, [state.success, state.error, router]);

  const handleDelete = () => {
    if (!initialData?.id) return;
    if (!confirm('本当に削除しますか？この操作は取り消せません。')) return;

    startDeleteTransition(async () => {
      const result = await deleteHedgehog(initialData.id);
      if (result.error) {
        alert(result.error);
      } else {
        router.push('/home');
        router.refresh();
      }
    });
  };

  return (
    <Card className="w-full max-w-md border-none bg-white shadow-lg">
      <CardHeader className="text-center">
        {/* 画像アップロードスロットがあればそれを表示、なければデフォルトアイコン */}
        {imageUploadSlot ? (
          imageUploadSlot
        ) : initialData?.image_url ? (
          <div className="relative mx-auto mb-2 h-20 w-20 overflow-hidden rounded-full">
            <Image
              src={initialData.image_url}
              alt={initialData.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 p-3 text-3xl text-[var(--color-primary)]">
            🦔
          </div>
        )}
        <CardTitle className="text-2xl font-bold text-[var(--color-foreground)]">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* 名前 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              お名前 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="ハリー"
              required
              maxLength={50}
              className="bg-white"
              defaultValue={initialData?.name}
            />
          </div>

          {/* 性別 */}
          <div className="space-y-2">
            <Label htmlFor="gender">性別</Label>
            <Select name="gender" defaultValue={initialData?.gender || undefined}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男の子 (オス)</SelectItem>
                <SelectItem value="female">女の子 (メス)</SelectItem>
                <SelectItem value="unknown">不明</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 生年月日 */}
          <div className="space-y-2">
            <Label htmlFor="birthDate">生年月日 (推定可)</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              className="bg-white"
              defaultValue={initialData?.birth_date || ''}
            />
          </div>

          {/* お迎え日 */}
          <div className="space-y-2">
            <Label htmlFor="welcomeDate">お迎えした日</Label>
            <Input
              id="welcomeDate"
              name="welcomeDate"
              type="date"
              className="bg-white"
              defaultValue={initialData?.welcome_date || ''}
            />
          </div>

          {/* 見た目の特徴 */}
          <div className="space-y-2">
            <Label htmlFor="features">特徴・カラー</Label>
            <Textarea
              id="features"
              name="features"
              placeholder="シナモン、ソルト＆ペッパーなど"
              maxLength={200}
              className="resize-none bg-white"
              defaultValue={initialData?.features || ''}
            />
          </div>

          {/* 保険番号 */}
          <div className="space-y-2">
            <Label htmlFor="insuranceNumber">ペット保険番号</Label>
            <Input
              id="insuranceNumber"
              name="insuranceNumber"
              placeholder="任意入力"
              maxLength={50}
              className="bg-white"
              defaultValue={initialData?.insurance_number || ''}
            />
          </div>

          {!state.success && state.error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {state.error.message || 'エラーが発生しました'}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full rounded-full py-6 text-lg font-bold shadow-md transition-all hover:shadow-lg"
            disabled={isPending || isDeleting}
          >
            {isPending ? '保存中...' : submitLabel}
          </Button>

          {initialData && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isPending}
              className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              この個体を削除する
            </button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
