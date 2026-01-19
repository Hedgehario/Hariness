'use client';

import { Check } from 'lucide-react';
import { useOptimistic, useTransition } from 'react';

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
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    reminder.isCompleted,
    (_, newState: boolean) => newState
  );

  const handleToggle = () => {
    const newState = !optimisticCompleted;

    startTransition(async () => {
      setOptimisticCompleted(newState);
      await toggleReminderComplete(reminder.id, newState);
      // useOptimistic は失敗時に自動的にロールバックされる
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
