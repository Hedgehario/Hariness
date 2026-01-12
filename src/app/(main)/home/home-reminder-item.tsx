'use client';

import { Check } from 'lucide-react';
import { useState, useTransition } from 'react';

import { toggleReminderComplete } from '@/app/(main)/reminders/actions';
import { cn } from '@/lib/utils';

type HomeReminderItemProps = {
  reminder: {
    id: string;
    title: string;
    time: string;
    isCompleted: boolean;
  };
};

export function HomeReminderItem({ reminder }: HomeReminderItemProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useState(reminder.isCompleted);

  const handleToggle = () => {
    const newState = !optimisticCompleted;
    setOptimisticCompleted(newState);

    startTransition(async () => {
      const result = await toggleReminderComplete(reminder.id, newState);
      if (result?.error) {
        // エラー時のみ元の状態にロールバック
        setOptimisticCompleted(!newState);
      }
      // 成功時はUI即時更新済みなのでrouter.refresh()不要
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        optimisticCompleted && 'bg-stone-50/50'
      )}
    >
      {/* Colored indicator circle */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          optimisticCompleted
            ? 'border-[#B0D67A] bg-[#B0D67A] text-white'
            : 'border-[var(--color-primary)] bg-transparent'
        )}
      >
        {optimisticCompleted && <Check className="h-3 w-3" />}
      </button>

      {/* Time */}
      <span className="w-12 shrink-0 font-mono text-sm font-bold text-stone-600">
        {reminder.time}
      </span>

      {/* Title */}
      <span
        className={cn(
          'flex-1 text-sm text-stone-600',
          optimisticCompleted && 'text-stone-400 line-through'
        )}
      >
        {reminder.title}
      </span>
    </div>
  );
}
