"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteReminder, toggleReminderComplete } from "./actions";
import { Trash2, Clock, Check, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

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
        alert("更新に失敗しました: " + result.error);
      } else {
          router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("このリマインダーを削除してもよろしいですか？")) return;

    startTransition(async () => {
      const result = await deleteReminder(reminder.id);
      if (result?.error) {
        alert("削除に失敗しました: " + result.error);
      } else {
          router.refresh();
      }
    });
  };

  return (
    <Card className={cn("p-4 flex items-center gap-4 transition-all", optimisticCompleted && "bg-gray-50 opacity-80")}>
      {/* Checkbox / Toggle */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm shrink-0",
          optimisticCompleted
            ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
            : "bg-white border-gray-300 text-transparent hover:border-[var(--color-primary)]"
        )}
      >
        <Check className="w-5 h-5" />
      </button>

      {/* Info */}
      <div className="flex-1">
        <h3 className={cn("font-bold text-lg text-stone-700", optimisticCompleted && "text-gray-400 line-through")}>
          {reminder.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{reminder.time}</span>
          {reminder.isRepeat && (
              <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                  <Bell className="w-3 h-3" />
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
        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </Card>
  );
}
