'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Cake, Calendar as CalendarIcon, Edit2, Plus, Stethoscope, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { CalendarEventDisplay, deleteEvent } from '@/app/(main)/calendar/actions';

type Props = {
  date: Date | undefined;
  events: CalendarEventDisplay[];
  onDeleted: () => void;
};

export function DayEventsSheet({ date, events, onDeleted }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  if (!date)
    return <div className="py-10 text-center text-[#5D5D5D]/60">日付を選択してください</div>;

  const dateStr = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'M月d日 (E)', { locale: ja });

  // 削除ボタンクリック時：確認モーダルを表示
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
  };

  // 削除実行
  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;

    startTransition(async () => {
      const res = await deleteEvent(id);
      if (res.success) {
        setDeleteTargetId(null);
        // router.refresh()不要 - onDeletedで親コンポーネントが更新
        onDeleted();
      } else {
        alert(res.error || '削除に失敗しました');
        setDeleteTargetId(null);
      }
    });
  };

  const handleEdit = (id: string, type: string) => {
    if (type === 'event') {
      router.push(`/calendar/events/entry?id=${id}`);
    } else if (type === 'hospital') {
      router.push(`/hospital/entry?id=${id}`);
    } else {
      // hospital-planned should technically go to the source record too, but it's handled by main click
    }
  };

  const handleEventClick = (event: CalendarEventDisplay) => {
    if (event.type === 'hospital') {
      router.push(`/hospital/entry?id=${event.id}`);
    } else if (event.type === 'hospital-planned') {
      // "planned-{id}" -> "{id}"
      const originalId = event.id.replace('planned-', '');
      router.push(`/hospital/entry?id=${originalId}`);
    } else if (event.type === 'event') {
      router.push(`/calendar/events/entry?id=${event.id}`);
    }
  };

  // 削除対象のイベントタイトルを取得（表示用）
  const targetEvent = events.find((e) => e.id === deleteTargetId);

  return (
    <div className="relative flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between border-b border-[#5D5D5D]/10 pb-2">
        <h3 className="flex items-center gap-2 text-lg font-bold text-[#5D5D5D]">
          <CalendarIcon size={20} className="text-[#FFB370]" />
          {displayDate}
        </h3>
        <button
          onClick={() => router.push(`/calendar/events/entry?date=${dateStr}`)}
          className="flex items-center gap-1 rounded-full bg-[#FFB370] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#FFB370]/80"
        >
          <Plus size={14} />
          イベントを追加
        </button>
      </div>

      <div className="pb-safe flex-1 space-y-3 overflow-y-auto">
        {events.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#5D5D5D]/40">イベントはありません</div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="group flex items-start gap-3 rounded-lg border border-[#5D5D5D]/10 bg-white p-3 shadow-sm transition-colors hover:bg-stone-50"
            >
              <div
                className={`mt-1 h-[30px] min-w-[4px] rounded-full ${
                  event.type === 'hospital'
                    ? 'bg-[#4DB6AC]' // Past Visit: Teal
                    : event.type === 'hospital-planned'
                      ? 'bg-[#60A5FA]' // Planned Visit: Blue
                      : event.type === 'birthday'
                        ? 'bg-[#FFB370]'
                        : 'bg-[#FF8FA3]'
                }`}
              />
              {/* Clickable Content Area */}
              <div className="flex-1 cursor-pointer" onClick={() => handleEventClick(event)}>
                <div className="flex items-center justify-between">
                  <span className="mb-0.5 block text-xs font-bold text-[#5D5D5D]/60">
                    {event.type === 'hospital'
                      ? '通院記録'
                      : event.type === 'hospital-planned'
                        ? '通院予定'
                        : event.type === 'birthday'
                          ? '誕生日'
                          : 'イベント'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {event.type === 'birthday' && (
                    <Cake size={16} className="shrink-0 text-[#FFB370]" />
                  )}
                  {event.type === 'hospital' && (
                    <Stethoscope size={16} className="shrink-0 text-[#4DB6AC]" />
                  )}
                  {event.type === 'hospital-planned' && (
                    <Stethoscope size={16} className="shrink-0 text-[#60A5FA]" />
                  )}
                  <h4 className="text-sm leading-tight font-bold text-[#5D5D5D] md:text-base">
                    {event.title}
                  </h4>
                </div>
              </div>
              <div className="flex gap-1">
                {/* 誕生日は編集・削除不可 */}
                {/* 通院（記録・予定）はクリックで遷移するのでボタン不要 */}
                {event.type === 'event' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleEdit(event.id, event.type);
                      }}
                      className="rounded p-2 text-[#5D5D5D]/40 transition-colors hover:bg-[#FFB370]/5 hover:text-[#FFB370]"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleDeleteClick(event.id);
                      }}
                      className="rounded p-2 text-[#5D5D5D]/40 transition-colors hover:bg-[#FF7070]/5 hover:text-[#FF7070]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 削除確認モーダル */}
      {deleteTargetId && (
        <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl duration-200">
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900">イベントを削除しますか？</h3>
              {targetEvent && (
                <p className="mb-2 text-sm font-medium text-stone-700">「{targetEvent.title}」</p>
              )}
              <p className="text-sm text-stone-500">この操作は元に戻せません。</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={isPending}
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
    </div>
  );
}
