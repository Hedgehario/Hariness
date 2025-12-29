'use client';

import { Bell,Check, Clock, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

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
};

export function ReminderItem({ reminder }: ReminderItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useState(reminder.isCompleted);

  const handleToggle = () => {
    const newState = !optimisticCompleted;
    setOptimisticCompleted(newState); // Optimistic update

    startTransition(async () => {
      const result = await toggleReminderComplete(reminder.id, newState);
      if (result?.error) {
        // Revert on error
        setOptimisticCompleted(!newState);
        alert('更新に失敗しました: ' + result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('このリマインダーを削除してもよろしいですか？')) return;

    startTransition(async () => {
      const result = await deleteReminder(reminder.id);
      if (result?.error) {
        alert('削除に失敗しました: ' + result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <Card
      className={cn(
        'flex items-center gap-4 p-4 transition-all',
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

      {/* Info */}
      <div className="flex-1">
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
      </div>

      {/* Delete Action */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isPending}
        className="text-gray-400 hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </Card>
  );
}
