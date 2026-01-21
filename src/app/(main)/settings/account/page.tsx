'use client';

import { AlertTriangle, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { deleteAccount } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { SettingsBackButton } from '@/components/ui/settings-back-button';

const TERMS_URL = '/legal/terms'; // 利用規約
const PRIVACY_URL = '/legal/privacy'; // プライバシーポリシー

// 退会理由の選択肢
const WITHDRAWAL_REASONS = [
  { value: 'not_using', label: 'アプリを使わなくなった' },
  { value: 'hedgehog_passed', label: 'ハリネズミが亡くなった' },
  { value: 'difficult_to_use', label: '使いづらかった' },
  { value: 'found_alternative', label: '他のアプリを使うことにした' },
  { value: 'privacy_concern', label: '個人情報が心配' },
  { value: 'other', label: 'その他' },
];

export default function AccountSettingsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFinalConfirmOpen, setIsFinalConfirmOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // モーダルが開いている時に背景のスクロールと操作を無効化
  useEffect(() => {
    if (isFinalConfirmOpen) {
      // bodyのスクロールを無効化
      document.body.style.overflow = 'hidden';
      // 背景のポインターイベントを無効化（Sheetなど）
      document.body.style.pointerEvents = 'none';

      return () => {
        // クリーンアップ
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
      };
    }
  }, [isFinalConfirmOpen]);

  const handleDeleteAccount = () => {
    if (!selectedReason) {
      setError('退会理由を選択してください');
      return;
    }

    // 二段階確認: まず最終確認ダイアログを表示
    setIsFinalConfirmOpen(true);
  };

  const handleFinalConfirm = () => {
    const reason =
      selectedReason === 'other'
        ? otherReason || 'その他'
        : WITHDRAWAL_REASONS.find((r) => r.value === selectedReason)?.label || selectedReason;

    setIsFinalConfirmOpen(false);
    setIsConfirmOpen(false);

    startTransition(async () => {
      const result = await deleteAccount(reason);
      if (result.success) {
        // 退会成功 - ログイン画面へリダイレクト
        router.push('/login');
      } else {
        setError(result.error?.message || '退会処理に失敗しました');
        // エラー時はSheetを再度開く
        setIsConfirmOpen(true);
      }
    });
  };

  return (
    <div className="bg-[#F8F8F0]">
      {/* L2 Back Navigation */}
      <div className="flex items-center px-4 py-3">
        <SettingsBackButton fallbackUrl="/settings" />
      </div>

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Links */}
        <div className="space-y-3">
          <p className="ml-1 text-xs text-gray-500">規約・ポリシー</p>
          <a href={TERMS_URL} target="_blank" rel="noreferrer">
            <Card className="mb-3 flex items-center justify-between border-none p-4 shadow-sm hover:bg-stone-50">
              <span className="text-sm font-medium text-stone-700">利用規約</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Card>
          </a>
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
            <Card className="flex items-center justify-between border-none p-4 shadow-sm hover:bg-stone-50">
              <span className="text-sm font-medium text-stone-700">プライバシーポリシー</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Card>
          </a>
        </div>

        {/* Delete Account */}
        <div className="pt-8">
          <p className="mb-2 ml-1 text-xs text-gray-500">危険なエリア</p>
          <Card className="border-red-100 bg-red-50/50 p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-bold text-red-600">アカウントの削除</h3>
            <p className="mb-4 text-xs leading-relaxed text-red-500">
              一度削除すると、登録したハリネズミのデータや記録など、すべての情報が完全に削除されます。
              <br />
              この操作は取り消すことができません。
            </p>
            <Button
              variant="destructive"
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={() => setIsConfirmOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              退会する
            </Button>
          </Card>
        </div>
      </div>

      {/* 退会確認ダイアログ */}
      <Drawer open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DrawerContent>
          <DrawerHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DrawerTitle className="text-center text-lg">本当に退会しますか？</DrawerTitle>
            <DrawerDescription className="text-center">
              退会すると、すべてのデータが完全に削除されます。
              <br />
              この操作は取り消すことができません。
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 p-4">
            {/* 退会理由選択 */}
            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">退会理由を教えてください</p>
              <div className="space-y-2">
                {WITHDRAWAL_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      selectedReason === reason.value
                        ? 'border-red-400 bg-red-50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => {
                        setSelectedReason(e.target.value);
                        setError(null);
                      }}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-stone-700">{reason.label}</span>
                  </label>
                ))}
              </div>

              {/* その他の場合のテキスト入力 */}
              {selectedReason === 'other' && (
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="具体的な理由を教えてください（任意）"
                  className="mt-3 w-full rounded-lg border border-stone-200 p-3 text-sm focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none"
                  rows={3}
                />
              )}
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <DrawerFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsConfirmOpen(false);
                setSelectedReason('');
                setOtherReason('');
                setError(null);
              }}
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={handleDeleteAccount}
              disabled={isPending || !selectedReason}
            >
              退会する
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 最終確認ダイアログ */}
      {isFinalConfirmOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 duration-200"
          style={{ pointerEvents: 'auto' }}
          onClick={() => {
            // 背景クリックで閉じる
            setIsFinalConfirmOpen(false);
          }}
          onMouseDown={(e) => {
            // マウスダウンでもイベントを止める
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            className="animate-in zoom-in-95 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl duration-200"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900">本当に退会しますか？</h3>
              <p className="text-sm text-stone-500">
                すべてのデータが完全に削除されます。
                <br />
                この操作は取り消すことができません。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFinalConfirmOpen(false);
                }}
                disabled={isPending}
                className="animate-press rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFinalConfirm();
                }}
                disabled={isPending}
                className="animate-press rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-500 active:bg-red-700 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  '退会する'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
