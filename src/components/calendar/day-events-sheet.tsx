'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon, Edit2, MapPin,Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { CalendarEventDisplay, deleteEvent } from '@/app/(main)/calendar/actions';

type Props = {
  date: Date | undefined;
  events: CalendarEventDisplay[];
};

export function DayEventsSheet({ date, events }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!date)
    return <div className="py-10 text-center text-[#5D5D5D]/60">日付を選択してください</div>;

  const dateStr = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'M月d日 (E)', { locale: ja });

  const handleDelete = (id: string) => {
    if (!confirm('この予定を削除しますか？')) return;
    startTransition(async () => {
      const res = await deleteEvent(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || '削除に失敗しました');
      }
    });
  };

  const handleEdit = (id: string, type: string) => {
    if (type === 'event') {
      router.push(`/calendar/events/entry?id=${id}`);
    } else {
      // Hospital visit edit flow (V10) - not implemented fully yet, maybe just generic edit for now?
      // Spec says V10 is for input form, V11 for confirm.
      // For now, prevent editing hospital records here or route to V10 if implemented
      alert('通院記録の編集は現在開発中です');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between border-b border-[#5D5D5D]/10 pb-2">
        <h3 className="flex items-center gap-2 text-lg font-bold text-[#5D5D5D]">
          <CalendarIcon size={20} className="text-[#FFB370]" />
          {displayDate}
        </h3>
        <button
          onClick={() => router.push(`/calendar/events/entry?date=${dateStr}`)}
          className="flex items-center gap-1 rounded-full bg-[#FFB370]/10 p-2 px-3 text-xs font-bold text-[#FFB370] transition-colors hover:bg-[#FFB370]/20"
        >
          <Plus size={16} />
          予定を追加
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {events.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#5D5D5D]/40">予定はありません</div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-lg border border-[#5D5D5D]/10 bg-white p-3 shadow-sm"
            >
              <div
                className={`mt-1 h-[30px] min-w-[4px] rounded-full ${event.type === 'hospital' ? 'bg-[#FF7070]' : 'bg-[#B0D67A]'}`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="mb-0.5 block text-xs font-bold text-[#5D5D5D]/60">
                    {event.type === 'hospital' ? '通院記録' : 'イベント'}
                  </span>
                </div>
                <h4 className="text-sm leading-tight font-bold text-[#5D5D5D] md:text-base">
                  {event.title}
                </h4>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(event.id, event.type)}
                  className="rounded p-2 text-[#5D5D5D]/40 transition-colors hover:bg-[#FFB370]/5 hover:text-[#FFB370]"
                >
                  <Edit2 size={16} />
                </button>
                {event.type === 'event' && (
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="rounded p-2 text-[#5D5D5D]/40 transition-colors hover:bg-[#FF7070]/5 hover:text-[#FF7070]"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
