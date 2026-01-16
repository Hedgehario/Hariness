'use client';

import { AlertTriangle, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ConfirmDialogVariant = 'destructive' | 'warning';

interface ConfirmDialogProps {
  /** ダイアログを開くかどうか */
  open: boolean;
  /** 開閉状態の変更ハンドラ */
  onOpenChange: (open: boolean) => void;
  /** バリアント: destructive（赤・削除系）/ warning（オレンジ・警告系） */
  variant?: ConfirmDialogVariant;
  /** タイトル */
  title: string;
  /** 説明文 */
  description?: string;
  /** 確認ボタンのラベル */
  confirmLabel?: string;
  /** キャンセルボタンのラベル */
  cancelLabel?: string;
  /** 確認時のコールバック */
  onConfirm: () => void;
  /** キャンセル時のコールバック（省略時は閉じるだけ） */
  onCancel?: () => void;
  /** 処理中フラグ */
  isPending?: boolean;
}

/**
 * 共通確認ダイアログコンポーネント（中央ポップアップ型）
 * 
 * UIデザインガイドライン Section 4 に準拠
 * - destructive: 破壊的操作（削除、退会など）→ 赤色アクセント
 * - warning: データ消失警告（フォーム破棄など）→ オレンジ色アクセント
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  variant = 'warning',
  title,
  description,
  confirmLabel,
  cancelLabel = 'キャンセル',
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmDialogProps) {
  const isDestructive = variant === 'destructive';

  // バリアントに応じたスタイル
  const styles = {
    destructive: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      confirmLabel: confirmLabel ?? '削除する',
    },
    warning: {
      iconBg: 'bg-orange-100',
      iconColor: 'text-[#FFB370]',
      confirmBg: 'bg-[#FFB370] hover:bg-[#FFB370]/80',
      confirmLabel: confirmLabel ?? '破棄して移動',
    },
  };

  const currentStyle = styles[variant];
  const Icon = isDestructive ? AlertTriangle : Info;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // 背景クリックで閉じる
  const handleBackdropClick = () => {
    if (!isPending) {
      handleCancel();
    }
  };

  if (!open) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className="animate-in zoom-in-95 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div className="mb-4 flex flex-col items-center text-center">
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${currentStyle.iconBg}`}>
            <Icon className={`h-6 w-6 ${currentStyle.iconColor}`} />
          </div>
          <h2 className="text-lg font-bold text-stone-800">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-stone-500">{description}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            className={`flex-1 text-white ${currentStyle.confirmBg}`}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? '処理中...' : currentStyle.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
