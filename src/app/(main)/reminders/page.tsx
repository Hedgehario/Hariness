import Link from "next/link";
import { Plus } from "lucide-react";
import { getMyReminders } from "./actions";
import { ReminderItem } from "./reminder-list-item";
import { Button } from "@/components/ui/button";

export default async function RemindersPage() {
  const reminders = await getMyReminders();

  return (
    <div className="pb-24 p-4 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-700 flex items-center gap-2">
            🔔 お世話リマインダー
        </h1>
        <Link href="/reminders/entry">
            <Button size="sm" className="rounded-full px-4 shadow-sm bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90">
                <Plus className="w-4 h-4 mr-1" />
                追加
            </Button>
        </Link>
      </div>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white/50 rounded-2xl border-2 border-dashed border-stone-200 text-center min-h-[200px]">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-stone-500 font-medium mb-2">リマインダーがありません</p>
          <p className="text-sm text-stone-400 mb-6">
            ごはんや掃除の時間を登録して<br />
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
      <div className="mt-8 p-4 bg-orange-50 rounded-xl text-xs text-orange-700 leading-relaxed">
         💡 リマインダーは毎日自動的にリセットされます。<br/>
         完了チェックを入れると、その日のタスクとして記録されます。
      </div>
    </div>
  );
}
