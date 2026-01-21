'use client';

import { Camera, Check, Home, Plus, Sparkles, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';

import { deleteHedgehog } from '@/app/(main)/hedgehogs/actions';
import { Button } from '@/components/ui/button';

const DEFAULT_HEDGEHOG_IMAGE = '/images/default-hedgehog.webp';
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

  action: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: ActionResponse<any> | undefined,
    formData: FormData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<ActionResponse<any>>;
  title: string;
  description: string;
  submitLabel: string;
  // 画像アップロード用（オプション）
  imageUploadSlot?: React.ReactNode;
  mode?: 'create' | 'edit' | 'onboarding';
  redirectTo?: string;
  // 1匹以上登録済みかどうか（オンボーディング時の「ホームへ」リンク表示制御用）
  hasExistingHedgehogs?: boolean;
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
  mode = 'create',
  redirectTo,
  hasExistingHedgehogs = false,
}: HedgehogFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(serverAction, initialState);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Image Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSelectImageClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (state.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((state.data as any)?.nextStep === 'next') {
        // 次の登録へ（リセットしてリロード的な挙動だが、router.refreshだとフォームが残る可能性あるので、明示的にリダイレクトorリセット）
        // ここではシンプルにページをリロードするか、入力値をクリアする
        // router.pushを使うとNext.jsのrouter cacheが効くので、window.location.hrefで強制リロードするか、
        // あるいはステートをリセットする。
        // 今回はオンボーディングの同じページに留まるため、router.refresh() + form resetが理想。
        // ただしActionStateのリセットが難しいので、強制リロードさせるのが確実。
        window.location.reload();
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/home');
      }
    }
    // Handle error logging if needed
    if (!state.success && state.error) {
      console.error(state.error);
    }
  }, [state.success, state.error, state.data, router, redirectTo]);

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
        // リダイレクト先は新たにサーバーレンダリングされるのでrefresh不要
        router.push('/home');
      }
    });
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const isOnboarding = mode === 'onboarding';

  return (
    <Card className="w-full max-w-md border-none bg-white shadow-lg">
      <form action={formAction}>
        <CardHeader className="text-center">
          {/* 画像アップロードスロットがあればそれを表示、なければデフォルトアイコン */}
          {imageUploadSlot ? (
            imageUploadSlot
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-stone-200 bg-stone-100 shadow-sm">
                <Image
                  src={previewUrl || DEFAULT_HEDGEHOG_IMAGE}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>

              <input
                ref={fileInputRef}
                id="image-upload"
                name="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={handleSelectImageClick}
              >
                <Camera className="mr-1 h-4 w-4" />
                写真を変更
              </Button>
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-[var(--color-foreground)]">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
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
            <Label htmlFor="gender">
              性別 <span className="text-red-500">*</span>
            </Label>
            <Select name="gender" required defaultValue={initialData?.gender || undefined}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男の子</SelectItem>
                <SelectItem value="female">女の子</SelectItem>
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
              className="appearance-none border border-stone-200 bg-white"
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
              className="appearance-none border border-stone-200 bg-white"
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
        <CardFooter className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-3">
            <button
              type="submit"
              name="actionType"
              value="complete"
              disabled={isPending || isDeleting}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-md transition-colors disabled:opacity-50 ${
                isOnboarding
                  ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90'
                  : 'bg-[#FFB370] hover:bg-[#FFB370]/80'
              }`}
            >
              {isPending ? '保存中...' : isOnboarding ? '登録してはじめる' : submitLabel}
              {!isPending && (isOnboarding ? <Sparkles size={18} /> : <Check size={18} />)}
            </button>

            {isOnboarding && (
              <>
                <button
                  type="submit"
                  name="actionType"
                  value="next"
                  disabled={isPending || isDeleting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-primary)] bg-white py-2.5 font-bold text-[var(--color-primary)] transition-colors hover:bg-orange-50 disabled:opacity-50"
                >
                  <Plus size={18} />
                  保存して、続けて登録する
                </button>
                <p className="text-center text-xs text-stone-500">
                  ※２匹目以降はホーム画面経由でも登録できます
                </p>
                {hasExistingHedgehogs && (
                  <Link
                    href="/home"
                    className="flex items-center justify-center gap-1 text-center text-sm text-[var(--color-primary)] hover:underline"
                  >
                    <Home size={14} />
                    登録が済んでいたらホームへ
                  </Link>
                )}
              </>
            )}
          </div>

          {!isOnboarding && initialData && (
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
            <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 duration-200">
              <div className="animate-in zoom-in-95 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl duration-200">
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-stone-900">
                    「{initialData?.name}」を削除しますか？
                  </h3>
                  <p className="text-sm text-stone-500">
                    すべてのデータが削除されます。元に戻せません。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="animate-press rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="animate-press rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-500 active:bg-red-700"
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
