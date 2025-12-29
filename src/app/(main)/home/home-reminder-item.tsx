"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { toggleReminderComplete } from "@/app/(main)/reminders/actions";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <Card className={cn("p-3 flex items-center gap-3 transition-colors", optimisticCompleted && "bg-gray-50 opacity-75")}>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
          optimisticCompleted
            ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
            : "bg-white border-gray-300 hover:border-[var(--color-primary)] text-transparent"
        )}
      >
        <Check className="w-3 h-3" />
      </button>
      
      <span className={cn("flex-1 font-medium text-sm text-stone-700", optimisticCompleted && "text-stone-400 line-through")}>
          {reminder.title}
      </span>
      
      <span className="text-xs text-stone-400 font-mono">
          {reminder.time}
      </span>
    </Card>
  );
}
