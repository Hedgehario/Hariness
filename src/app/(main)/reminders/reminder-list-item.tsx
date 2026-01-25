'use client';

import { Bell, Check, Clock, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOptimistic, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { deleteReminder, toggleReminderComplete } from './actions';

type ReminderItemProps = {
  reminder: {
    id: string;
    title: string;
    time: string;
    isCompleted: boolean;
    isRepeat: boolean;
    frequency?: string | null;
    daysOfWeek?: string[];
  };
  onDeleted?: () => void; // 削除後のコールバック
};

export function ReminderItem({ reminder, onDeleted }: ReminderItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    reminder.isCompleted,
    (_, newState: boolean) => newState
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggle = () => {
    const newState = !optimisticCompleted;

    startTransition(async () => {
      setOptimisticCompleted(newState);
      const result = await toggleReminderComplete(reminder.id, newState);
      if (result?.error) {
        alert('更新に失敗しました: ' + result.error.message);
      }
      // useOptimistic は失敗時に自動的にロールバックされる
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    startTransition(async () => {
      const result = await deleteReminder(reminder.id);
      if (result?.error) {
        alert('削除に失敗しました: ' + result.error);
      } else {
        // 親コンポーネントに通知してリストを更新
        onDeleted?.();
      }
    });
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <Card
        className={cn(
          'animate-press-card flex items-center gap-4 p-4',
          optimisticCompleted && 'bg-gray-50 opacity-80'
        )}
      >
        {/* Checkbox / Toggle */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-colors',
            optimisticCompleted
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-gray-300 bg-white text-transparent hover:border-[var(--color-primary)]'
          )}
        >
          <Check className="h-5 w-5" />
        </button>

        {/* Info - タップで編集画面へ */}
        <button
          type="button"
          onClick={() => router.push(`/reminders/entry?id=${reminder.id}`)}
          disabled={isPending}
          className="flex flex-1 flex-col items-start text-left"
        >
          <h3
            className={cn(
              'text-lg font-bold text-stone-700',
              optimisticCompleted && 'text-gray-400 line-through'
            )}
          >
            {reminder.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{reminder.time}</span>
            {reminder.isRepeat && (
              <span className="flex items-center gap-1 rounded-full bg-orange-100 px-1.5 py-0.5 text-xs text-orange-600">
                <Bell className="h-3 w-3" />
                毎日
              </span>
            )}
          </div>
        </button>

        {/* Delete Action */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteClick}
          disabled={isPending}
          className="text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl duration-200">
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900">
                「{reminder.title}」を削除しますか？
              </h3>
              <p className="text-sm text-stone-500">
                このリマインダーを削除します。元に戻せません。
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
                disabled={isPending}
                className="animate-press rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-500 active:bg-red-700 disabled:opacity-50"
              >
                {isPending ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
