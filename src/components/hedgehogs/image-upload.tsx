'use client';

import { Camera, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef } from 'react';

import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  hedgehogId: string;
  currentImageUrl?: string | null;
  onUpload: (formData: FormData) => Promise<{ success: boolean; data?: { imageUrl: string }; error?: { message: string } }>;
}

export function ImageUpload({ hedgehogId, currentImageUrl, onUpload }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleRemoveImage = () => {
    setImageUrl(null);
    // TODO: サーバー側で画像を削除する場合はここで呼び出し
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 画像表示エリア */}
      <div className="relative h-32 w-32 overflow-hidden rounded-full bg-stone-100">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt="ハリネズミの写真"
              fill
              className="object-cover"
              sizes="128px"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              aria-label="画像を削除"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-primary)]/10 text-5xl">
            🦔
          </div>
        )}

        {/* ローディングオーバーレイ */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
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
