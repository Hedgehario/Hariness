import { ChevronLeft, Inbox, Lightbulb, Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { getMyReminders } from './actions';
import { ReminderItem } from './reminder-list-item';

export default async function RemindersPage() {
  const reminders = await getMyReminders();

  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      {/* L2 Back Navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href="/home"
          className="flex items-center gap-1 rounded-full p-2 text-[#5D5D5D] hover:bg-stone-100"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-bold">戻る</span>
        </Link>

        <Link href="/reminders/entry">
          <Button
            size="sm"
            className="gap-1 rounded-full bg-[#FFB370] px-4 text-white shadow-md hover:bg-[#FFB370]/80"
          >
            <Plus className="h-4 w-4" />
            追加
          </Button>
        </Link>
      </div>

      <div className="p-4 pt-0">
        {reminders.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-white/50 p-8 text-center">
            <Inbox className="mb-4 h-12 w-12 text-stone-300" />
            <p className="mb-2 font-medium text-stone-500">リマインダーがありません</p>
            <p className="mb-6 text-sm text-stone-400">
              ごはんや掃除の時間を登録して
              <br />
              忘れずにお世話しましょう
            </p>
            <Link href="/reminders/entry">
              <Button variant="outline" className="rounded-full">
                リマインダーを追加する
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <ReminderItem key={reminder.id} reminder={reminder} />
            ))}
          </div>
        )}

        {/* 追加情報 */}
        <div className="mt-8 flex items-start gap-2 rounded-xl bg-orange-50 p-4 text-xs leading-relaxed text-orange-700">
          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            リマインダーは毎日自動的にリセットされます。
            <br />
            <br />
            完了チェックを入れると、その日のタスクとして記録されます。
          </span>
        </div>
      </div>
    </div>
  );
}
