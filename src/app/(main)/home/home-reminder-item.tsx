'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { toggleReminderComplete } from '@/app/(main)/reminders/actions';
import { Card } from '@/components/ui/card';
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useState(reminder.isCompleted);

  const handleToggle = () => {
    const newState = !optimisticCompleted;
    setOptimisticCompleted(newState);

    startTransition(async () => {
      const result = await toggleReminderComplete(reminder.id, newState);
      if (result?.error) {
        setOptimisticCompleted(!newState);
        // Toast logic could go here
      } else {
        router.refresh();
      }
    });
  };

  return (
    <Card
      className={cn(
        'flex items-center gap-3 p-3 transition-colors',
        optimisticCompleted && 'bg-gray-50 opacity-75'
      )}
    >
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          optimisticCompleted
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
            : 'border-gray-300 bg-white text-transparent hover:border-[var(--color-primary)]'
        )}
      >
        <Check className="h-3 w-3" />
      </button>

      <span
        className={cn(
          'flex-1 text-sm font-medium text-stone-700',
          optimisticCompleted && 'text-stone-400 line-through'
        )}
      >
        {reminder.title}
      </span>

      <span className="font-mono text-xs text-stone-400">{reminder.time}</span>
    </Card>
  );
}
