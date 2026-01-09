'use client';

import { Check, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState,useTransition } from 'react';

import { deleteHedgehog } from '@/app/(main)/hedgehogs/actions';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDeleteClick = () => {
    if (!initialData?.id) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!initialData?.id) return;
    setShowDeleteConfirm(false);

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

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
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
          <button
            type="submit"
            disabled={isPending || isDeleting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB370] py-3 font-bold text-white shadow-md transition-colors hover:bg-[#FFB370]/80 disabled:opacity-50"
          >
            {isPending ? '保存中...' : submitLabel}
            {!isPending && <Check size={18} />}
          </button>

          {initialData && (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeleting || isPending}
              className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              この子を削除する
            </button>
          )}

          {/* 削除確認モーダル（全画面オーバーレイ） */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-stone-900">「{initialData?.name}」を削除しますか？</h3>
                  <p className="text-sm text-stone-500">
                    すべてのデータが削除されます。元に戻せません。
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 active:bg-stone-100"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-500 active:bg-red-700"
                  >
                    削除する
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
