'use client';

import { Camera, Loader2, Trash2,X } from 'lucide-react';
import Image from 'next/image';
import { useRef,useState } from 'react';

import { Button } from '@/components/ui/button';

import { ActionResponse } from '@/types/actions';

interface ImageUploadProps {
  hedgehogId: string;
  currentImageUrl?: string | null;
  onUpload: (formData: FormData) => Promise<ActionResponse<{ imageUrl: string }>>;
  onDelete?: () => Promise<ActionResponse>;
}

export function ImageUpload({ hedgehogId, currentImageUrl, onUpload, onDelete }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // 削除確認用state
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await onUpload(formData);

      if (result.success && result.data?.imageUrl) {
        setImageUrl(result.data.imageUrl);
      } else {
        setError(result.error?.message || 'アップロードに失敗しました');
      }
    } catch {
      setError('アップロード中にエラーが発生しました');
    } finally {
      setIsUploading(false);
      // ファイル入力をリセット（同じファイルを再選択可能に）
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setError(null);
    setIsUploading(true);

    try {
      if (onDelete) {
        const result = await onDelete();
        if (result.success) {
          setImageUrl(null);
        } else {
          setError(result.error?.message || '画像の削除に失敗しました');
        }
      } else {
        setImageUrl(null);
      }
    } catch {
      setError('画像の削除中にエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 画像表示エリア（コンテナ） */}
      <div className="relative h-32 w-32">
        <div className="relative h-32 w-32 overflow-hidden rounded-full bg-stone-100 shadow-sm border border-stone-200">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="ハリネズミの写真"
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-primary)]/10 text-5xl">
              🦔
            </div>
          )}

          {/* ローディングオーバーレイ */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* 削除確認モーダル（全画面オーバーレイ） */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
              <div className="mb-4 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-stone-900">画像を削除しますか？</h3>
                <p className="text-sm text-stone-500">
                  プロフィール画像を削除します。元に戻せません。
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

        {/* 削除ボタン（画像がある時のみ表示・右上に配置） */}
        {imageUrl && !isUploading && !showDeleteConfirm && (
          <button
            type="button"
            onClick={handleRemoveClick}
            className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 shadow-md transition-transform hover:scale-110 z-50 border-2 border-white"
            aria-label="画像を削除"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ファイル選択ボタン */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        id={`image-upload-${hedgehogId}`}
      />
      <label htmlFor={`image-upload-${hedgehogId}`}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          disabled={isUploading}
          asChild
        >
          <span>
            {isUploading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                アップロード中...
              </>
            ) : (
              <>
                <Camera className="mr-1 h-4 w-4" />
                写真を変更
              </>
            )}
          </span>
        </Button>
      </label>

      {/* エラーメッセージ */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
